const express = require('express')
const router = express.Router()
const Partij = require('../models/Partij')
const Lid = require('../models/Lid')
const Kampioen = require('../models/Kampioen')

const MIN_PARTIJEN_VOOR_RANKING = 6
const BEURTEN_PER_PARTIJ = 20

function normNaam(s) {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

async function kampioenenPerLid() {
  const [lids, kampioenen] = await Promise.all([
    Lid.find({}, 'lidNummer voornaam achternaam'),
    Kampioen.find({}, 'type naam')
  ])

  const lidByNaam = new Map(lids.map(l => [normNaam(`${l.voornaam} ${l.achternaam}`), l.lidNummer]))

  const map = new Map()
  for (const k of kampioenen) {
    const lidNummer = lidByNaam.get(normNaam(k.naam))
    if (!lidNummer) continue
    const entry = map.get(lidNummer) || { club: 0, omejaap: 0 }
    if (k.type === 'club') entry.club++
    else if (k.type === 'omejaap') entry.omejaap++
    map.set(lidNummer, entry)
  }
  return map
}

router.get('/seizoenen', async (_req, res) => {
  try {
    const seizoenen = await Partij.distinct('seizoenID')
    res.json(seizoenen.filter(Boolean).sort((a, b) => b - a))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/weken', async (req, res) => {
  try {
    const match = {}
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)

    const weken = await Partij.aggregate([
      { $match: match },
      { $group: { _id: { $isoWeek: '$datum' } } },
      { $sort: { _id: 1 } }
    ])
    res.json(weken.map(w => w._id).filter(Boolean))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const match = {}
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)
    if (req.query.week) match.$expr = { $eq: [{ $isoWeek: '$datum' }, parseInt(req.query.week)] }

    const stats = await Partij.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$spelerID',
          aantalPartijen: { $sum: 1 },
          gewonnen: { $sum: { $cond: [{ $gt: ['$plusMin', 0] }, 1, 0] } },
          gelijk: { $sum: { $cond: [{ $eq: ['$plusMin', 0] }, 1, 0] } },
          verloren: { $sum: { $cond: [{ $lt: ['$plusMin', 0] }, 1, 0] } },
          totaalCaramboles: { $sum: '$caramboles' },
          totaalBeurten: { $sum: '$beurten' },
          hoogsteSet: { $max: '$hoogsteSet' },
          totaalPlusMin: { $sum: '$plusMin' },
          gemiddeldeTeHalen: { $avg: '$teHalenGemiddelde' },
          gemiddeldePartij: { $avg: '$gemiddelde' }
        }
      },
      {
        $lookup: {
          from: 'lids',
          localField: '_id',
          foreignField: 'lidNummer',
          as: 'lid'
        }
      },
      {
        $unwind: { path: '$lid', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          spelerID: '$_id',
          naam: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$lid.schermnaam', ''] } }, 0] },
              then: '$lid.schermnaam',
              else: { $concat: [{ $ifNull: ['$lid.voornaam', 'Speler'] }, ' ', { $ifNull: ['$lid.achternaam', ''] }] }
            }
          },
          aantalPartijen: 1,
          gewonnen: 1,
          gelijk: 1,
          verloren: 1,
          totaalCaramboles: 1,
          beurten: '$totaalBeurten',
          gemiddelde: {
            $cond: [
              { $gt: ['$totaalBeurten', 0] },
              { $round: [{ $divide: ['$totaalCaramboles', '$totaalBeurten'] }, 3] },
              0
            ]
          },
          hoogsteSet: 1,
          plusMin: {
            $cond: [
              { $gt: ['$gemiddeldeTeHalen', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $subtract: [{ $divide: ['$totaalCaramboles', '$totaalBeurten'] }, '$gemiddeldeTeHalen'] }, '$gemiddeldeTeHalen'] },
                      100
                    ]
                  },
                  2
                ]
              },
              0
            ]
          },
          teHalenGemiddelde: { $round: ['$gemiddeldeTeHalen', 3] },
          gemiddeldePartij: { $round: ['$gemiddeldePartij', 3] },
          gekwalificeerd: { $gte: ['$aantalPartijen', MIN_PARTIJEN_VOOR_RANKING] }
        }
      },
      { $sort: { gekwalificeerd: -1, plusMin: -1 } }
    ])

    const kampioenenMap = await kampioenenPerLid()
    for (const s of stats) {
      const k = kampioenenMap.get(s.spelerID) || { club: 0, omejaap: 0 }
      s.clubKampioen = k.club
      s.omeJaapKampioen = k.omejaap
    }

    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/opkomst', async (req, res) => {
  try {
    const match = {}
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)

    const avonden = await Partij.aggregate([
      { $match: match },
      { $group: { _id: '$datum', spelers: { $addToSet: '$spelerID' } } },
      { $project: { _id: 0, datum: '$_id', aantalSpelers: { $size: '$spelers' } } },
      { $sort: { datum: 1 } }
    ])
    res.json(avonden)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id/partijen', async (req, res) => {
  try {
    const match = { spelerID: parseInt(req.params.id) }
    if (req.query.seizoen) match.seizoenID = parseInt(req.query.seizoen)
    if (req.query.week) match.$expr = { $eq: [{ $isoWeek: '$datum' }, parseInt(req.query.week)] }

    const partijen = await Partij.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'lids',
          localField: 'tegenstanderID',
          foreignField: 'lidNummer',
          as: 'tegenstander'
        }
      },
      { $unwind: { path: '$tegenstander', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          datum: 1,
          seizoenID: 1,
          caramboles: 1,
          aantalCaramboles: 1,
          beurten: 1,
          hoogsteSet: 1,
          gemiddelde: 1,
          teHalenGemiddelde: 1,
          plusMin: 1,
          tegenstander: {
            $cond: {
              if: { $gt: [{ $strLenCP: { $ifNull: ['$tegenstander.schermnaam', ''] } }, 0] },
              then: '$tegenstander.schermnaam',
              else: { $concat: [{ $ifNull: ['$tegenstander.voornaam', 'Onbekend'] }, ' ', { $ifNull: ['$tegenstander.achternaam', ''] }] }
            }
          }
        }
      },
      { $sort: { datum: -1 } }
    ])
    res.json(partijen)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

