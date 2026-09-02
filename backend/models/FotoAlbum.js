const mongoose = require('mongoose')

const fotoAlbumSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  jaar: { type: Number, required: true }
})

module.exports = mongoose.model('FotoAlbum', fotoAlbumSchema)
