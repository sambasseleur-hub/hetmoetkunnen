require('dotenv').config()
const mongoose = require('mongoose')
const Kampioen = require('./models/Kampioen')

const CLUBKAMPIOENEN = [
  [2025, 'Sam Basseleur'], [2024, 'Ton Verheij'], [2023, 'Hans van Pelt'], [2022, 'Erik Vink'],
  [2021, 'Edwin Schans'], [2020, 'Reinier Stijvers'], [2019, 'Ronald Basseleur'], [2018, 'Justin Langkemper'],
  [2017, 'Justin Langkemper'], [2016, 'Ron Hulskemper'], [2015, 'Erik Vink'], [2014, 'Edwin Schans'],
  [2013, 'Rique Bleeker'], [2012, 'Ton Verheij'], [2011, 'Ton Buijs'], [2010, 'Finale niet gespeeld'],
  [2009, 'Hans van Pelt'], [2008, 'Paul Kemper'], [2007, 'Paul Kemper'], [2006, 'Ton Buijs'],
  [2005, 'Erik Vink'], [2004, 'Jan Conijn'], [2003, 'Rob de Boer'], [2002, 'Rolph Meijer'],
  [2001, 'Erik Vink'], [2000, 'Martin Nibbering'], [1999, 'Gerrit van Busschbach'], [1998, 'Rob de Boer'],
  [1997, 'Reinier Stijvers'], [1996, 'Reinier Stijvers'], [1995, 'Jack Kemper'], [1994, 'Rolph Meijer'],
  [1993, 'Rolph Meijer'], [1992, 'Frank Schilder'], [1991, 'Rob de Boer'], [1990, 'Hen de Boer'],
  [1989, 'Martin Nibbering'], [1988, 'Martin Nibbering'], [1987, 'Kees Bouman'], [1986, 'Rolph Meijer'],
  [1985, 'Ed Stevens'], [1984, 'Peter Bleeker']
]

const OME_JAAP_KAMPIOENEN = [
  [2025, 'Jacco Mak'], [2024, 'Jean Paul Pronk'], [2023, 'Marjo Verheij'], [2022, 'Justin Langkemper'],
  [2021, 'Ton Verheij'], [2020, 'Edwin Schans'], [2019, 'Marjo Verheij'], [2018, 'Justin Langkemper'],
  [2017, 'Dennis Langkemper'], [2016, 'Jan Conijn'], [2015, 'Ron Hulskemper'], [2014, 'Ben Hildesheim'],
  [2013, 'Kees Bouman'], [2012, 'Ton Verheij'], [2011, 'Ton Buijs'], [2010, 'Peter Bleeker'],
  [2009, 'Mirjam Groot'], [2008, 'Johan Stapel'], [2007, 'Henk van de Nes'], [2006, 'Hans van Pelt'],
  [2005, 'Jan Conijn'], [2004, 'Ton Buijs'], [2003, 'Dennis van Montfoort'], [2002, 'Jan Conijn'],
  [2001, 'Peter Smidt'], [2000, 'Ad Blauw'], [1999, 'Rob de Boer'], [1998, 'Jack Kemper'],
  [1997, 'Gerrit van Busschbach'], [1996, 'Gerard Slot'], [1995, 'Ome Jaap'], [1994, 'Edwin Schans']
]

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  let upserted = 0
  for (const [type, lijst] of [['club', CLUBKAMPIOENEN], ['omejaap', OME_JAAP_KAMPIOENEN]]) {
    for (const [jaar, naam] of lijst) {
      await Kampioen.updateOne(
        { jaar, type },
        { $set: { naam } },
        { upsert: true }
      )
      upserted++
    }
  }

  console.log(`Done. ${upserted} kampioenen upserted.`)
  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
