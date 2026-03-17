const searchBar = document.getElementById('search-input');
const results = document.getElementById('results');
const headerText = document.getElementById('header-text');

let debounceTimer;

searchBar.addEventListener('input', async () => {
    clearTimeout(debounceTimer)
    const artist = searchBar.value;
    if (!artist) {
        results.innerHTML = '';
        return;
    };

    debounceTimer = setTimeout(async () => {
        const res = await fetch(`/search?artist=${artist}`);
        const data = await res.json()
        
        results.innerHTML = ''
        data.forEach(artist => {
            results.innerHTML += `
                <div class="artist-result" data-id="${artist.id}">
                    <img src="${artist.images[2]?.url || '/images/placeholder.png'}" alt="${artist.name}" />
                    <p>${artist.name}</p>
                </div>
            `
        });
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
    const name = card.querySelector('p').textContent
    const image = card.querySelector('img').src

    const albumsRes = await fetch(`/artist/${id}/albums`)
    const albumsData = await albumsRes.json()

    results.innerHTML = ''
    searchBar.value = ''

    const artistPage = document.getElementById('artist-page')
    const artistHeader = document.getElementById('artist-header')
    const albumsSection = document.getElementById('albums-section')

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
                        <img src="${album.images[0]?.url || '/public/images/placeholder.png'}" alt="${album.name}" />
                        <h4>${album.name.length > 31
                            ? album.name.slice(0, 31) + '...'
                            : album.name
                        }</h4>
                        <p>${album.release_date.slice(0, 4)}</p>
                    </div>
                `).join('')}
        </div>
    `

    headerText.classList.add('hidden')
    artistPage.classList.remove('hidden')
})