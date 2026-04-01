require('dotenv').config()
const mongoose = require('mongoose')
const Partij = require('./models/Partij')
const SpelerStat = require('./models/SpelerStat')

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  const results = await Partij.aggregate([
    {
      $group: {
        _id: { spelerID: '$spelerID', seizoenID: '$seizoenID' },
        teHalenGemiddelde: { $avg: '$teHalenGemiddelde' },
        aantalCaramboles: { $avg: '$aantalCaramboles' }
      }
    }
  ])

  console.log(`Found ${results.length} (speler, seizoen) combinations`)

  let inserted = 0
  let skipped = 0

  for (const r of results) {
    const { spelerID, seizoenID } = r._id
    if (!spelerID || !seizoenID) { skipped++; continue }

    await SpelerStat.updateOne(
      { spelerID, seizoenID },
      {
        $setOnInsert: {
          spelerID,
          seizoenID,
          teHalenGemiddelde: Math.round(r.teHalenGemiddelde * 1000) / 1000,
          aantalCaramboles: Math.round(r.aantalCaramboles)
        }
      },
      { upsert: true }
    )
    inserted++
  }

  console.log(`Done. ${inserted} upserted, ${skipped} skipped (missing spelerID or seizoenID).`)
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
