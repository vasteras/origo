const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 1337;
const cors = require('cors-anywhere');
const fs = require('fs');

cors.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: [],
  removeHeaders: ['cookie', 'cookie2'],
  httpsOptions: {
    key: fs.readFileSync('/home/bv176/CODE/origo-vasteras-NEW/cors/certs/example.com.key'),
    cert: fs.readFileSync('/home/bv176/CODE/origo-vasteras-NEW/cors/certs/example.com.crt')
  }
}).listen(port, host, () => {
  console.log(`Running CORS Anywhere on ${host}:${port}`);
});
