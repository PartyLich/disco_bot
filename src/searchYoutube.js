import https from 'https';

async function searchYoutube(query, topic, apiKey, maxResults) {
  const baseUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet';
  const type = '&type=video';
  const _maxResults = `&maxResults=${maxResults}`;
  const sortOrder = '&order=relevance';
  const _query = `&q=${encodeURIComponent(query)}`;
  const _topic = `&topicId=${encodeURIComponent(topic)}`;
  const _apiKey = `&key=${apiKey}`;
  const request = `${baseUrl}${_maxResults}${sortOrder}${_query}${_topic}${_apiKey}${type}`;

  try {
    const response = await fetch(request);
    return JSON.parse(response);
  } catch (err) {
    console.error(err.message);
  }
}

/**
 * node.js https.get with a promise wrapper
 * @param  {!String} url url to send GET request
 * @return {Object|String}     response string or Error
 */
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(encodeURI(url), (response) => {
      let data = '';

      // A chunk of data has been recieved
      response.on('data', (chunk) => {
        data += chunk;
      });

      // Response completely received
      response.on('end', () => {
        resolve(data);
      });
    })
        .on('error', (err) => {
          reject(err);
        });
  });
}
