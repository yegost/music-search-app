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