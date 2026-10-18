const server = require('../server.cjs');

module.exports = (req, res) => {
  server.emit('request', req, res);
};
