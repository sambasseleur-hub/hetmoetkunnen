require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const Partij = require('./models/Partij')

function parseCSV(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n')
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
  return lines.slice(1).map(line => {
    const values = []
    let current = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes }
      else if (ch === ',' && !inQuotes) { values.push(current); current = '' }
      else { current += ch }
    }
    values.push(current)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  const rows = parseCSV('/data/partijen.csv')

  const docs = rows.map(r => ({
    partijID: Number(r.PartijID),
    datum: new Date(r.Datum),
    seizoenID: Number(r.SeizoenID),
    spelerID: Number(r.SpelerID),
    tegenstanderID: Number(r.TegenstanderID),
    aantalCaramboles: Number(r.AantalCaramboles),
    teHalenGemiddelde: parseFloat(r.TeHalenGemiddelde) || 0,
    caramboles: Number(r.Caramboles),
    beurten: Number(r.Beurten),
    hoogsteSet: Number(r.HoogsteSet),
    gemiddelde: parseFloat(r.Gemiddelde) || 0,
    plusMin: parseFloat(r.PlusMin) || 0
  }))

  console.log(`Importing ${docs.length} partijen...`)
  await Partij.insertMany(docs, { ordered: false })
  console.log('Done.')
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
