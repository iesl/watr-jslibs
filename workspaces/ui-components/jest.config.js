module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverage: false,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
  ],
  roots: [
    "<rootDir>/src"
  ],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
      diagnostics: {
        ignoreCodes: [
          151001,
          7016
        ]
      }
    }
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$"
};
