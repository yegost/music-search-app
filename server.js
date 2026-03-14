const express = require('express')
const fetch = require('node-fetch')
require('dotenv').config()

const app = express()
const PORT = 3000

app.use(express.static('public'))

app.get('/search', async (req, res) => {
    const artist = req.query.artist
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&api_key=${process.env.LASTFM_KEY}&format=json`

    try {
        const response = await fetch(url)
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'something went wrong' })
    }
})

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})

