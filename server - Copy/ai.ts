import { GoogleGenAI, Type } from '@google/genai';
import { FashionItem, UserProfile } from './types.ts';
import { FASHION_CATALOG } from './catalog.ts';

const apiKey = process.env.GEMINI_API_KEY;
const hasValidApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10);

const ai = hasValidApiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function timeoutPromise<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
}

export async function consultAiStylist(params: {
  prompt: string;
  userProfile?: Partial<UserProfile>;
  wardrobeItems?: FashionItem[];
}) {
  const { prompt, userProfile, wardrobeItems = [] } = params;

  if (hasValidApiKey && ai) {
    const catalogSummary = FASHION_CATALOG.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      gender: c.gender,
      color: c.color,
      style: c.style,
      occasion: c.occasion,
      price: c.price,
      image: c.image,
    }));

    const userContext = userProfile
      ? `
User Profile:
- Age: ${userProfile.age ?? '25'}
- Gender preference: ${userProfile.gender ?? 'All'}
- Preferred style: ${userProfile.preferredStyle ?? 'Minimalist / Old Money'}
- Favorite colors: ${(userProfile.favouriteColours ?? []).join(', ') || 'Neutral earthy tones'}
- Fashion priorities: ${(userProfile.fashionPreferences ?? []).join(', ') || 'Tailored, Comfort'}
- Comfort preferences: ${userProfile.comfortPreferences ?? 'Breathable relaxed fits'}
- Preferred occasions: ${(userProfile.preferredOccasions ?? []).join(', ') || 'Everyday chic'}
`
      : 'User Profile: General luxury fashion client.';

    const wardrobeContext = wardrobeItems.length > 0
      ? `User already owns in digital wardrobe: ${wardrobeItems.map((w) => w.name + ' (' + w.category + ')').join(', ')}`
      : 'User wardrobe is currently fresh.';

    const systemInstruction = `
You are the Haute Stylist for "ELIZEE", a world-class AI personal styling and fashion platform.
Your expertise spans modern menswear and womenswear, old money / quiet luxury aesthetics, contemporary streetwear, elegant formalwear, Indo-Western fusion, and everyday casual sophistication.

Guidelines:
1. Provide personalized, deeply knowledgeable fashion guidance.
2. Consider the user's age, body silhouette, comfort preferences, and favorite color palette.
3. When recommending outfits, structure complete head-to-toe combinations (Tops/Shirts, Pants/Bottoms, Shoes/Heels, Sunglasses/Accessories/Watches/Jewelry).
4. For each outfit recommendation, explicitly explain WHY the combination works (proportions, color balance, texture synergy, silhouette rule).
5. Whenever possible, link recommended pieces to matching items available in the ELIZEE catalog.
Available catalog items to reference:
${JSON.stringify(catalogSummary.slice(0, 30))}
`;

    try {
      const response = await timeoutPromise(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `
User Question/Styling Request: "${prompt}"

${userContext}
${wardrobeContext}

Please provide an inspiring, highly professional styling consultation with concrete outfit suggestions.
`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                consultationText: {
                  type: Type.STRING,
                  description: 'Conversational, warm, and sophisticated stylist response addressing the question directly.',
                },
                outfits: {
                  type: Type.ARRAY,
                  description: '1 to 3 complete outfit recommendations tailored to the request.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: 'Creative name for this outfit look' },
                      occasion: { type: Type.STRING, description: 'Suitable occasion (e.g. College, Work, Date Night, Festive)' },
                      vibe: { type: Type.STRING, description: 'The stylistic vibe (e.g. Quiet Luxury, Parisian Casual, Indo-Western Chic)' },
                      explanation: { type: Type.STRING, description: 'Why this outfit combination works (color theory, balance, texture)' },
                      pieces: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            category: { type: Type.STRING, description: 'Clothing category (Shirts, Pants, Shoes, Accessories, etc.)' },
                            description: { type: Type.STRING, description: 'Specific piece recommendation with styling advice' },
                            suggestedColor: { type: Type.STRING, description: 'Color recommendation' },
                            matchingCatalogItemId: { type: Type.STRING, description: 'ID from catalog if matched, else empty' },
                          },
                          required: ['category', 'description'],
                        },
                      },
                      stylingTips: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Specific micro-styling tips (e.g. French tuck, cuffing trousers, jewelry layering)',
                      },
                      colorPalette: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Color hex or names in this look (e.g. ["#D8CBB9", "#1B263B", "#FFFFFF"])',
                      },
                    },
                    required: ['name', 'occasion', 'vibe', 'explanation', 'pieces', 'stylingTips', 'colorPalette'],
                  },
                },
              },
              required: ['consultationText', 'outfits'],
            },
          },
        }),
        4500,
        'Gemini API timeout'
      );

      const parsed = JSON.parse(response.text || '{}');

      // Enrich outfits with matching catalog items
      if (parsed.outfits && Array.isArray(parsed.outfits)) {
        parsed.outfits.forEach((outfit: any) => {
          if (outfit.pieces && Array.isArray(outfit.pieces)) {
            outfit.pieces.forEach((piece: any) => {
              if (piece.matchingCatalogItemId) {
                const matched = FASHION_CATALOG.find((c) => c.id === piece.matchingCatalogItemId);
                if (matched) {
                  piece.matchingCatalogItem = matched;
                }
              } else {
                // Try to match by category
                const fuzzy = FASHION_CATALOG.find((c) =>
                  c.category.toLowerCase() === piece.category.toLowerCase() ||
                  piece.description.toLowerCase().includes(c.name.toLowerCase())
                );
                if (fuzzy) {
                  piece.matchingCatalogItem = fuzzy;
                }
              }
            });
          }
        });
      }

      if (parsed.consultationText && Array.isArray(parsed.outfits) && parsed.outfits.length > 0) {
        return parsed;
      }
    } catch (error: any) {
      console.warn('Gemini Stylist fallback activated (Reason:', error.message || error, ')');
    }
  }

  // Dynamic High-Fidelity Fashion Advisory Engine
  return getDynamicStylingAdvice(prompt, userProfile, wardrobeItems);
}

