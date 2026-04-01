const express = require('express')
const router = express.Router()
const SpelerStat = require('../models/SpelerStat')
const Lid = require('../models/Lid')

router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.seizoen) filter.seizoenID = parseInt(req.query.seizoen)
    if (req.query.speler) filter.spelerID = parseInt(req.query.speler)

    const stats = await SpelerStat.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'lids',
          localField: 'spelerID',
          foreignField: 'lidNummer',
          as: 'lid'
        }
      },
      { $unwind: { path: '$lid', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          spelerID: 1,
          seizoenID: 1,
          teHalenGemiddelde: 1,
          aantalCaramboles: 1,
          naam: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$lid.schermnaam', ''] } }, 0] },
              then: '$lid.schermnaam',
              else: { $concat: [{ $ifNull: ['$lid.voornaam', 'Speler'] }, ' ', { $ifNull: ['$lid.achternaam', ''] }] }
            }
          }
        }
      },
      { $sort: { seizoenID: -1, naam: 1 } }
    ])
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const stat = new SpelerStat(req.body)
    const saved = await stat.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Deze speler heeft al een record voor dit seizoen' })
    }
    res.status(400).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const updated = await SpelerStat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Niet gevonden' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await SpelerStat.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Niet gevonden' })
    res.json({ message: 'Verwijderd' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
