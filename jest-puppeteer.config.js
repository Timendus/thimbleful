const config = require('./package.json').config;

module.exports = {
  server: {
    command: 'npm run test-server',
    port: config.testPort, // Port to check to see if server is up
    launchTimeout: 30000
  }
}
