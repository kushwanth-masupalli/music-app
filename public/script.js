// --- Variables & Elements ---
const searchInput = document.getElementById('searchInput');
const playButton = document.getElementById('playButton');
const playPauseIcon = document.getElementById('playPauseIcon');
const resultsDiv = document.getElementById('results');
const playerContainer = document.getElementById('playerContainer');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
let isPlaying = false;
let timer;

// --- SVG Paths for Play and Pause Icons ---
const playPath = '<path d="M8 5v14l11-7z"/>';
const pausePath = '<path d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"/>';
playPauseIcon.innerHTML = playPath;

// --- Search Debounce Logic ---
searchInput.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const query = searchInput.value.trim();
    if (query) {
      await searchSongs(query);
    }
  }, 500);
});

// --- Search Function ---
async function searchSongs(query) {
  try {
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format');
    }

    resultsDiv.innerHTML = '';
    data.forEach(song => {
      const card = document.createElement('div');
      songArtist.textContent = song.channel;
      songTitle.extContent = song.title;
      card.className = 'song-card';
      card.innerHTML = `
        <img src="${song.thumbnail}" class="song-thumbnail" alt="${song.title}">
        <div>
          <h3>${song.title}</h3>
          <p>${song.channel}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        playSong(song.videoId);
      });
      resultsDiv.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
  }
}

// --- Play Song Function ---
function playSong(videoId) {
  playerContainer.innerHTML = `
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `;
  playPauseIcon.innerHTML = pausePath;
  isPlaying = true;
}

// --- Play/Pause Toggle Button ---
playButton.addEventListener('click', () => {
  const iframe = playerContainer.querySelector('iframe');
  if (!iframe) return;

  const src = iframe.getAttribute('src');
  if (isPlaying) {
    iframe.setAttribute('src', src.replace('autoplay=1', 'autoplay=0'));
    playPauseIcon.innerHTML = playPath;
  } else {
    iframe.setAttribute('src', src.replace('autoplay=0', 'autoplay=1'));
    playPauseIcon.innerHTML = pausePath;
  }
  isPlaying = !isPlaying;
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");
});