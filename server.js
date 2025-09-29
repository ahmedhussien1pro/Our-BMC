const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;

// MongoDB Configuration
const CONFIG = {
  mongodbUri:
    'mongodb+srv://node1_db:node1_db@cluster0.aiysocq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  dbName: 'bmc_database',
  collectionName: 'canvas_data',
};

let db, collection;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Connect to MongoDB
async function connectDB() {
  try {
    const client = await MongoClient.connect(CONFIG.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(CONFIG.dbName);
    collection = db.collection(CONFIG.collectionName);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// API Routes

// Save canvas data
app.post('/api/save', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Update or insert (upsert)
    const result = await collection.replaceOne(
      { projectName: data.projectName },
      data,
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Data saved successfully',
      result,
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message,
    });
  }
});

// Load canvas data
app.get('/api/load', async (req, res) => {
  try {
    const projectName =
      req.query.projectName || 'Cybersecurity Training Platform';
    const data = await collection.findOne({ projectName });

    if (data) {
      res.json({
        success: true,
        data,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No data found',
      });
    }
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load data',
      error: error.message,
    });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await collection.find({}).toArray();
    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get projects',
      error: error.message,
    });
  }
});

// Delete project
app.delete('/api/delete/:projectName', async (req, res) => {
  try {
    const result = await collection.deleteOne({
      projectName: req.params.projectName,
    });

    res.json({
      success: true,
      message: 'Project deleted successfully',
      result,
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message,
    });
  }
});

// Start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
