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
    "^@/(.*)$": "<rootDir>/src/$1",
    "^Src/(.*)": "<rootDir>/src/$1"
  }

};
