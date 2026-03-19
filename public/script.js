const mainBg = document.querySelector('main')
const searchBar = document.getElementById('search-input')
const results = document.getElementById('results')
const headerText = document.getElementById('header-text')
const artistPage = document.getElementById('artist-page')
const artistHeader = document.getElementById('artist-header')
const albumsSection = document.getElementById('albums-section')
const albumPage = document.getElementById('album-page')
const albumHeader = document.getElementById('album-header')
const albumTracks = document.getElementById('tracks-list')

let debounceTimer
const state = {
    currentArtist: null,
    currentAlbum: null,
    currentAlbums: null
}

async function api(url) {
    const res = await fetch(url)
    return res.json()
}

async function searchArtists(query) {
    if (!query) return

    try {
        const response = await api(`/search?artist=${query}`) 
        return response;
    } catch(error) {
        console.log(error)
    }
}

async function getArtistAlbums(id) {
    if (!id) return

    try {
        const response = await api(`/artist/${id}/albums`)
        return response
    } catch (error) {
        console.log(error)
    }
}

async function getAlbumData(id) {
    if (!id) return

    try {
        const response = await api(`/albums/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

function formatDuration(ms) {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)

    if (hours > 0) {
        return `${hours}h ${minutes}min`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function totalDuration(tracks) {
    const totalMs = tracks.reduce((sum, track) => sum + track.duration_ms, 0)
    return formatDuration(totalMs)
}

function renderSearchResults(artists) {
    results.innerHTML = '';
    artists.forEach(artist => {
        results.innerHTML += `
            <div class="artist-result" data-id="${artist.id}" data-spotify-url="${artist.external_urls.spotify}">
                <img src="${artist.images[2]?.url || '/images/placeholder.png'}" alt="${artist.name}" />
                <p>${artist.name}</p>
            </div>
        `
    })
}

function renderArtistPage(name, image, albumsData) {
    results.innerHTML = ''
    searchBar.value = ''

    artistHeader.innerHTML = `
        <img id="artist-img" src="${image}" alt="${name}" />
        <div>
            <h2>${name}</h2>
        </div>
    `
    
    albumsSection.innerHTML = `
        <h3>Albums</h3>
        <div id="albums-grid">
            ${albumsData.items.map(album => `
                    <div class="album-card" data-id="${album.id}">
                        <img src="${album.images[0]?.url || '/images/placeholder.png'}" alt="${album.name}" />
                        <h4 class="album-name">${album.name.length > 31
                            ? album.name.slice(0, 31) + '...'
                            : album.name
                        }</h4>
                        <p class="album-year">${album.release_date.slice(0, 4)}</p>
                    </div>
                `).join('')}
        </div>
    `
}

function renderAlbumPage(albumData, albumImage, albumName, releaseDate) {
    albumHeader.innerHTML = `
        <div>
            <img class="album-cover" src="${albumImage}" alt="${albumName}" />
        </div>
        <div class="album-info">
            <p>${albumData.album_type === "album" ? "Album" : "Single"}</p>
            <div class="album-bottom">
                <h2>${albumData.name}</h2>
                <div>
                    ${albumData.artists.length === 1
                        ? `<div class="artist-row">
                                <img src="${state.currentArtist?.image || '/images/placeholder.png'}" alt="${albumData.artists[0].name}" />
                                <a href="${state.currentArtist.spotifyUrl}" target="_blank"><strong>${state.currentArtist.name}</strong></a>
                        </div>`
                        : `<div>
                                ${albumData.artists.map(a => `<a href="${a.external_urls.spotify}" target="_blank">${a.name}</a>`).join(', ')}
                        </div>`
                    }
                </div>
                <div>${releaseDate} - ${albumData.total_tracks} ${albumData.total_tracks > 1 ? "Songs" : "Song"} - ${totalDuration(albumData.tracks.items)}</div>
            </div>
        </div>
    `

    albumTracks.innerHTML = `
        <div class="track-header">
            <span>#</span>
            <span>Title</span>
            <span>Time</span>
        </div>
            ${albumData.tracks.items.map(track => `
                ${track.disc_number > 1 && track.track_number === 1
                    ? `<div class="disc-header">Disc ${track.disc_number}</div>`
                    : ''
                }
                <div class="track-item">
                    <span class="track-number">${track.track_number}</span>
                    <span class="track-name">${track.name}</span>
                    <span class="track-duration">${formatDuration(track.duration_ms)}</span>
                </div>    
            `).join('')}
    `
}

function showPage(page) {
    artistPage.classList.add('hidden')
    albumPage.classList.add('hidden')
    headerText.classList.add('hidden')
    mainBg.classList.remove('hidden')
    page.classList.remove('hidden')
}

searchBar.addEventListener('input', async () => {
    clearTimeout(debounceTimer)
    const artist = searchBar.value
    if (!artist) {
        results.innerHTML = ''
        return
    };

    debounceTimer = setTimeout(async () => {
        const artistData = await searchArtists(artist)
        renderSearchResults(artistData)
    }, 500)
})

searchBar.addEventListener('blur', () => {
    setTimeout(() => {
        results.innerHTML = ``
    }, 150)
})

results.addEventListener('click', async (e) => {
    const card = e.target.closest('.artist-result')
    if (!card) return

    
    const id = card.dataset.id
    const spotifyUrl = card.dataset.spotifyUrl
    const name = card.querySelector('p').textContent
    const image = card.querySelector('img').src
    
    state.currentArtist = { name, image, id, spotifyUrl }

    const albumsData = await getArtistAlbums(id)
    state.currentAlbums = albumsData
    renderArtistPage(name, image, albumsData)
    showPage(artistPage)
})

albumsSection.addEventListener('click', async (e) => {
    const card = e.target.closest('.album-card')
    if (!card) return

    const id = card.dataset.id
    const albumImage = card.querySelector('img').src
    const albumName = card.querySelector('h4').textContent
    const releaseDate = card.querySelector('p').textContent

    const albumData = state.currentAlbum?.id === id
        ? state.currentAlbum
        : await getAlbumData(id)
    state.currentAlbum = albumData
    renderAlbumPage(albumData, albumImage, albumName, releaseDate)

    showPage(albumPage)
})