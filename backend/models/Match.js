const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  caramboles: { type: Number, required: true, min: 0 },
  highScore: { type: Number, required: true, min: 0 },
  turns: { type: Number, required: true, min: 1 }
})

const matchSchema = new mongoose.Schema(
  {
    player1: { type: playerSchema, required: true },
    player2: { type: playerSchema, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Match', matchSchema)
