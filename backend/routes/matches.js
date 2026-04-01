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
    const matches = await Match.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
    console.log(matches.length)
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
  console.log("posting a match");
  const match = new Match(req.body)
  try {
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
