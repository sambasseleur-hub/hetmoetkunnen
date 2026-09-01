const express = require('express')
const router = express.Router()
const Kampioen = require('../models/Kampioen')

router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.type) filter.type = req.query.type
    const kampioenen = await Kampioen.find(filter).sort({ jaar: -1 })
    res.json(kampioenen)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const kampioen = new Kampioen(req.body)
    const saved = await kampioen.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Er is al een kampioen voor dit jaar en type' })
    }
    res.status(400).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const updated = await Kampioen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Niet gevonden' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Kampioen.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Niet gevonden' })
    res.json({ message: 'Verwijderd' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
