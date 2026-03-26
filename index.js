const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const problemRoutes = require('./routes/problemRoutes');
const problemStore = require('./services/problemStore');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/api/problems', problemRoutes);

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/leetcode-tracker';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => {
    console.error('MongoDB connection error. Falling back to db.json:', err.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log(`Storage mode: ${problemStore.getStorageMode()}`);
    });
  });
