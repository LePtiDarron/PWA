const webpush = require('web-push');
require('dotenv').config();

webpush.setVapidDetails(
  'mailto:victorgarreau94@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;