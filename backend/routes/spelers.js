const express = require('express')
const router = express.Router()
const Partij = require('../models/Partij')

router.get('/seizoenen', async (_req, res) => {
  try {
    const seizoenen = await Partij.distinct('seizoenID')
    res.json(seizoenen.filter(Boolean).sort((a, b) => b - a))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const match = {}
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)

    const stats = await Partij.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$spelerID',
          aantalPartijen: { $sum: 1 },
          gewonnen: { $sum: { $cond: [{ $gt: ['$plusMin', 0] }, 1, 0] } },
          totaalCaramboles: { $sum: '$caramboles' },
          totaalBeurten: { $sum: '$beurten' },
          hoogsteSet: { $max: '$hoogsteSet' },
          totaalPlusMin: { $sum: '$plusMin' },
          gemiddeldeTeHalen: { $avg: '$teHalenGemiddelde' },
          gemiddeldePartij: { $avg: '$gemiddelde' }
        }
      },
      {
        $lookup: {
          from: 'lids',
          localField: '_id',
          foreignField: 'lidNummer',
          as: 'lid'
        }
      },
      {
        $unwind: { path: '$lid', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          spelerID: '$_id',
          naam: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$lid.schermnaam', ''] } }, 0] },
              then: '$lid.schermnaam',
              else: { $concat: [{ $ifNull: ['$lid.voornaam', 'Speler'] }, ' ', { $ifNull: ['$lid.achternaam', ''] }] }
            }
          },
          aantalPartijen: 1,
          gewonnen: 1,
          totaalCaramboles: 1,
          gemiddelde: {
            $cond: [
              { $gt: ['$totaalBeurten', 0] },
              { $round: [{ $divide: ['$totaalCaramboles', '$totaalBeurten'] }, 3] },
              0
            ]
          },
          hoogsteSet: 1,
          plusMin: { $round: ['$totaalPlusMin', 3] },
          teHalenGemiddelde: { $round: ['$gemiddeldeTeHalen', 3] },
          gemiddeldePartij: { $round: ['$gemiddeldePartij', 3] }
        }
      },
      { $sort: { naam: 1 } }
    ])
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
