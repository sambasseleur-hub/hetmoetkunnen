require('dotenv').config()
const mongoose = require('mongoose')
const Nieuws = require('./models/Nieuws')

const NIEUWS = [
  {
    titel: 'Clubkampioenschap',
    datum: new Date('2025-10-16'),
    samenvatting: 'Zondag 30 november 2025, 11.30 uur, Het Thomas Café. Details over de kampioenschapswedstrijden, Ome Jaap Cup deelnemers en SuperCup deelnemers met speelvormen.'
  },
  {
    titel: 'Uitwisseling Oosthuizen',
    datum: new Date('2024-11-19'),
    samenvatting: 'Er zijn nu 2 nieuwe data voorgesteld vanuit Oosthuizen. 14 en 21 maart 2025.'
  },
  {
    titel: 'Ome Jaap 2025',
    datum: new Date('2024-11-18'),
    samenvatting: 'Loting gehouden op 20 februari. Vier poules met deelnemers en speeldata van mei tot en met juli, inclusief details over doorstroming naar de halve finale.'
  },
  {
    titel: 'Jaarlijks uitje 2025',
    datum: new Date('2024-11-18'),
    samenvatting: 'We gaan weer iets organiseren, ideeën zijn altijd welkom!'
  },
  {
    titel: 'Demonstratie Jop de Jong',
    datum: new Date('2024-11-18'),
    samenvatting: 'Kunstbiljart demonstratie gepland; kosten en datum volgen nog.'
  },
  {
    titel: 'Uitwisseling Oosthuizen',
    datum: new Date('2024-11-18'),
    samenvatting: 'Voorgestelde datum 24 januari botst met toernooischema; nieuwe datum na 9 februari gevraagd.'
  },
  {
    titel: 'Kersttoernooi 18-12',
    datum: new Date('2024-11-18'),
    samenvatting: 'Aanvang: 19.30 uur. Kersttoernooi met verschillende biljartspelvormen.'
  },
  {
    titel: 'Draaiboek 2024-2025',
    datum: new Date('2024-11-18'),
    samenvatting: 'Volledig overzicht van alle clubevenementen en externe biljarttoernooien gedurende het seizoen.'
  },
  {
    titel: '3banden Survival',
    datum: new Date('2024-10-14'),
    samenvatting: 'Het eerste HMK 3banden Survival toernooi, gehouden op 12 oktober. Erik won het eerste, leden-only, evenement.'
  },
  {
    titel: 'Clubkampioenschap',
    datum: new Date('2024-09-19'),
    samenvatting: 'Kampioenschap van 10 november aangekondigd met deelnemerspairing en speelvormen.'
  }
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  for (const item of NIEUWS) {
    await Nieuws.updateOne(
      { titel: item.titel, datum: item.datum },
      { $set: item },
      { upsert: true }
    )
  }

  console.log(`Done. ${NIEUWS.length} nieuwsberichten upserted.`)
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
