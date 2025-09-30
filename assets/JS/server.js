import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const ADMIN_PASS = process.env.ADMIN_PASS;

// connect once at startup
let db, col;
async function initDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    col = db.collection(collectionName);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
    process.exit(1);
  }
}

// ---------- ROUTES ----------
app.post('/save', async (req, res) => {
  try {
    const data = req.body;
    await col.deleteMany({});
    await col.insertOne(data);
    res.json({ success: true, message: 'Saved to MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/load', async (req, res) => {
  try {
    const doc = await col.findOne({});
    res.json(doc || {});
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/verify-password', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) {
    return res.json({ success: true });
  }
  res.json({ success: false });
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
});
