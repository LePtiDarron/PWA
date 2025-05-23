const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const models = [
    {
      category: 'Category 1',
      subcategories: [
        {
          subcategory: 'Subcategory 1-1',
          campaigns: [
            {
              name: 'Campaign 1',
              duration: 30,
              courses_number: 5,
              replay: 1,
              certificant: 1,
              Quiz: 1,
              Scenes: 1,
              Video: 0,
              langs: [
                {
                  lang: 'fr',
                  name: 'Français',
                  description: 'Description en français',
                },
                {
                  lang: 'en',
                  name: 'English',
                  description: 'Description in English',
                },
              ],
              variants: [
                {
                  model_id: 1,
                  variant_name: 'Variant 1',
                  available_languages: ['fr'],
                  thumbnail: 'thumbnail1.png',
                },
              ],
            },
          ],
        },
        {
          subcategory: 'Subcategory 1-2',
          campaigns: [
            {
              name: 'Campaign 2',
              duration: 45,
              courses_number: 3,
              replay: 2,
              certificant: 0,
              Quiz: 0,
              Scenes: 1,
              Video: 1,
              langs: [
                {
                  lang: 'fr',
                  name: 'Français',
                  description: 'Description en français',
                },
              ],
              variants: [
                {
                  model_id: 2,
                  variant_name: 'Variant 2',
                  available_languages: ['fr'],
                  thumbnail: 'thumbnail2.png',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  res.json(models);
});

module.exports = router;
