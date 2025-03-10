const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Replace with your API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyDMNtvqgiZx3mgLse67d4tGTIhd0Y2XxZM';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

app.use(cors());
app.use(express.static('public'));



app.get('/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  console.log(`Searching for: "${query}"`);
  
  try {
    console.log(`Making request to YouTube API with key: ${YOUTUBE_API_KEY.substring(0, 3)}...${YOUTUBE_API_KEY.substring(YOUTUBE_API_KEY.length - 3)}`);
    
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log(`YouTube API response status: ${response.status}`);
    
    if (!response.data || !response.data.items) {
      console.error('Invalid response format:', JSON.stringify(response.data));
      return res.status(404).json({ error: 'No results found or invalid response format' });
    }
    
    const items = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
    }));
    
    console.log(`Returning ${items.length} results`);
    res.json(items);
    
  } catch (err) {
    console.error('YouTube API error details:');
    
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${err.response.status}`);
      console.error(`Response data:`, err.response.data);
      console.error(`Response headers:`, err.response.headers);
      
      // More specific error handling based on status codes
      if (err.response.status === 403) {
        return res.status(500).json({ 
          error: 'YouTube API access forbidden. Your API key may be invalid or restricted.',
          details: err.response.data 
        });
      } else if (err.response.status === 400) {
        return res.status(500).json({ 
          error: 'Bad request to YouTube API. Check your parameters.',
          details: err.response.data 
        });
      } else if (err.response.status === 429) {
        return res.status(500).json({ 
          error: 'YouTube API quota exceeded. Try again later.',
          details: err.response.data 
        });
      }
    } else if (err.request) {
      // The request was made but no response was received
      console.error('No response received:', err.request);
      return res.status(500).json({ 
        error: 'No response received from YouTube API. Service may be down.',
        details: 'No response data available'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', err.message);
    }
    
    // Generic error response as fallback
    res.status(500).json({ 
      error: 'Failed to fetch data from YouTube',
      message: err.message
    });
  }
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Using YouTube API key: ${YOUTUBE_API_KEY.substring(0, 3)}...${YOUTUBE_API_KEY.substring(YOUTUBE_API_KEY.length - 3)}`);
});