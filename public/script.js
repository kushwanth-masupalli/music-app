const playButton = document.getElementById('playButton');
const playPauseIcon = document.getElementById('playPauseIcon');
const audio = document.getElementById('audio');
let isPlaying = false;

// SVG paths for play and pause icons
const playPath = '<path d="M8 5v14l11-7z"/>';
const pausePath = '<path d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"/>';

// Default audio source (replace with your own or backend response)
const defaultSong = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

// Set initial state
audio.src = defaultSong;
playPauseIcon.innerHTML = playPath;

playButton.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playPauseIcon.innerHTML = playPath; // Switch to play icon
    } else {
        audio.play().catch(err => console.error('Playback error:', err));
        playPauseIcon.innerHTML = pausePath; // Switch to pause icon
    }
    isPlaying = !isPlaying;
});

// Optional: Update progress bar and time
audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    const progress = (currentTime / duration) * 100;

    document.getElementById('progressBar').value = progress;
    document.getElementById('timePassed').textContent = formatTime(currentTime);
    document.getElementById('timeLeft').textContent = formatTime(duration - currentTime);
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

