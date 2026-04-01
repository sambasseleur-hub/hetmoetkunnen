const mongoose = require('mongoose')

const lidSchema = new mongoose.Schema({
  lidNummer: { type: Number, required: true, unique: true },
  actiefLid: { type: Boolean, required: true },
  voornaam: { type: String, required: true },
  achternaam: { type: String, required: true },
  aantalCaramboles: { type: Number, default: 0 },
  soortlid: { type: String, required: true },
  schermnaam: { type: String, default: '' }
})

module.exports = mongoose.model('Lid', lidSchema)
