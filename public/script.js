document.addEventListener('DOMContentLoaded', () => {
  // --- Variables & Elements ---
  const searchInput = document.getElementById('searchInput');
  const playButton = document.getElementById('playButton');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const resultsDiv = document.getElementById('results');
  const playerContainer = document.getElementById('playerContainer');
  const songTitle = document.getElementById('songTitle');
  const songArtist = document.getElementById('songArtist');
  const progressBar = document.getElementById('progressBar');
  const currentTimeDisplay = document.getElementById('timePassed');
  const durationDisplay = document.getElementById('timeLeft');
  let isPlaying = false;
  let timer;

  // --- SVG Paths for Play and Pause Icons ---
  const playPath = '<path d="M8 5v14l11-7z"/>';
  const pausePath = '<path d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"/>';
  playPauseIcon.innerHTML = playPath;

  // --- Create an embedded iframe player instead of using videojs ---
  let youtubePlayer = null;
  playerContainer.innerHTML = '<div id="youtube-player"></div>';

  // Initialize YouTube API
  if (!window.YT) {
    // Load YouTube IFrame Player API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Create YouTube player when API is ready
    window.onYouTubeIframeAPIReady = function () {
      youtubePlayer = new YT.Player('youtube-player', {
        height: '315',
        width: '560',
        videoId: '',
        playerVars: {
          'playsinline': 1,
          'controls': 1,
          'rel': 0
        },
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    };
  } else {
    // If YouTube API already loaded
    youtubePlayer = new YT.Player('youtube-player', {
      height: '315',
      width: '560',
      videoId: '',
      playerVars: {
        'playsinline': 1,
        'controls': 1,
        'rel': 0
      },
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }

  // Handle player state changes
  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      playPauseIcon.innerHTML = pausePath;
      isPlaying = true;
      startProgressUpdate();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      playPauseIcon.innerHTML = playPath;
      isPlaying = false;
      stopProgressUpdate();
    }
  }

  // --- Progress Bar Functionality ---
  function startProgressUpdate() {
    timer = setInterval(updateProgress, 500);
  }

  function stopProgressUpdate() {
    clearInterval(timer);
  }

  function updateProgress() {
    if (youtubePlayer && youtubePlayer.getCurrentTime && youtubePlayer.getDuration) {
      const currentTime = youtubePlayer.getCurrentTime();
      const duration = youtubePlayer.getDuration();

      if (duration > 0) {
        progressBar.max = duration;
        progressBar.value = currentTime;

        currentTimeDisplay.textContent = formatTime(currentTime);
        durationDisplay.textContent = formatTime(duration);
      }
    }
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  // --- Seek to new time when user changes progress bar ---
  progressBar.addEventListener('input', () => {
    if (youtubePlayer && youtubePlayer.seekTo) {
      youtubePlayer.seekTo(parseFloat(progressBar.value));
    }
  });

  // --- Search Debounce Logic ---
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const query = searchInput.value.trim();
      if (query) {
        await searchSongs(query);
      } else {
        resultsDiv.innerHTML = '';
      }
    }, 500);
  });

  // --- Search Function ---
  async function searchSongs(query) {
    try {
      resultsDiv.innerHTML = '<p>Searching...</p>';

      const response = await fetch(`/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response contains an error
      if (data.error) {
        console.error('Server error:', data.error);
        resultsDiv.innerHTML = `<p class="error">${data.error}</p>`;
        return;
      }

      // Ensure the response is an array
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format');
      }

      if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
      }

      resultsDiv.innerHTML = '';
      data.forEach((song) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
          <img src="${song.thumbnail}" class="song-thumbnail" alt="${song.title}">
          <div>
            <h3>${song.title}</h3>
            <p>${song.channel}</p>
          </div>
        `;
        card.addEventListener('click', () => {
          songTitle.textContent = song.title;
          songArtist.textContent = song.channel;
          playSong(song.videoId);
        });
        resultsDiv.appendChild(card);
      });
    } catch (error) {
      console.error('Error fetching songs:', error);
      resultsDiv.innerHTML = `<p class="error">Failed to fetch songs: ${error.message}</p>`;
    }
  }

  // --- Play Song Function ---
  function playSong(videoId) {
    try {
      if (!videoId) {
        throw new Error('Invalid video ID');
      }

      // Wait for player to be ready
      if (youtubePlayer && youtubePlayer.loadVideoById) {
        youtubePlayer.loadVideoById(videoId);
        playPauseIcon.innerHTML = pausePath;
        isPlaying = true;
      } else {
        // If player isn't ready yet, retry after a short delay
        setTimeout(() => playSong(videoId), 1000);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      alert('Failed to play this song. Please try another one.');
    }
  }

  // --- Play/Pause Toggle Button ---
  playButton.addEventListener('click', () => {
    if (!youtubePlayer || !youtubePlayer.getPlayerState) {
      alert('YouTube player is not ready yet');
      return;
    }

    // Check if a video is loaded
    if (youtubePlayer.getVideoUrl().indexOf('watch') === -1) {
      alert('Please select a song first');
      return;
    }

    if (isPlaying) {
      youtubePlayer.pauseVideo();
      playPauseIcon.innerHTML = playPath;
      isPlaying = false;
    } else {
      youtubePlayer.playVideo();
      playPauseIcon.innerHTML = pausePath;
      isPlaying = true;
    }
  });

  console.log("Music player initialized with YouTube API");
});