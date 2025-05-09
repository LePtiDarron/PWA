const webpush = require('../webpushConfig');
const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const authenticateToken = require('../middleware/auth');

// Enregistrement d'une souscription
router.post('/subscribe', authenticateToken, async (req, res) => {
  const { endpoint, keys, userId } = req.body;
  console.log('📦 Demande de souscription reçue');

  try {
    const exists = await PushSubscription.findOne({ endpoint });
    if (!exists) {
      const newSub = new PushSubscription({
        keys,
        userId,
        endpoint,
      });
      await newSub.save();
      console.log('✅ Souscription enregistrée dans la base de données');
    } else {
      console.log('ℹ️ Souscription déjà enregistrée');
    }

    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    console.error('❌ Erreur enregistrement subscription :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Désabonnement d'une souscription
router.post('/unsubscribe', authenticateToken, async (req, res) => {
  const { userId } = req.body;
  console.log('📦 Demande de désabonnement reçue');

  try {
    const subscription = await PushSubscription.findOneAndDelete({ userId });

    if (subscription) {
      console.log('✅ Souscription supprimée de la base de données');
      res.status(200).json({ message: 'Unsubscribed' });
    } else {
      console.log('ℹ️ Aucun abonnement trouvé pour cet userId');
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (err) {
    console.error('❌ Erreur lors de la suppression de la souscription:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Envoi des notifications à toutes les souscriptions enregistrées
router.post('/notify', authenticateToken, async (req, res) => {
  const payload = JSON.stringify({
    title: req.body.username || 'Ping !',
    body: req.body.body || 'Contenu vide',
    data: {
      url: req.body.url || '/',
    },
  });

  console.log(payload);

  try {
    const subscriptions = await PushSubscription.find();
    console.log('📡 Envoi de notifications à toutes les souscriptions:', subscriptions.length);

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            }
          },
          payload
        ).catch((err) => {
          console.error('❌ Échec envoi push à', sub.endpoint, err);
        })
      )
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Erreur lors de l’envoi des notifications :', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