async function hoogsteSerieRanking(seizoenID) {
  if (!seizoenID) return []
  return Partij.aggregate([
    { $match: { seizoenID } },
    {
      $group: {
        _id: '$spelerID',
        avgTeHalen: { $avg: '$teHalenGemiddelde' },
        maxHS: { $max: '$hoogsteSet' },
        reeksen: { $push: '$hoogsteSet' }
      }
    },
    {
      $project: {
        spelerID: '$_id',
        car: { $round: [{ $multiply: ['$avgTeHalen', BEURTEN_PER_PARTIJ] }, 0] },
        hs: '$maxHS',
        hsAantal: { $size: { $filter: { input: '$reeksen', cond: { $eq: ['$$this', '$maxHS'] } } } }
      }
    },
    {
      $addFields: {
        hsPercent: {
          $cond: [{ $gt: ['$car', 0] }, { $round: [{ $multiply: [{ $divide: ['$hs', '$car'] }, 100] }, 2] }, 0]
        }
      }
    },
    { $sort: { hsPercent: -1 } }
  ])
}

router.get('/hoogste-serie', async (req, res) => {
  try {
    const alleSeizoenen = (await Partij.distinct('seizoenID')).filter(Boolean).sort((a, b) => b - a)
    const seizoen = req.query.seizoen ? parseInt(req.query.seizoen) : alleSeizoenen[0]
    const idx = alleSeizoenen.indexOf(seizoen)
    const vorigSeizoen = idx >= 0 && idx < alleSeizoenen.length - 1 ? alleSeizoenen[idx + 1] : null

    const [huidig, vorig, alleTijden, lids] = await Promise.all([
      hoogsteSerieRanking(seizoen),
      hoogsteSerieRanking(vorigSeizoen),
      Partij.aggregate([
        {
          $group: {
            _id: '$spelerID',
            maxHS: { $max: '$hoogsteSet' },
            reeksen: { $push: { hoogsteSet: '$hoogsteSet', datum: '$datum' } }
          }
        },
        {
          $project: {
            spelerID: '$_id',
            hs: '$maxHS',
            data: {
              $map: {
                input: { $filter: { input: '$reeksen', cond: { $eq: ['$$this.hoogsteSet', '$maxHS'] } } },
                as: 'r',
                in: '$$r.datum'
              }
            }
          }
        },
        {
          $project: {
            spelerID: 1,
            hs: 1,
            gemaaktOp: { $min: '$data' },
            laatsteKeer: { $max: '$data' }
          }
        }
      ]),
      Lid.find({}, 'lidNummer voornaam achternaam schermnaam')
    ])

    const vorigRankMap = new Map(vorig.map((r, i) => [r.spelerID, i + 1]))
    const alleTijdenMap = new Map(alleTijden.map(r => [r.spelerID, r]))
    const lidMap = new Map(lids.map(l => [l.lidNummer, l]))

    function naamVoor(spelerID) {
      const lid = lidMap.get(spelerID)
      if (!lid) return 'Onbekend'
      return lid.schermnaam?.length ? lid.schermnaam : `${lid.voornaam || ''} ${lid.achternaam || ''}`.trim()
    }

    const spelers = huidig.map((r, i) => {
      const rank = i + 1
      const vorigRank = vorigRankMap.get(r.spelerID)
      const alle = alleTijdenMap.get(r.spelerID) || {}
      return {
        rank,
        spelerID: r.spelerID,
        naam: naamVoor(r.spelerID),
        car: r.car,
        hsSeizoen: r.hs,
        hsPercent: r.hsPercent,
        was: vorigRank ? vorigRank - rank : null,
        hsAlleTijden: alle.hs ?? null,
        gemaaktOp: alle.gemaaktOp ?? null,
        laatsteKeer: alle.laatsteKeer && alle.gemaaktOp && +new Date(alle.laatsteKeer) !== +new Date(alle.gemaaktOp)
          ? alle.laatsteKeer
          : null
      }
    })

    res.json({ seizoen, vorigSeizoen, spelers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/laatste-speelavond', async (_req, res) => {
  try {
    const laatste = await Partij.findOne().sort({ datum: -1 }).select('datum')
    if (!laatste) {
      return res.json({ datum: null, partijen: [], hoogsteSerie: [], besteResultaat: [], meesteCaramboles: [] })
    }

    const datum = laatste.datum

    const [rijen, lids] = await Promise.all([
      Partij.find({ datum }),
      Lid.find({}, 'lidNummer voornaam achternaam schermnaam')
    ])

    const lidMap = new Map(lids.map(l => [l.lidNummer, l]))
    function naamVoor(spelerID) {
      const lid = lidMap.get(spelerID)
      if (!lid) return 'Onbekend'
      return lid.schermnaam?.length ? lid.schermnaam : `${lid.voornaam || ''} ${lid.achternaam || ''}`.trim()
    }

    const partijen = rijen
      .filter(r => r.spelerID < r.tegenstanderID)
      .map(r => ({
        spelerNaam: naamVoor(r.spelerID),
        tegenstanderNaam: naamVoor(r.tegenstanderID),
        caramboles: r.caramboles,
        beurten: r.beurten,
        gemiddelde: r.gemiddelde,
        hoogsteSet: r.hoogsteSet,
        plusMin: r.plusMin
      }))

    function top3(field) {
      const bestPerSpeler = new Map()
      for (const r of rijen) {
        const naam = naamVoor(r.spelerID)
        const waarde = r[field]
        if (!bestPerSpeler.has(naam) || waarde > bestPerSpeler.get(naam)) {
          bestPerSpeler.set(naam, waarde)
        }
      }
      return [...bestPerSpeler.entries()]
        .map(([naam, waarde]) => ({ naam, waarde }))
        .sort((a, b) => b.waarde - a.waarde)
        .slice(0, 3)
    }

    const hoogsteSerie = top3('hoogsteSet')
    const besteResultaat = top3('plusMin')
    const meesteCaramboles = top3('caramboles')

    res.json({ datum, partijen, hoogsteSerie, besteResultaat, meesteCaramboles })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
