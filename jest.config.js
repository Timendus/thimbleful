const config = require('./package.json').config;

module.exports = {
  preset: 'jest-puppeteer',
  globals: {
    URL: `http://localhost:${config.testPort}/`
  },
  verbose: true,
  setupFilesAfterEnv: ['./jest.setup.js']
}
