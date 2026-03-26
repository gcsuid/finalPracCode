const express = require('express');
const path = require('path');
const cors = require('cors');
const problemRoutes = require('./routes/problemRoutes');
const problemStore = require('./services/problemStore');

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

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Storage mode: ${problemStore.getStorageMode()}`);
});
