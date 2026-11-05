import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { store } from './server/store.ts';
import { FASHION_CATALOG } from './server/catalog.ts';
import { consultAiStylist, analyzeOutfitWithCamera, detectSearchCategory } from './server/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High body limit to support base64 camera image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to get active user ID from header or default demo user
function getUserId(req: express.Request): string {
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId) return headerUserId;
  // Default demo user
  return 'user-demo-1';
}

// ==================== AUTH / PROFILE APIS ====================

app.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = store.getUserByEmail(email);
  if (!user) {
    user = store.createUser(name || email.split('@')[0], email);
  }

  res.json({ user, token: 'tok_' + user.id });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const user = store.createUser(name, email);
  res.json({ user, token: 'tok_' + user.id });
});

app.get('/api/auth/me', (req, res) => {
  const userId = getUserId(req);
  const user = store.getUser(userId) || store.getUser('user-demo-1');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', (req, res) => {
  const userId = getUserId(req);
  const updated = store.updateUser(userId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: updated });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== CATALOG & PRODUCTS APIS ====================

app.get('/api/products', (req, res) => {
  const { gender, category, style, occasion, search, color } = req.query;

  let results = [...FASHION_CATALOG];

  if (gender && gender !== 'all') {
    results = results.filter(
      (item) => item.gender === gender || item.gender === 'unisex'
    );
  }

  if (category && category !== 'All') {
    const catStr = String(category).toLowerCase();
    results = results.filter(
      (item) => item.category.toLowerCase() === catStr
    );
  }

  if (style && style !== 'All') {
    results = results.filter((item) => item.style === style);
  }

  if (occasion && occasion !== 'All') {
    results = results.filter((item) => item.occasion === occasion);
  }

  if (color && color !== 'All') {
    const colStr = String(color).toLowerCase();
    results = results.filter((item) =>
      item.color.toLowerCase().includes(colStr)
    );
  }

  if (search) {
    const s = String(search).toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        item.color.toLowerCase().includes(s) ||
        item.style.toLowerCase().includes(s) ||
        item.occasion.toLowerCase().includes(s) ||
        item.material.toLowerCase().includes(s)
    );
  }

  res.json({ products: results, total: results.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = FASHION_CATALOG.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

// ==================== WARDROBE APIS ====================

app.get('/api/wardrobe', (req, res) => {
  const userId = getUserId(req);
  const wardrobe = store.getWardrobe(userId);
  res.json({ wardrobe });
});

app.post('/api/wardrobe', (req, res) => {
  const userId = getUserId(req);
  const { productId, notes } = req.body;
  const product = FASHION_CATALOG.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const item = store.addToWardrobe(userId, product, notes);
  res.json({ item, success: true });
});

app.delete('/api/wardrobe/:id', (req, res) => {
  const userId = getUserId(req);
  const success = store.removeFromWardrobe(userId, req.params.id);
  res.json({ success });
});

// ==================== SAVED OUTFITS APIS ====================

app.get('/api/outfits', (req, res) => {
  const userId = getUserId(req);
  const outfits = store.getOutfits(userId);
  res.json({ outfits });
});

app.post('/api/outfits', (req, res) => {
  const userId = getUserId(req);
  const { title, occasion, itemIds, stylistNotes } = req.body;

  const items = (itemIds || [])
    .map((id: string) => FASHION_CATALOG.find((p) => p.id === id))
    .filter(Boolean);

  const outfit = store.saveOutfit(userId, title, occasion, items, stylistNotes);
  res.json({ outfit, success: true });
});

app.delete('/api/outfits/:id', (req, res) => {
  const userId = getUserId(req);
  const success = store.deleteOutfit(userId, req.params.id);
  res.json({ success });
});

// ==================== CALENDAR STYLING SCHEDULE APIS ====================

app.get('/api/schedule', (req, res) => {
  const userId = getUserId(req);
  const schedule = store.getSchedule(userId);
  res.json({ schedule });
});

app.get('/api/schedule/:date', (req, res) => {
  const userId = getUserId(req);
  const item = store.getScheduledDay(userId, req.params.date);
  res.json({ scheduledOutfit: item || null });
});

app.post('/api/schedule', (req, res) => {
  const userId = getUserId(req);
  const { date, title, occasion, itemIds, notes } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
  }

  const items = (itemIds || [])
    .map((id: string) => FASHION_CATALOG.find((p) => p.id === id))
    .filter(Boolean);

  const scheduled = store.setSchedule(userId, date, title, occasion, items, notes);
  res.json({ scheduledOutfit: scheduled, success: true });
});

app.delete('/api/schedule/:idOrDate', (req, res) => {
  const userId = getUserId(req);
  const success = store.deleteSchedule(userId, req.params.idOrDate);
  res.json({ success });
});

app.post('/api/schedule/ai-auto-plan', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = store.getUser(userId);
    const wardrobeItems = store.getWardrobe(userId).map((w) => w.product);

    if (wardrobeItems.length === 0) {
      return res.status(400).json({ error: 'No items in digital wardrobe to schedule' });
    }

    const { startDate } = req.body;
    const baseDate = startDate ? new Date(startDate) : new Date();

    const occasionsList = [
      'Work/Office',
      'Work/Office',
      'Casual Day Out',
      'Casual Day Out',
      'Date Night',
      'Travel',
      'Casual Day Out',
    ];

    const planned: any[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate.getTime() + i * 86400000);
      const ymd = d.toISOString().split('T')[0];
      const occ = occasionsList[i % occasionsList.length];

      // Pick top, bottom, shoes, accessory from wardrobe
      const tops = wardrobeItems.filter((w) => ['Shirts', 'T-Shirts', 'Tops', 'Dresses'].includes(w.category));
      const bottoms = wardrobeItems.filter((w) => ['Pants', 'Jeans', 'Shorts'].includes(w.category));
      const footwear = wardrobeItems.filter((w) => ['Shoes', 'Heels', 'Slippers'].includes(w.category));
      const accessories = wardrobeItems.filter((w) =>
        ['Bags', 'Sunglasses', 'Watches', 'Necklaces', 'Earrings', 'Bracelets', 'Accessories'].includes(w.category)
      );

      const chosenItems: any[] = [];
      if (tops.length > 0) chosenItems.push(tops[i % tops.length]);
      if (bottoms.length > 0) chosenItems.push(bottoms[i % bottoms.length]);
      if (footwear.length > 0) chosenItems.push(footwear[i % footwear.length]);
      if (accessories.length > 0) chosenItems.push(accessories[i % accessories.length]);

      const title =
        occ === 'Work/Office'
          ? 'Tailored Office Focus'
          : occ === 'Date Night'
          ? 'Twilight Evening Elegance'
          : occ === 'Travel'
          ? 'Weekend Getaway Comfort'
          : 'Elevated Casual Ensemble';

      const notes = `Curated with ${chosenItems.map((c) => c.name).join(', ')}.`;
      const item = store.setSchedule(userId, ymd, title, occ, chosenItems, notes);
      planned.push(item);
    }

    res.json({ schedule: store.getSchedule(userId), planned, success: true });
  } catch (error: any) {
    console.error('Auto-plan schedule error:', error);
    res.status(500).json({ error: error.message || 'Failed to auto-plan week' });
  }
});

