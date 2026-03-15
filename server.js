const express = require('express')
const fetch = require('node-fetch')
const dotenv = require('dotenv')
const app = express()
const PORT = 3000

dotenv.config()

app.use(express.static('public'))

async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(
                process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64')
        },
        body: 'grant_type=client_credentials'
    })
    const data = await response.json()
    return data.access_token
}

app.get('/search', async (req, res) => {
    const artist = req.query.artist
    if (!artist) return res.status(400).json({ error: 'no artist provided' })
    
    try {
        const token = await getToken()
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await response.json()
        res.json(data.artists.items[0])
    } catch (error) {
        res.status(500).json({ error: 'something went wrong' })
    }
})

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})