require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const Lid = require('./models/Lid')

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

  const rows = parseCSV('/data/leden.csv')

  const docs = rows.map(r => ({
    lidNummer: Number(r.LidNummer),
    actiefLid: r.ActiefLid === '1',
    voornaam: r.Voornaam,
    achternaam: r.Achternaam,
    aantalCaramboles: Number(r.AantalCaramboles) || 0,
    soortlid: r.Soortlid,
    schermnaam: r.Schermnaam || ''
  }))

  console.log(`Importing ${docs.length} leden...`)
  await Lid.insertMany(docs, { ordered: false })
  console.log('Done.')
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
