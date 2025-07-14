module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverageFrom: [
		'scripts/**/*.{js,ts}',
		'models/**/*.{js,ts}',
		'controllers/**/*.{js,ts}',
		'!**/node_modules/**',
		'!**/dist/**',
	],
};
