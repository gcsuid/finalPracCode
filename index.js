const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/env');
const problemRoutes = require('./routes/problemRoutes');
const { connectToMongo } = require('./services/mongoService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: 'mongodb'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/api/problems', problemRoutes);

async function startServer() {
  try {
    await connectToMongo();

    app.listen(config.port, () => {
      console.log(`Server started on port ${config.port}`);
      console.log('Storage mode: mongodb');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