export async function analyzeOutfitWithCamera(params: {
  imageBase64: string;
  mimeType: string;
  userNotes?: string;
  userProfile?: Partial<UserProfile>;
}) {
  const { imageBase64, mimeType = 'image/jpeg', userNotes = '', userProfile } = params;

  if (hasValidApiKey && ai) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await timeoutPromise(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `
Analyze this clothing/outfit item from our user.
User notes: "${userNotes}"
User Age: ${userProfile?.age || '20s-30s'}, Style preference: ${userProfile?.preferredStyle || 'Modern Elegance'}.

Please provide a deep fashion analysis including:
1. Identified items and dominant aesthetic
2. Complementary matching fashion items (what shirts, pants, shoes, bags to pair with this)
3. Suitable accessories (eyewear, watches, necklaces, earrings, scarves)
4. Alternative outfit combinations (how to transform this from day to night, casual to smart)
5. Color combinations and color theory that harmonize with this item
6. Practical styling improvements (fit adjustments, tucking, layering, sleeve rolls)
7. Category tag matching one of our store categories: Shirts, T-Shirts, Pants, Jeans, Shorts, Dresses, Tops, Sunglasses, Bags, Shoes, Heels, Slippers, Accessories, Watches, Necklaces, Earrings, Bracelets.
`,
              },
            ],
          },
          config: {
            systemInstruction: 'You are ELIZEE fashion intelligence. Analyze user outfits with exquisite fashion acumen, color harmony, and practical elevating advice.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                identifiedItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Garments and accessories detected in the image',
                },
                vibe: { type: Type.STRING, description: 'Aesthetic mood (e.g. Minimalist Casual, Modern Formal, Street Chic)' },
                detectedCategory: { type: Type.STRING, description: 'Primary clothing category' },
                primaryColors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Colors found in the item',
                },
                matchingItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Top complementary fashion items to pair with this piece',
                },
                suitableAccessories: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Matching watches, bags, jewelry, and sunglasses',
                },
                alternativeCombinations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Styling variations across different times and occasions',
                },
                colorCombinations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Harmonious color combinations',
                },
                stylingImprovements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Micro-styling tips to immediately elevate this look',
                },
              },
              required: [
                'identifiedItems',
                'vibe',
                'detectedCategory',
                'primaryColors',
                'matchingItems',
                'suitableAccessories',
                'alternativeCombinations',
                'colorCombinations',
                'stylingImprovements',
              ],
            },
          },
        }),
        4500,
        'Camera analysis timeout'
      );

      const parsed = JSON.parse(response.text || '{}');

      // Find matching items in catalog
      const matchedCatalog = FASHION_CATALOG.filter((item) => {
        if (parsed.detectedCategory && item.category.toLowerCase() === parsed.detectedCategory.toLowerCase()) {
          return true;
        }
        if (parsed.primaryColors && parsed.primaryColors.some((c: string) => item.color.toLowerCase().includes(c.toLowerCase()))) {
          return true;
        }
        return false;
      }).slice(0, 4);

      parsed.catalogRecommendations = matchedCatalog.length > 0 ? matchedCatalog : FASHION_CATALOG.slice(0, 4);
      return parsed;
    } catch (e: any) {
      console.warn('Camera analysis fallback activated (Reason:', e.message || e, ')');
    }
  }

  return getFallbackCameraAnalysis(userNotes);
}

