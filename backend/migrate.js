require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const Match = require('./models/Match')

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

  const leden = parseCSV('/data/leden.csv')
  const ledenMap = Object.fromEntries(leden.map(l => [l.LidNummer, l.Schermnaam || `${l.Voornaam} ${l.Achternaam}`.trim()]))

  const partijen = parseCSV('/data/partijen.csv')

  // Index rows by (SpelerID, TegenstanderID) keyed on sorted pair + date
  const byMatch = {}
  for (const row of partijen) {
    const key = `${row.Datum}__${[row.SpelerID, row.TegenstanderID].sort().join('_')}`
    if (!byMatch[key]) byMatch[key] = {}
    byMatch[key][row.SpelerID] = row
  }

  const docs = []
  for (const [, sides] of Object.entries(byMatch)) {
    const rows = Object.values(sides)
    if (rows.length !== 2) continue // skip incomplete pairs
    const [r1, r2] = rows

    docs.push({
      player1: {
        name: ledenMap[r1.SpelerID] || `Speler ${r1.SpelerID}`,
        caramboles: Number(r1.Caramboles),
        highScore: Number(r1.HoogsteSet),
        turns: Number(r1.Beurten)
      },
      player2: {
        name: ledenMap[r2.SpelerID] || `Speler ${r2.SpelerID}`,
        caramboles: Number(r2.Caramboles),
        highScore: Number(r2.HoogsteSet),
        turns: Number(r2.Beurten)
      },
      date: new Date(r1.Datum)
    })
  }

  console.log(`Importing ${docs.length} matches...`)
  await Match.insertMany(docs, { ordered: false })
  console.log('Done.')
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
