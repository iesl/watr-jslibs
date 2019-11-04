module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "globals": {
    "ts-jest": {
      "tsConfig": "tsconfig.json",
      "diagnostics": {
        "ignoreCodes": [
          151001,
          7016
        ]
      }
    }
  },
  setupFiles: ['./src/module-alias/index.ts'],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],

  "moduleNameMapper": {
    // "^Config(.*)$": "<rootDir>/src/config$1",
    "^@/lib/(.*)$": "./src/lib/$1"
  }

};
