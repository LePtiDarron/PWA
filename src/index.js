require('dotenv').config();
const campaignsRoutes = require('./routes/campaignsRoutes');
const modelsRoutes = require('./routes/modelsRoutes');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/api/models', modelsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.get('/api/', async (req, res) => {res.json({message: 'Server running'})});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
