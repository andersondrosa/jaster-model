module.exports = {
  
  bail: true,

  "verbose": true,

  testMatch: ["<rootDir>/tests/**/*.test.js?(x)"],

  testEnvironment: "node",

  modulePathIgnorePatterns: ["<rootDir>/cache/", "<rootDir>/node_modules/"],
}