const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Configuration CORS
app.use(cors({
  origin: 'https://epimsg.duckdns.org',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Headers de sécurité
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "wss://epimsg.duckdns.org/api"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: [],
      }
    }
  })
);

// Forcer HTTPS en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Connexion Mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('🟢 Connected to MongoDB');
}).catch((err) => {
  console.error('🔴 MongoDB connection error:', err);
});

// Routes
const authRoutes = require("./routes/auth");
const pushRoutes = require("./routes/push");
const messagesRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');
const userRoutes = require('./routes/user');

app.use("/auth", authRoutes);
app.use("/push", pushRoutes);
app.use('/messages', messagesRoutes);
app.use('/conversations', conversationRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Sockets
const { Server } = require("socket.io");
const initSocket = require('./socket');

const io = new Server(server, {
  cors: {
    origin: 'https://epimsg.duckdns.org',
    methods: ['GET', 'POST'],
  }
});
initSocket(io);

// Serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
