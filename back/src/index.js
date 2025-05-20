require('dotenv').config();
const chatRoutes = require('./routes/chatRoutes');
const usersRoutes = require('./routes/usersRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/votredomaine.duckdns.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/votredomaine.duckdns.org/fullchain.pem')
};

app.use(express.static('build'));

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

https.createServer(options, app).listen(443, () => {
  console.log('Serveur HTTPS running on port 443');
});