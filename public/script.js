const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-input');
const results = document.getElementById('results');

searchBtn.addEventListener('click', async () => {
    const artist = searchBar.value;
    if (!artist) return;

    const res = await fetch(`/search?artist=${artist}`);
    const data = await res.json()

    results.innerHTML = ''
    data.forEach(artist => {
        results.innerHTML += `
            <div class="artist-result" data-id="${artist.id}">
                <img src="${artist.images[2]?.url}" alt="${artist.name}" />
                <p>${artist.name}</p>
            </div>
        `
    });
})

results.addEventListener('click', async (e) => {
    const card = e.target.closest('.artist-result')
    if (!card) return

    const id = card.dataset.id
    const name = card.querySelector('p').textContent
    const image = card.querySelector('img').src

    const albumsRes = await fetch(`/artist/${id}/albums`)
    const albumsData = await albumsRes.json()

    results.innerHTML = ''

    results.innerHTML = `
        <div id="artist-page">
            <div id="artist-header">
                <img id="artist-img" src="${image}" />
                <div>
                    <h2>${name}</h2>
                </div>
            </div>
            <div id="albums-section">
                <h3>Albums</h3>
                <div id="albums-grid">
                    ${albumsData.items.map((album) => `
                        <div class="album-card" data-id="${album.id}">
                            <img src="${album.images[0]?.url}" alt="${album.name}" />
                            <h5>${album.name.length > 32 
                                ? album.name.slice(0, 31) + '...' 
                                : album.name}</h5>
                            <p>${album.release_date.slice(0, 4)}</p>
                        </div>    
                    `).join('')}
                </div>
            </div>
        </div>
    `
})