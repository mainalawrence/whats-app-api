"use strict";
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["**/**/*.test.ts"],
    verbose: true,
    forceExit: false,
    clearMocks: true,
    detectOpenHandles: true,
    maxWorkers: 1
};