export async function detectCategoryFromQueryOrImage(params: {
  query?: string;
  imageBase64?: string;
}) {
  const { query, imageBase64 } = params;

  if (query) {
    const q = query.toLowerCase();
    const categories = [
      'Shirts', 'T-Shirts', 'Tops', 'Dresses', 'Pants', 'Jeans',
      'Shorts', 'Sunglasses', 'Bags', 'Shoes', 'Heels', 'Slippers',
      'Accessories', 'Watches', 'Necklaces', 'Earrings', 'Bracelets',
    ];

    for (const cat of categories) {
      const singular = cat.endsWith('s') ? cat.slice(0, -1).toLowerCase() : cat.toLowerCase();
      if (q.includes(cat.toLowerCase()) || q.includes(singular)) {
        return cat;
      }
    }
    if (q.includes('sneaker') || q.includes('loafer') || q.includes('boot')) return 'Shoes';
    if (q.includes('shade') || q.includes('glass') || q.includes('eyewear')) return 'Sunglasses';
    if (q.includes('trouser') || q.includes('chino')) return 'Pants';
    if (q.includes('denim')) return 'Jeans';
    if (q.includes('tee')) return 'T-Shirts';
    if (q.includes('jewelry') || q.includes('chain')) return 'Necklaces';
    if (q.includes('purse') || q.includes('tote') || q.includes('handbag')) return 'Bags';
    if (q.includes('gown') || q.includes('frock')) return 'Dresses';
  }

  return null;
}

export const detectSearchCategory = detectCategoryFromQueryOrImage;

// ==================== DYNAMIC FASHION ADVISORY ENGINE ====================

