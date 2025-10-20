const express = require('express');
const app = express();

app.use(express.json());

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test personas endpoint
app.get('/api/personas', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, name: 'LegacyBot', era: '2021-2022', provider: 'openai' },
      { id: 2, name: 'Scholar', era: '2022-2023', provider: 'anthropic' }
    ]
  });
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
