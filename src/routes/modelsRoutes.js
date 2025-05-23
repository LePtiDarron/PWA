const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const models = [
    {
      campaign_type: "Sensibilisation",
      categories: [
        {
          category: "Cybersécurité pour tous",
          "sub-categories": [
            {
              "sub-category": "Mots de passe",
              campaigns: [
                {
                  name: "Créer un mot de passe sécurisé",
                  duration: 5,
                  courses_number: 1,
                  replay: 1,
                  certificant: 1,
                  Quiz: 1,
                  Scenes: 0,
                  Video: 1,
                  langs: [
                    {
                      lang: "fr",
                      name: "Créer un mot de passe sécurisé",
                      description: "Apprenez à créer un mot de passe fort et à protéger vos comptes en ligne."
                    }
                  ],
                  variants: [
                    {
                      model_id: 1,
                      variant_name: "Standard",
                      available_languages: ["fr"],
                      thumbnail: "https://example.com/thumbnails/motdepasse.png"
                    }
                  ]
                }
              ]
            },
            {
              "sub-category": "Phishing",
              campaigns: [
                {
                  name: "Reconnaître les arnaques par email",
                  duration: 7,
                  courses_number: 1,
                  replay: 1,
                  certificant: 1,
                  Quiz: 1,
                  Scenes: 1,
                  Video: 1,
                  langs: [
                    {
                      lang: "fr",
                      name: "Reconnaître les arnaques par email",
                      description: "Identifiez les messages frauduleux pour éviter de vous faire piéger."
                    }
                  ],
                  variants: [
                    {
                      model_id: 2,
                      variant_name: "Standard",
                      available_languages: ["fr"],
                      thumbnail: "https://example.com/thumbnails/phishing.png"
                    }
                  ]
                }
              ]
            },
            {
              "sub-category": "Utilisation publique",
              campaigns: [
                {
                  name: "Wi-Fi public : les bons réflexes",
                  duration: 6,
                  courses_number: 1,
                  replay: 1,
                  certificant: 1,
                  Quiz: 1,
                  Scenes: 1,
                  Video: 1,
                  langs: [
                    {
                      lang: "fr",
                      name: "Wi-Fi public : les bons réflexes",
                      description: "Apprenez comment utiliser les réseaux Wi-Fi publics en toute sécurité."
                    }
                  ],
                  variants: [
                    {
                      model_id: 3,
                      variant_name: "Standard",
                      available_languages: ["fr"],
                      thumbnail: "https://example.com/thumbnails/wifi.png"
                    }
                  ]
                }
              ]
            },
            {
              "sub-category": "Vie privée",
              campaigns: [
                {
                  name: "Protéger ses données personnelles",
                  duration: 8,
                  courses_number: 2,
                  replay: 1,
                  certificant: 1,
                  Quiz: 1,
                  Scenes: 1,
                  Video: 1,
                  langs: [
                    {
                      lang: "fr",
                      name: "Protéger ses données personnelles",
                      description: "Comprenez pourquoi et comment protéger vos informations personnelles en ligne."
                    }
                  ],
                  variants: [
                    {
                      model_id: 4,
                      variant_name: "Standard",
                      available_languages: ["fr"],
                      thumbnail: "https://example.com/thumbnails/donnees.png"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  res.json({ data: models });
});

module.exports = router;
