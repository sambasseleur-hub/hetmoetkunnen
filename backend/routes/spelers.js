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

router.get('/weken', async (req, res) => {
  try {
    const match = {}
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)

    const weken = await Partij.aggregate([
      { $match: match },
      { $group: { _id: { $isoWeek: '$datum' } } },
      { $sort: { _id: 1 } }
    ])
    res.json(weken.map(w => w._id).filter(Boolean))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const match = {}
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)
    if (req.query.week) match.$expr = { $eq: [{ $isoWeek: '$datum' }, parseInt(req.query.week)] }

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
          beurten: '$totaalBeurten',
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

router.get('/:id/partijen', async (req, res) => {
  try {
    const match = { spelerID: parseInt(req.params.id) }
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)
    if (req.query.week) match.$expr = { $eq: [{ $isoWeek: '$datum' }, parseInt(req.query.week)] }

    const partijen = await Partij.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'lids',
          localField: 'tegenstanderID',
          foreignField: 'lidNummer',
          as: 'tegenstander'
        }
      },
      { $unwind: { path: '$tegenstander', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          datum: 1,
          seizoenID: 1,
          caramboles: 1,
          aantalCaramboles: 1,
          beurten: 1,
          hoogsteSet: 1,
          gemiddelde: 1,
          teHalenGemiddelde: 1,
          plusMin: 1,
          tegenstander: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$tegenstander.schermnaam', ''] } }, 0] },
              then: '$tegenstander.schermnaam',
              else: { $concat: [{ $ifNull: ['$tegenstander.voornaam', 'Onbekend'] }, ' ', { $ifNull: ['$tegenstander.achternaam', ''] }] }
            }
          }
        }
      },
      { $sort: { datum: -1 } }
    ])
    res.json(partijen)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
