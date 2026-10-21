const express = require('express')
const router = express.Router()
const Lid = require('../models/Lid')
const requireAuth = require('../middleware/requireAuth')

router.get('/', async (_req, res) => {
  try {
    const leden = await Lid.find({ actiefLid: true }).sort({ achternaam: 1, voornaam: 1 })
    res.json(leden)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/alle', requireAuth, async (_req, res) => {
  try {
    const leden = await Lid.find({}).sort({ achternaam: 1, voornaam: 1 })
    res.json(leden)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id/actief', requireAuth, async (req, res) => {
  try {
    const lid = await Lid.findOneAndUpdate(
      { lidNummer: req.params.id },
      { $set: { actiefLid: !!req.body.actiefLid } },
      { new: true }
    )
    if (!lid) return res.status(404).json({ message: 'Lid niet gevonden' })
    res.json(lid)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
