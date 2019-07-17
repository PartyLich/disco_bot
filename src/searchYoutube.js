import https from 'https';

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
