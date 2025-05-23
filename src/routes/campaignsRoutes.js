const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const models = [
    {
      "campaign_type": "Sensibilisation à la cybersécurité",
      "categories": [
        {
          "category": "Sécurité en ligne",
          "sub-categories": [
            {
              "sub-category": "Protection des comptes",
              "campaigns": [
                {
                  "name": "Mots de passe sécurisés",
                  "duration": 20,
                  "courses_number": 3,
                  "replay": 1,
                  "certificant": 1,
                  "Quiz": 1,
                  "Scenes": 0,
                  "Video": 1,
                  "langs": [
                    {
                      "lang": "fr",
                      "name": "Mots de passe sécurisés",
                      "description": "Apprenez à créer et gérer des mots de passe forts pour sécuriser vos comptes en ligne."
                    }
                  ],
                  "variants": [
                    {
                      "model_id": 101,
                      "variant_name": "Introduction aux mots de passe",
                      "available_languages": ["fr"],
                      "thumbnail": "https://example.com/thumbnails/mots-de-passe.png"
                    }
                  ]
                },
                {
                  "name": "Authentification à deux facteurs",
                  "duration": 15,
                  "courses_number": 2,
                  "replay": 1,
                  "certificant": 0,
                  "Quiz": 1,
                  "Scenes": 1,
                  "Video": 0,
                  "langs": [
                    {
                      "lang": "fr",
                      "name": "Authentification à deux facteurs",
                      "description": "Découvrez comment ajouter une couche de sécurité supplémentaire à vos comptes avec l'authentification à deux facteurs."
                    }
                  ],
                  "variants": [
                    {
                      "model_id": 102,
                      "variant_name": "Sécurité renforcée",
                      "available_languages": ["fr"],
                      "thumbnail": "https://example.com/thumbnails/2fa.png"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "category": "Comportements numériques",
          "sub-categories": [
            {
              "sub-category": "Phishing & arnaques",
              "campaigns": [
                {
                  "name": "Reconnaître les emails frauduleux",
                  "duration": 25,
                  "courses_number": 4,
                  "replay": 1,
                  "certificant": 1,
                  "Quiz": 1,
                  "Scenes": 1,
                  "Video": 1,
                  "langs": [
                    {
                      "lang": "fr",
                      "name": "Reconnaître les emails frauduleux",
                      "description": "Apprenez à identifier les tentatives de phishing et à éviter de vous faire piéger."
                    }
                  ],
                  "variants": [
                    {
                      "model_id": 103,
                      "variant_name": "Simulation de phishing",
                      "available_languages": ["fr"],
                      "thumbnail": "https://example.com/thumbnails/phishing.png"
                    }
                  ]
                }
              ]
            },
            {
              "sub-category": "Utilisation sécurisée des réseaux sociaux",
              "campaigns": [
                {
                  "name": "Vie privée sur les réseaux sociaux",
                  "duration": 30,
                  "courses_number": 5,
                  "replay": 1,
                  "certificant": 1,
                  "Quiz": 1,
                  "Scenes": 1,
                  "Video": 1,
                  "langs": [
                    {
                      "lang": "fr",
                      "name": "Vie privée sur les réseaux sociaux",
                      "description": "Comprenez les risques liés à l’exposition de vos informations personnelles sur les réseaux sociaux et comment les limiter."
                    }
                  ],
                  "variants": [
                    {
                      "model_id": 104,
                      "variant_name": "Protection de la vie privée",
                      "available_languages": ["fr"],
                      "thumbnail": "https://example.com/thumbnails/reseaux-sociaux.png"
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

  res.json(models);
});

module.exports = router;
