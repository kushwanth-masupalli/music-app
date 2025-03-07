const searchInput = document.getElementById('searchInput');
const audio = document.getElementById("audio");
let timer;

searchInput.addEventListener('input', () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
        const query = searchInput.value.trim();
        if (query) {
            console.log(query);
            searchSongs(query);
        }
    }, 2000);
});

async function searchSongs(query = '') {
    try {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        if (data.length === 0) {
            throw new Error('No songs found');
        }

        // Get the first video's videoId
        const firstVideo = data[0];
        const videoId = firstVideo.videoId;

        // Fetch the audio URL using the videoId
        const audioUrl = await getAudioUrl(videoId);

        // Set the audio element's source to the audio URL
        audio.src = audioUrl;

        // Optionally, you can automatically play the audio
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function getAudioUrl(videoId) {
    try {
        // Use the correct endpoint `/audio`
        const response = await fetch(`/audio?videoId=${videoId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch audio URL');
        }
        const data = await response.json();
        return data.audioUrl; // Ensure this matches the property name in the backend response
    } catch (error) {
        console.error('Error fetching audio URL:', error);
        throw error;
    }
}