const express = require('express')
const router = express.Router()
const Match = require('../models/Partij')

// Get all matches (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = 20
    const skip = (page - 1) * limit
    const total = await Match.countDocuments()
    const matches = await Match.aggregate([
      { $sort: { datum: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'lids',
          localField: 'spelerID',
          foreignField: 'lidNummer',
          as: 'speler'
        }
      },
      { $unwind: { path: '$speler', preserveNullAndEmptyArrays: true } },
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
          partijID: 1,
          datum: 1,
          seizoenID: 1,
          caramboles: 1,
          aantalCaramboles: 1,
          beurten: 1,
          hoogsteSet: 1,
          gemiddelde: 1,
          teHalenGemiddelde: 1,
          plusMin: 1,
          spelerNaam: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$speler.schermnaam', ''] } }, 0] },
              then: '$speler.schermnaam',
              else: { $concat: [{ $ifNull: ['$speler.voornaam', 'Onbekend'] }, ' ', { $ifNull: ['$speler.achternaam', ''] }] }
            }
          },
          tegenstanderNaam: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$tegenstander.schermnaam', ''] } }, 0] },
              then: '$tegenstander.schermnaam',
              else: { $concat: [{ $ifNull: ['$tegenstander.voornaam', 'Onbekend'] }, ' ', { $ifNull: ['$tegenstander.achternaam', ''] }] }
            }
          }
        }
      }
    ])
    res.json({ matches, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single match
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
    if (!match) return res.status(404).json({ message: 'Match not found' })
    res.json(match)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create match
router.post('/', async (req, res) => {
  try {
    const last = await Match.findOne().sort({ partijID: -1 }).select('partijID')
    const partijID = (last?.partijID || 0) + 1
    const match = new Match({ ...req.body, partijID })
    const saved = await match.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete match
router.delete('/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id)
    if (!match) return res.status(404).json({ message: 'Match not found' })
    res.json({ message: 'Match deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
