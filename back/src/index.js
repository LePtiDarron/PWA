require('dotenv').config();
const chatRoutes = require('./routes/chatRoutes');
const usersRoutes = require('./routes/usersRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/chat', chatRoutes);
app.use('/users', usersRoutes);
app.get('/', async (req, res) => {res.json({message: 'Server running'})});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
