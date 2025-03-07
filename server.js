require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// YouTube API endpoint for searching songs
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

app.use(express.static('public'));

// Endpoint to search for videos based on a query
app.get('/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q: `${q} song`,
        type: 'video',
        part: 'snippet',
        maxResults: 1,
        videoCategoryId: 10 // Music category
      }
    });

    const results = response.data.items.map(item => ({
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.medium.url,
      title: item.snippet.title
    }));

    res.json(results);
  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from YouTube API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});