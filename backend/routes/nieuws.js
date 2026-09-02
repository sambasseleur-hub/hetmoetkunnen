const express = require('express')
const router = express.Router()
const Nieuws = require('../models/Nieuws')

router.get('/', async (_req, res) => {
  try {
    const nieuws = await Nieuws.find().sort({ datum: -1 })
    res.json(nieuws)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const item = new Nieuws(req.body)
    const saved = await item.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const updated = await Nieuws.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Niet gevonden' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Nieuws.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Niet gevonden' })
    res.json({ message: 'Verwijderd' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
