import { FashionItem } from '../types/fashion.ts';

export interface CategoryCard {
  name: string;
  gender: 'men' | 'women';
  image: string;
  tagline: string;
}

export const MEN_CATEGORIES: CategoryCard[] = [
  {
    name: 'Shirts',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    tagline: 'Linen, Oxford & Silk weaves',
  },
  {
    name: 'T-Shirts',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    tagline: 'Heavyweight organic cottons',
  },
  {
    name: 'Pants',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    tagline: 'Double-pleated & tailored chinos',
  },
  {
    name: 'Jeans',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    tagline: 'Selvedge denim & classic cuts',
  },
  {
    name: 'Shorts',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
    tagline: 'Resort linen & tailored bermudas',
  },
  {
    name: 'Sunglasses',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    tagline: 'Cellulose acetate & aviators',
  },
  {
    name: 'Bags',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    tagline: 'Full-grain leather duffles & totes',
  },
  {
    name: 'Shoes',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80',
    tagline: 'Chelsea boots & leather low-tops',
  },
  {
    name: 'Slippers',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
    tagline: 'Handwoven leather & artisan slides',
  },
  {
    name: 'Accessories',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80',
    tagline: 'Saffiano leather belts & scarves',
  },
  {
    name: 'Watches',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    tagline: 'Automatic heritage timepieces',
  },
  {
    name: 'Necklaces',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    tagline: 'Sterling silver chains & pendants',
  },
];

export const WOMEN_CATEGORIES: CategoryCard[] = [
  {
    name: 'Shirts',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=600&q=80',
    tagline: 'Crisp poplin & silk button-downs',
  },
  {
    name: 'Tops',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    tagline: 'Ribbed knit, sweetheart & corsetry',
  },
  {
    name: 'T-Shirts',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1503342452485-86b7f54527ef?auto=format&fit=crop&w=600&q=80',
    tagline: 'Micro-rib baby tees & boyfriend cuts',
  },
  {
    name: 'Dresses',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    tagline: 'Bias satin slips, linens & Indo-Western',
  },
  {
    name: 'Pants',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    tagline: 'High-waist wide-leg palazzo trousers',
  },
  {
    name: 'Jeans',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    tagline: 'Vintage straight & sculptural high-rise',
  },
  {
    name: 'Shorts',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
    tagline: 'Tailored pleated linen shorts',
  },
  {
    name: 'Sunglasses',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80',
    tagline: 'Sculptural cat-eye & retro gold frames',
  },
  {
    name: 'Bags',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    tagline: 'Crescent moon bags & woven totes',
  },
  {
    name: 'Shoes',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    tagline: 'Chunky lug-sole loafers & sneakers',
  },
  {
    name: 'Heels',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    tagline: 'Kitten heel mules & strappy stilettos',
  },
  {
    name: 'Slippers',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
    tagline: 'Plush shearling & woven slides',
  },
  {
    name: 'Accessories',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
    tagline: 'Pure silk twilly scarves & leather belts',
  },
  {
    name: 'Necklaces',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    tagline: '18K gold herringbone & baroque pearls',
  },
  {
    name: 'Earrings',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    tagline: 'Chunky teardrop hoops & pearl drops',
  },
  {
    name: 'Bracelets',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1611591475816-1f63a233b86a?auto=format&fit=crop&w=600&q=80',
    tagline: 'Sculpted gold cuffs & tennis chains',
  },
];

export const INITIAL_FEATURED_OUTFITS = [
  {
    id: 'outfit-quiet-luxury',
    title: 'The Riviera Linen & Loafers Ensemble',
    gender: 'men',
    vibe: 'Old Money Minimalist',
    occasion: 'Casual Day Out',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
    description: 'An airy combination of Normandy French linen camp shirt paired with double-pleated sand trousers and handcrafted tortoiseshell sunglasses.',
    itemsCount: 4,
    tags: ['Linen', 'Pleated', 'Riviera', 'Sunglasses'],
  },
  {
    id: 'outfit-silk-cocktail',
    title: 'Satin Slip & Sculptural Mule Soirée',
    gender: 'women',
    vibe: 'Refined Evening Glamour',
    occasion: 'Date Night',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
    description: 'Sensual sage green bias-cut satin midi dress complemented by pale buttercream sculptural kitten mules and 18K herringbone gold choker.',
    itemsCount: 4,
    tags: ['Satin', 'Gold Jewelry', 'Kitten Heel', 'Cocktail'],
  },
  {
    id: 'outfit-contemporary-indo-western',
    title: 'Contemporary Indo-Western Royal Festivity',
    gender: 'women',
    vibe: 'Traditional Fusion Splendor',
    occasion: 'Wedding/Celebration',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    description: 'Zardozi embroidered rust-gold Georgette gown styled with baroque pearl necklace and sculpted wave cuff bangle.',
    itemsCount: 3,
    tags: ['Indo-Western', 'Zardozi', 'Festive', 'Traditional'],
  },
  {
    id: 'outfit-executive-casual',
    title: 'Modern Creative Director Executive',
    gender: 'men',
    vibe: 'Architectural Tailoring',
    occasion: 'Work/Office',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    description: 'Sky blue Supima cotton oxford button-down tucked into navy chinos with heritage emerald automatic timepiece and calfskin leather sneakers.',
    itemsCount: 4,
    tags: ['Oxford Cotton', 'Timepiece', 'Clean Sneaker', 'Sharp'],
  },
];
