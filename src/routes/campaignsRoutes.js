const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { model_id, name, lang, from_name, from_email, start_date, end_date } = req.body;

  if (!model_id || !name || !Array.isArray(lang) || lang.length === 0 || !from_name || !from_email || !start_date || !end_date)
  {
    return res.status(400).json({ Error: "Missing fields" });
  }

  console.log("Campagne créée avec l'ID: ", model_id);
  console.log("Nom de la campagne   :", model_id);
  console.log("Langue(s)            :", lang);
  console.log("Nom                  :", from_name);
  console.log("Email                :", from_email);
  console.log("Date:                :", start_date, "-", end_date);

  res.status(200).json({
    message: `Campagne créée campaign->id=1`,
    campaign_id: 1
  });
});

module.exports = router;