function getDynamicStylingAdvice(
  prompt: string,
  userProfile?: Partial<UserProfile>,
  _wardrobeItems: FashionItem[] = []
) {
  const p = prompt.toLowerCase();
  const gender = (userProfile?.gender || 'all').toLowerCase();
  const userName = userProfile?.name ? userProfile.name.split(' ')[0] : 'there';
  const userStyle = userProfile?.preferredStyle || 'Old Money';

  const isMenPref = gender === 'men' || p.includes('men') || p.includes('guy') || p.includes('boy');
  const isWomenPref = gender === 'women' || p.includes('women') || p.includes('girl') || p.includes('dress') || p.includes('heel');

  const filterCatalog = (cat: string, targetGender?: string) => {
    return FASHION_CATALOG.find((c) => {
      const matchCat = c.category.toLowerCase() === cat.toLowerCase();
      if (!matchCat) return false;
      if (targetGender === 'men') return c.gender === 'men' || c.gender === 'unisex';
      if (targetGender === 'women') return c.gender === 'women' || c.gender === 'unisex';
      return true;
    });
  };

  // SCENARIO 1: College Event / Campus / College Presentation
  if (p.includes('college') || p.includes('campus') || p.includes('university') || p.includes('presentation')) {
    const top = isWomenPref
      ? (filterCatalog('Tops', 'women') || filterCatalog('Shirts', 'women'))
      : (filterCatalog('Shirts', 'men') || filterCatalog('T-Shirts', 'men'));

    const bottom = isWomenPref
      ? (filterCatalog('Jeans', 'women') || filterCatalog('Pants', 'women'))
      : (filterCatalog('Pants', 'men') || filterCatalog('Jeans', 'men'));

    const shoes = isWomenPref
      ? (filterCatalog('Shoes', 'women') || filterCatalog('Heels', 'women'))
      : filterCatalog('Shoes', 'men');

    const acc = filterCatalog('Bags', isWomenPref ? 'women' : 'men') || filterCatalog('Watches');

    return {
      consultationText: `Hello ${userName}! For a college event, the ideal sartorial sweet spot is "Effortless Smart-Casual"—approachable and youthful yet undeniably refined. We want to avoid looking overly stiff while standing out with tailored proportions and elevated textures.`,
      outfits: [
        {
          name: 'The Modern Collegiate Ivy Look',
          occasion: 'College',
          vibe: 'Smart Casual / Quiet Luxury',
          explanation: 'Combining a clean relaxed button-down with structured pleated trousers or straight denim balances academic poise with casual comfort. White leather sneakers anchor the silhouette casually.',
          pieces: [
            {
              category: top?.category || 'Shirts',
              description: top?.name || 'French Linen Relaxed Camp Shirt in Oatmeal',
              suggestedColor: top?.color || 'Oatmeal Beige',
              matchingCatalogItem: top,
            },
            {
              category: bottom?.category || 'Pants',
              description: bottom?.name || 'Double-Pleated Wool Blend Trousers in Sand Beige',
              suggestedColor: bottom?.color || 'Sand Beige',
              matchingCatalogItem: bottom,
            },
            {
              category: shoes?.category || 'Shoes',
              description: shoes?.name || 'Clean Leather Low-Top Sneakers in Pure White',
              suggestedColor: shoes?.color || 'Pure White',
              matchingCatalogItem: shoes,
            },
            {
              category: acc?.category || 'Bags',
              description: acc?.name || 'Waxed Canvas & Leather Weekender Tote',
              suggestedColor: acc?.color || 'Olive/Caramel',
              matchingCatalogItem: acc,
            },
          ],
          stylingTips: [
            'Do a soft French-tuck in the front to accentuate waist height while keeping the back draped.',
            'Keep your footwear spotless—clean white leather sneakers instantly elevate college attire.',
            'Layer with a lightweight knit draped over your shoulders if the lecture hall has AC.',
          ],
          colorPalette: ['#D8CBB9', '#C2B280', '#FFFFFF', '#3B4D3C'],
        },
      ],
    };
  }

  // SCENARIO 2: Traditional / Indian / Festive / Wedding
  if (p.includes('traditional') || p.includes('indian') || p.includes('festive') || p.includes('wedding') || p.includes('ethnic') || p.includes('kurta')) {
    const kurtiOrDress = isWomenPref
      ? (filterCatalog('Dresses', 'women') || FASHION_CATALOG.find((c) => c.id === 'w-dr-2'))
      : (filterCatalog('Shirts', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-sh-3'));

    const bottoms = isWomenPref
      ? (filterCatalog('Pants', 'women') || FASHION_CATALOG.find((c) => c.id === 'w-pa-1'))
      : (filterCatalog('Pants', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-pa-1'));

    const footwear = isWomenPref
      ? (filterCatalog('Heels', 'women') || filterCatalog('Slippers', 'women'))
      : (filterCatalog('Slippers', 'men') || filterCatalog('Shoes', 'men'));

    const jewelry = isWomenPref
      ? (filterCatalog('Necklaces', 'women') || filterCatalog('Earrings', 'women'))
      : (filterCatalog('Watches', 'men') || filterCatalog('Necklaces', 'men'));

    return {
      consultationText: `Namaste ${userName}! For a traditional or festive occasion, elegance comes from rich tactile textiles—raw silk, chanderi, linen-cotton blends, and artisanal embroideries. Here is a sophisticated Indo-Western ensemble that honors heritage with contemporary tailoring.`,
      outfits: [
        {
          name: 'Royal Heritage Indo-Western Ensemble',
          occasion: 'Wedding/Celebration',
          vibe: 'Traditional Elegance / Festive Regal',
          explanation: 'Lustrous festive fabrics combined with minimalist contemporary silhouettes keep the outfit grounded, eliminating gaudiness while delivering regal charm.',
          pieces: [
            {
              category: kurtiOrDress?.category || 'Dresses',
              description: kurtiOrDress?.name || 'Mulberry Silk Tunic / Kurta with Subtle Threadwork',
              suggestedColor: kurtiOrDress?.color || 'Ivory Cream & Antique Gold',
              matchingCatalogItem: kurtiOrDress,
            },
            {
              category: bottoms?.category || 'Pants',
              description: bottoms?.name || 'Tapered Tailored Silk-Linen Trousers in Champagne',
              suggestedColor: bottoms?.color || 'Champagne Gold',
              matchingCatalogItem: bottoms,
            },
            {
              category: footwear?.category || 'Shoes',
              description: footwear?.name || 'Embroidered Leather Mojaris / Sculptural Kitten Mules',
              suggestedColor: footwear?.color || 'Pale Buttercream / Gold',
              matchingCatalogItem: footwear,
            },
            {
              category: jewelry?.category || 'Necklaces',
              description: jewelry?.name || '18K Gold Vermeil Heritage Link / Kundan Choker',
              suggestedColor: 'Warm Gold',
              matchingCatalogItem: jewelry,
            },
          ],
          stylingTips: [
            'Pair warm ivory or jewel tones with brushed gold accents rather than loud silver.',
            'Maintain a clean wrist with an heirloom watch or minimal gold bracelet.',
            'Opt for natural matte grooming and a structured stole/dupatta over one shoulder.',
          ],
          colorPalette: ['#FFF8E7', '#E5C158', '#9B1D20', '#1C2826'],
        },
      ],
    };
  }

  // SCENARIO 3: Which Shoes Match / Footwear Consultation
  if (p.includes('shoe') || p.includes('sneaker') || p.includes('footwear') || p.includes('heel') || p.includes('boot') || p.includes('loafer')) {
    const primaryShoe = isWomenPref
      ? (filterCatalog('Heels', 'women') || FASHION_CATALOG.find((c) => c.id === 'w-he-1'))
      : (filterCatalog('Shoes', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-so-2'));

    const altShoe = isWomenPref
      ? (filterCatalog('Shoes', 'women') || filterCatalog('Slippers', 'women'))
      : (filterCatalog('Slippers', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-sl-1'));

    const pairPant = isWomenPref ? filterCatalog('Pants', 'women') : filterCatalog('Pants', 'men');
    const pairShirt = isWomenPref ? filterCatalog('Shirts', 'women') : filterCatalog('Shirts', 'men');

    return {
      consultationText: `Shoes determine the formality anchor of your entire silhouette, ${userName}. A good rule of thumb: structured tailored trousers require a shoe with a slim toe box (like Belgian loafers or sleek leather court sneakers), whereas wide-leg denim harmonizes best with sculptural kitten heels or retro low-tops.`,
      outfits: [
        {
          name: 'The Elevated Daily Footwear Harmony',
          occasion: 'Casual Day Out',
          vibe: 'Modern Minimalist',
          explanation: 'Low-profile footwear with monochromatic leather tones seamlessly elongates the leg line, preventing the visual break that chunky footwear often causes.',
          pieces: [
            {
              category: primaryShoe?.category || 'Shoes',
              description: primaryShoe?.name || 'Clean Calfskin Low-Top Sneakers / Leather Mules',
              suggestedColor: primaryShoe?.color || 'Pure White',
              matchingCatalogItem: primaryShoe,
            },
            {
              category: pairPant?.category || 'Pants',
              description: pairPant?.name || 'Tailored Pleated Trousers with subtle crop at ankle',
              suggestedColor: pairPant?.color || 'Sand Beige',
              matchingCatalogItem: pairPant,
            },
            {
              category: pairShirt?.category || 'Shirts',
              description: pairShirt?.name || 'Oversized Silk/Linen Button-Down',
              suggestedColor: pairShirt?.color || 'Crisp White',
              matchingCatalogItem: pairShirt,
            },
            {
              category: 'Accessories',
              description: 'Leather Belt matching the shoe grain tone',
              suggestedColor: 'Espresso Brown',
              matchingCatalogItem: filterCatalog('Accessories'),
            },
          ],
          stylingTips: [
            'Ensure trouser cuffs hover 0.5 inches above sneaker collars with no excessive fabric stacking.',
            'For heels or mules, choose pointed or almond toes to visually elongate the ankle.',
            'Always match your leather accessories (belt, watch strap, bag) to the footwear undertone.',
          ],
          colorPalette: ['#FFFFFF', '#D8CBB9', '#3D3830', '#1C1A17'],
        },
        {
          name: 'Suede & Loafer Evening Variation',
          occasion: 'Date Night',
          vibe: 'Old Money Sartorial',
          explanation: 'Switching from leather sneakers to buttery suede loafers or kitten heel mules immediately transitions the look into evening cocktail sophistication.',
          pieces: [
            {
              category: altShoe?.category || 'Shoes',
              description: altShoe?.name || 'Belgian Suede Loafers or Hourglass Mules',
              suggestedColor: altShoe?.color || 'Espresso Suede / Cream',
              matchingCatalogItem: altShoe,
            },
            {
              category: pairPant?.category || 'Pants',
              description: pairPant?.name || 'Double-Pleated Wool Trousers',
              suggestedColor: pairPant?.color || 'Charcoal Navy',
              matchingCatalogItem: pairPant,
            },
          ],
          stylingTips: [
            'Go sockless or wear ultra-low no-show socks with loafers and mules for clean ankle definition.',
          ],
          colorPalette: ['#2B2A27', '#E8DFD3', '#705335'],
        },
      ],
    };
  }

  // SCENARIO 4: Style a White Shirt
  if (p.includes('white shirt') || (p.includes('white') && p.includes('shirt'))) {
    const whiteShirt = isWomenPref
      ? (FASHION_CATALOG.find((c) => c.id === 'w-sh-1') || filterCatalog('Shirts', 'women'))
      : (FASHION_CATALOG.find((c) => c.id === 'm-sh-2') || filterCatalog('Shirts', 'men'));

    const pleatedBottom = isWomenPref
      ? (filterCatalog('Pants', 'women') || filterCatalog('Jeans', 'women'))
      : (filterCatalog('Pants', 'men') || filterCatalog('Jeans', 'men'));

    const footwear = isWomenPref ? filterCatalog('Heels', 'women') : filterCatalog('Shoes', 'men');
    const shades = filterCatalog('Sunglasses') || filterCatalog('Watches');

    return {
      consultationText: `A crisp white shirt is the supreme chameleon of haute personal style, ${userName}. The key to styling it without looking like corporate office uniform is playing with proportions: intentional drape, unbuttoning collar stances, and pairing high-low fabrics like silk-cotton with textured wool or raw selvedge denim.`,
      outfits: [
        {
          name: 'The Parisian High-Low White Shirt Look',
          occasion: 'Casual Day Out',
          vibe: 'Parisian Chic / Effortless Sophistication',
          explanation: 'Unbuttoning the top 2-3 buttons and French-tucking the front hem into high-waisted pleated trousers creates an elongated V-neckline that frames jewelry and face beautifully.',
          pieces: [
            {
              category: whiteShirt?.category || 'Shirts',
              description: whiteShirt?.name || 'Crisp Poplin Relaxed White Shirt with mother-of-pearl buttons',
              suggestedColor: 'Optic White',
              matchingCatalogItem: whiteShirt,
            },
            {
              category: pleatedBottom?.category || 'Pants',
              description: pleatedBottom?.name || 'High-Rise Double-Pleated Trousers in Sand Beige or Charcoal',
              suggestedColor: pleatedBottom?.color || 'Sand Beige',
              matchingCatalogItem: pleatedBottom,
            },
            {
              category: footwear?.category || 'Shoes',
              description: footwear?.name || 'Clean Calfskin Sneakers or Mules',
              suggestedColor: footwear?.color || 'Pure White / Pale Buttercream',
              matchingCatalogItem: footwear,
            },
            {
              category: shades?.category || 'Sunglasses',
              description: shades?.name || 'Handcrafted Acetate Sunglasses in Amber Tortoise',
              suggestedColor: shades?.color || 'Amber Tortoise',
              matchingCatalogItem: shades,
            },
          ],
          stylingTips: [
            'Roll sleeves twice to hit midway up your forearm for an easy, confident silhouette.',
            'Layer 1-2 delicate gold chains inside the open neckline to catch the light.',
            'Add an oversized textured blazer draped over shoulders for cool evening transitions.',
          ],
          colorPalette: ['#FFFFFF', '#C5B59E', '#6B4423', '#1F1E1C'],
        },
      ],
    };
  }

  // SCENARIO 5: Work / Office / Formal / Interview
  if (p.includes('work') || p.includes('office') || p.includes('formal') || p.includes('interview') || p.includes('business')) {
    const shirt = isWomenPref
      ? (filterCatalog('Shirts', 'women') || filterCatalog('Tops', 'women'))
      : (filterCatalog('Shirts', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-sh-2'));

    const trousers = isWomenPref
      ? (filterCatalog('Pants', 'women') || FASHION_CATALOG.find((c) => c.id === 'w-pa-1'))
      : (filterCatalog('Pants', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-pa-1'));

    const shoes = isWomenPref
      ? (filterCatalog('Heels', 'women') || filterCatalog('Shoes', 'women'))
      : (filterCatalog('Shoes', 'men') || FASHION_CATALOG.find((c) => c.id === 'm-so-1'));

    const bag = filterCatalog('Bags', isWomenPref ? 'women' : 'men');

    return {
      consultationText: `Executive presence is crafted through crisp silhouettes, impeccable drape, and subdued tonal palettes, ${userName}. With your affinity for ${userStyle}, we avoid rigid corporate uniforms in favor of modern sartorial refinement.`,
      outfits: [
        {
          name: 'The Modern Boardroom Sartorial',
          occasion: 'Work/Office',
          vibe: 'Executive Elegance / Quiet Luxury',
          explanation: 'Tailored wool-blend trousers with subtle front pleats paired with a premium Egyptian cotton or silk shirt project quiet confidence, authority, and modern sensibility.',
          pieces: [
            {
              category: shirt?.category || 'Shirts',
              description: shirt?.name || 'Fine Oxford Button-Down / Silk Blouse',
              suggestedColor: shirt?.color || 'Classic White / Sky Blue',
              matchingCatalogItem: shirt,
            },
            {
              category: trousers?.category || 'Pants',
              description: trousers?.name || 'Double-Pleated Wool Trousers',
              suggestedColor: trousers?.color || 'Sand Beige / Charcoal',
              matchingCatalogItem: trousers,
            },
            {
              category: shoes?.category || 'Shoes',
              description: shoes?.name || 'Calfskin Loafers or Sculptural Kitten Heels',
              suggestedColor: shoes?.color || 'Black / Caramel Nappa',
              matchingCatalogItem: shoes,
            },
            {
              category: bag?.category || 'Bags',
              description: bag?.name || 'Structured Leather Tote / Messenger',
              suggestedColor: bag?.color || 'Espresso Brown',
              matchingCatalogItem: bag,
            },
          ],
          stylingTips: [
            'Ensure the collar sits crisp and upright with magnetic collar stays.',
            'Keep watch faces clean with a leather strap matching your footwear.',
            'Stick to the 3-color rule: base neutral, anchor dark, and one subtle accent.',
          ],
          colorPalette: ['#1C2541', '#E8E8E4', '#D8CBB9', '#2E282A'],
        },
      ],
    };
  }

  // DEFAULT / CASUAL EVERYDAY ELEGANCE (Scenario 6)
  const defaultTop = isWomenPref
    ? (filterCatalog('Tops', 'women') || filterCatalog('Dresses', 'women') || filterCatalog('Shirts', 'women'))
    : (filterCatalog('Shirts', 'men') || filterCatalog('T-Shirts', 'men'));

  const defaultBottom = isWomenPref
    ? (filterCatalog('Jeans', 'women') || filterCatalog('Pants', 'women'))
    : (filterCatalog('Pants', 'men') || filterCatalog('Jeans', 'men'));

  const defaultShoes = isWomenPref
    ? (filterCatalog('Heels', 'women') || filterCatalog('Shoes', 'women'))
    : filterCatalog('Shoes', 'men');

  const defaultAcc = filterCatalog('Sunglasses') || filterCatalog('Accessories');

  return {
    consultationText: `For "${prompt}", the secret to modern elegance lies in balancing textures and proportion, ${userName}. With your profile preference for ${userStyle}, we recommend pairing relaxed natural fibers like French linen or combed cotton with one tailored anchor piece.`,
    outfits: [
      {
        name: 'The Modern Minimalist Ensemble',
        occasion: 'Casual Day Out',
        vibe: 'Quiet Luxury',
        explanation: 'The breezy texture of pure linen balances with tailored trousers, creating an elevated yet approachable silhouette that seamlessly moves between morning coffee and evening gatherings.',
        pieces: [
          {
            category: defaultTop?.category || 'Shirts',
            description: defaultTop?.name || 'French Linen Relaxed Camp Shirt',
            suggestedColor: defaultTop?.color || 'Oatmeal Beige',
            matchingCatalogItem: defaultTop,
          },
          {
            category: defaultBottom?.category || 'Pants',
            description: defaultBottom?.name || 'Double-Pleated Wool Trousers or Straight Raw Denim',
            suggestedColor: defaultBottom?.color || 'Sand Beige',
            matchingCatalogItem: defaultBottom,
          },
          {
            category: defaultShoes?.category || 'Shoes',
            description: defaultShoes?.name || 'Clean Leather Low-Top Sneakers',
            suggestedColor: defaultShoes?.color || 'Pure White',
            matchingCatalogItem: defaultShoes,
          },
          {
            category: defaultAcc?.category || 'Sunglasses',
            description: defaultAcc?.name || 'Handcrafted Acetate Aviators in Amber Tortoise',
            suggestedColor: defaultAcc?.color || 'Amber Tortoise',
            matchingCatalogItem: defaultAcc,
          },
        ],
        stylingTips: [
          'Leave the top two buttons undone on the camp shirt for relaxed vacation energy.',
          'Slightly cuff the trousers to sit right above your sneakers with zero break.',
          'Keep jewelry minimal with a subtle silver chain or vintage leather watch.',
        ],
        colorPalette: ['#D8CBB9', '#C2B280', '#FFFFFF', '#6F4E37'],
      },
      {
        name: 'Evening Satin & Monochrome Chic',
        occasion: 'Date Night',
        vibe: 'Refined Sophistication',
        explanation: 'Fluid silk or satin with sculptural accents creates an elongating line that commands attention gracefully without being overly loud.',
        pieces: [
          {
            category: isWomenPref ? 'Dresses' : 'Shirts',
            description: isWomenPref
              ? 'Satin Bias-Cut Midi Slip Dress in Sage Mist'
              : 'Black Poplin Tailored Button-Down Shirt',
            suggestedColor: isWomenPref ? 'Sage Mist' : 'Midnight Black',
            matchingCatalogItem: isWomenPref
              ? filterCatalog('Dresses', 'women')
              : FASHION_CATALOG.find((c) => c.id === 'm-sh-2'),
          },
          {
            category: isWomenPref ? 'Heels' : 'Shoes',
            description: isWomenPref
              ? 'Sculptural Kitten Heel Mules in Pale Buttercream'
              : 'Italian Suede Chelsea Boots in Espresso',
            suggestedColor: isWomenPref ? 'Pale Buttercream' : 'Espresso Brown',
            matchingCatalogItem: isWomenPref
              ? filterCatalog('Heels', 'women')
              : FASHION_CATALOG.find((c) => c.id === 'm-so-1'),
          },
        ],
        stylingTips: [
          'Drape an oversized tailored blazer over your shoulders during cooler evenings.',
          'Add a swipe of neutral lip oil and slick back hair into a soft chignon.',
        ],
        colorPalette: ['#9CAF88', '#F6E8CE', '#E5C158', '#141414'],
      },
    ],
  };
}

function getFallbackCameraAnalysis(userNotes: string = '') {
  return {
    identifiedItems: [userNotes || 'Tailored Garment', 'Neutral Foundation Layer'],
    vibe: 'Modern Versatile Casual',
    detectedCategory: 'Shirts',
    primaryColors: ['Warm Beige', 'Natural White', 'Muted Earth'],
    matchingItems: [
      'Double-Pleated Wool Trousers or High-Rise Straight Raw Denim',
      'Clean Italian Calfskin Sneakers or Suede Chelsea Boots',
      'Lightweight tailored linen or wool overshirt',
    ],
    suitableAccessories: [
      'Amber Tortoise Acetate Sunglasses',
      'Minimalist Heritage Automatic Timepiece with leather strap',
      'Structured Crescent Leather Bag in Caramel',
      'Solid 925 Sterling Silver or 18K Gold Vermeil link chain',
    ],
    alternativeCombinations: [
      'Daytime: Pair with rolled light denim and white canvas sneakers for coffee runs.',
      'Evening: Tuck into dark pleated trousers, add a black leather belt, and wear under an unbuttoned blazer.',
      'Resort: Wear unbuttoned over swimwear or white ribbed tank with linen bermuda shorts.',
    ],
    colorCombinations: [
      'Sand Beige + Off-White + Deep Navy Blue',
      'Earthy Olive + Charcoal Grey + Brushed Gold',
      'Monochromatic Warm Neutrals with dark espresso leather accents',
    ],
    stylingImprovements: [
      'Try a subtle half-tuck (French tuck) in the front to define your natural waistline without restricting comfort.',
      'Roll sleeves up twice to forearm length to introduce an effortless, casual balance.',
      'Ensure the shoulder seam sits precisely at the natural edge of your clavicle.',
    ],
    catalogRecommendations: FASHION_CATALOG.slice(0, 4),
  };
}
