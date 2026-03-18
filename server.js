const express = require('express')
const fetch = require('node-fetch')
const dotenv = require('dotenv')
const app = express()
const PORT = 3000

dotenv.config()

app.use(express.static('public'))

let cachedToken = null
let tokenExpiry = null

async function getToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken
    }

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
    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return cachedToken
}

app.get('/search', async (req, res) => {
    const artist = req.query.artist
    if (!artist) return res.status(400).json({ error: 'no artist provided' })
    
    try {
        const token = await getToken()
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=5`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await response.json()
        res.json(data.artists.items)
    } catch (error) {
        res.status(500).json({ error: 'something went wrong' })
    }
})

app.get('/artist/:id/albums', async (req, res) => {
    const token = await getToken()
    const id = req.params.id

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/artists/${id}/albums?limit=10`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'something went wrong' })
    }
})

app.get('/albums/:id', async (req, res) => {
    const token = await getToken()
    const id = req.params.id

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/albums/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        const data = await response.json()
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'something went wrong'})
    }
})

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})