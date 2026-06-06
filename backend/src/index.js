require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/couriers', require('./routes/couriers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/regions', require('./routes/regions'));

// Health check
app.get('/health', (req, res) => res.json({ ok: true, version: '1.0.0', service: 'DarrovGo API' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Topilmadi' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server xatosi' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DarrovGo API running on port ${PORT}`));
