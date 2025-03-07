const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

const YOUTUBE_API_KEY = 'AIzaSyDMNtvqgiZx3mgLse67d4tGTIhd0Y2XxZM'; // Replace with your API key
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

app.use(express.static('public'));

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY
      }
    });

    const items = response.data.items.map(item => ({
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      channel: item.snippet.channelTitle
    }));

    if (items.length === 0) {
      return res.status(404).json({ error: 'No songs found' });
    }
    res.json(items);

  } catch (err) {
    console.error('YouTube API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from YouTube' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});