const mongoose = require('mongoose')

const partijSchema = new mongoose.Schema({
  partijID: { type: Number, required: true, unique: true },
  datum: { type: Date },
  seizoenID: { type: Number },
  spelerID: { type: Number },
  tegenstanderID: { type: Number },
  aantalCaramboles: { type: Number },
  teHalenGemiddelde: { type: Number },
  caramboles: { type: Number },
  beurten: { type: Number },
  hoogsteSet: { type: Number },
  gemiddelde: { type: Number },
  plusMin: { type: Number }
})

module.exports = mongoose.model('Partij', partijSchema)
