const express = require('express')
const router = express.Router()
const Lid = require('../models/Lid')

router.get('/', async (_req, res) => {
  try {
    const leden = await Lid.find({ actiefLid: true }).sort({ achternaam: 1, voornaam: 1 })
    res.json(leden)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
