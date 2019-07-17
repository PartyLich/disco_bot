import https from 'https';


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