// ==================== SEARCH HISTORY APIS ====================

app.get('/api/search/history', (req, res) => {
  const userId = getUserId(req);
  const history = store.getSearchHistory(userId);
  res.json({ history });
});

app.post('/api/search/history', (req, res) => {
  const userId = getUserId(req);
  const { query, type = 'text', categoryDetected } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const item = store.addSearchHistory(userId, query, type, categoryDetected);
  res.json({ item });
});

app.delete('/api/search/history', (req, res) => {
  const userId = getUserId(req);
  store.clearSearchHistory(userId);
  res.json({ success: true });
});

// ==================== AI STYLIST APIS ====================

app.post('/api/ai/stylist', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = store.getUser(userId);
    const wardrobeItems = store.getWardrobe(userId).map((w) => w.product);

    const { prompt, customProfile } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const effectiveProfile = customProfile || user;
    const result = await consultAiStylist({
      prompt,
      userProfile: effectiveProfile,
      wardrobeItems,
    });

    res.json(result);
  } catch (error: any) {
    console.error('API /api/ai/stylist error:', error);
    res.status(500).json({ error: error.message || 'Failed to consult AI Stylist' });
  }
});

app.post('/api/ai/analyze-outfit', async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = store.getUser(userId);
    const { imageBase64, mimeType = 'image/jpeg', userNotes = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const analysis = await analyzeOutfitWithCamera({
      imageBase64,
      mimeType,
      userNotes,
      userProfile: user,
    });

    res.json(analysis);
  } catch (error: any) {
    console.error('API /api/ai/analyze-outfit error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze outfit' });
  }
});

app.post('/api/ai/detect-category', async (req, res) => {
  try {
    const { query, imageBase64, mimeType } = req.body;
    const category = await detectSearchCategory({ query, imageBase64, mimeType });
    res.json({ category });
  } catch (error: any) {
    console.error('API /api/ai/detect-category error:', error);
    res.status(500).json({ error: error.message || 'Failed to detect category' });
  }
});

// ==================== DEV / PROD SERVER MOUNT ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ ELIZEE Fashion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
