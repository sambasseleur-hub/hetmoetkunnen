require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const matchRoutes = require('./routes/matches')
const spelerRoutes = require('./routes/spelers')
const ledenRoutes = require('./routes/leden')
const spelerStatsRoutes = require('./routes/spelerStats')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/matches', matchRoutes)
app.use('/api/spelers', spelerRoutes)
app.use('/api/leden', ledenRoutes)
app.use('/api/speler-stats', spelerStatsRoutes)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT || 3000, () =>
      console.log(`Server running on port ${process.env.PORT || 3000}`)
    )
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
