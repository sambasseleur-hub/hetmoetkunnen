const mongoose = require('mongoose')

const spelerStatSchema = new mongoose.Schema({
  spelerID: { type: Number, required: true },
  seizoenID: { type: Number, required: true },
  teHalenGemiddelde: { type: Number, required: true },
  aantalCaramboles: { type: Number, required: true }
})

spelerStatSchema.index({ spelerID: 1, seizoenID: 1 }, { unique: true })

module.exports = mongoose.model('SpelerStat', spelerStatSchema)
