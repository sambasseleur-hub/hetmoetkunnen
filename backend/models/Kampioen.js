const mongoose = require('mongoose')

const kampioenSchema = new mongoose.Schema({
  jaar: { type: Number, required: true },
  type: { type: String, required: true, enum: ['club', 'omejaap'] },
  naam: { type: String, required: true }
})

kampioenSchema.index({ jaar: 1, type: 1 }, { unique: true })

module.exports = mongoose.model('Kampioen', kampioenSchema)
