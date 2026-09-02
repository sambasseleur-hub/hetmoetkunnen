require('dotenv').config()
const mongoose = require('mongoose')
const FotoAlbum = require('./models/FotoAlbum')

const ALBUMS = [
  ['Lustrum uitje 2024', 2024],
  ['Demo Raymond Ceulemans', 2024],
  ['Jaarlijks uitje 2023', 2023],
  ['Jaarlijks uitje 2022', 2022],
  ['Clubkampioenschappen en finales supercup 2020 en 2021', 2021],
  ['Kerst 2019', 2019],
  ['Clubkampioenschap en finale Ome Jaap Cup 2019', 2019],
  ['Lustrum uitje 2019', 2019],
  ['Kerst 2018', 2018],
  ['Uitwisseling Oosthuizen 2018', 2018],
  ['Club Kampioenschap en Ome Jaap Cup finale 2018', 2018],
  ['Jaarlijks uitje 2018', 2018],
  ['Club Kampioenschap en Ome Jaap Cup finale 2017', 2017],
  ['Jaarlijks uitje 2017', 2017],
  ['Club Kampioenschap en Ome Jaap Cup finale 2016', 2016],
  ['Jaarlijks uitje 2016', 2016],
  ['Club Kampioenschap en Ome Jaap Cup finale 2015', 2015],
  ['Jaarlijks uitje 2015', 2015],
  ['Lustrum uitje 2015', 2015],
  ['Kerst 2014', 2014],
  ['Club Kampioenschap en Ome Jaap Cup finale 2013', 2013],
  ['Kerst 2012', 2012],
  ['Club Kampioenschap en Ome Jaap Cup finale 2012', 2012],
  ['Kerst 2011', 2011],
  ['Club kampioenschap en Ome Jaap Cup finale 2011', 2011],
  ['Jaarlijks uitje 2011', 2011],
  ['Jaarlijks uitje 2010', 2010],
  ['Lustrum uitje 2009', 2009]
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  for (const [titel, jaar] of ALBUMS) {
    await FotoAlbum.updateOne(
      { titel },
      { $set: { titel, jaar } },
      { upsert: true }
    )
  }

  console.log(`Done. ${ALBUMS.length} albums upserted.`)
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
