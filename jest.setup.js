// Be a bit more patient on Travis CI
// (Otherwise, Jest gives an error after 5 seconds)
// https://jestjs.io/docs/en/jest-object#jestsettimeouttimeout
jest.setTimeout(30000);
