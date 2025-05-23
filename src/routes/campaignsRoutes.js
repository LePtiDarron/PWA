const express = require('express');
const router = express.Router();

app.post('/campaigns', (req, res) => {
  const { model_id, name, lang, from_name, from_email, start_date, end_date } = req.body;

  if (!model_id || !name || !Array.isArray(lang) || lang.length === 0 || !from_name || !from_email || !start_date || !end_date)
  {
    return res.status(422).json({ message: "Invalid data", errors: { champs: ["Missing fields."] }});
  }

  res.status(200).json({
    message: `Campagne créée campaign->id=1`,
    campaign_id: 1
  });
});

module.exports = router;
