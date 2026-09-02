const mongoose = require('mongoose')

const nieuwsSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  datum: { type: Date, required: true },
  samenvatting: { type: String, required: true },
  categorie: { type: String, default: 'Evenementen' }
})

module.exports = mongoose.model('Nieuws', nieuwsSchema)
