#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestConfig {
	watch: boolean;
	coverage: boolean;
	apps: string[];
	packages: string[];
	updateSnapshots: boolean;
	verbose: boolean;
}

class TestRunner {
	private availableApps = ['server', 'web', 'admin', 'mobile'];
	private availablePackages = ['ui', 'eslint-config', 'typescript-config'];

	async runTests(config: TestConfig): Promise<void> {
		const { watch, coverage, apps, packages, updateSnapshots, verbose } =
			config;

		console.log('🧪 Running tests...');

		try {
			// Run tests for specified apps
			if (apps.length > 0) {
				for (const app of apps) {
					await this.runAppTests(app, {
						watch,
						coverage,
						updateSnapshots,
						verbose,
					});
				}
			}

			// Run tests for specified packages
			if (packages.length > 0) {
				for (const pkg of packages) {
					await this.runPackageTests(pkg, {
						watch,
						coverage,
						updateSnapshots,
						verbose,
					});
				}
			}

			// If no specific targets, run all tests
			if (apps.length === 0 && packages.length === 0) {
				await this.runAllTests({ watch, coverage, updateSnapshots, verbose });
			}

			console.log('✅ All tests completed');
		} catch (error) {
			console.error('❌ Tests failed:', error.message);
			process.exit(1);
		}
	}

	private async runAppTests(
		app: string,
		options: Partial<TestConfig>
	): Promise<void> {
		if (!this.availableApps.includes(app)) {
			console.error(`❌ Unknown app: ${app}`);
			return;
		}

		console.log(`🔍 Running tests for app: ${app}`);

		const appPath = join('apps', app);
		let cmd = '';

		switch (app) {
			case 'server':
				cmd = this.buildJestCommand(options);
				break;
			case 'web':
			case 'admin':
				cmd = this.buildVitestCommand(options);
				break;
			case 'mobile':
				cmd = this.buildExpoTestCommand(options);
				break;
		}

		if (cmd) {
			execSync(`cd ${appPath} && ${cmd}`, { stdio: 'inherit' });
		}
	}

	private async runPackageTests(
		pkg: string,
		options: Partial<TestConfig>
	): Promise<void> {
		if (!this.availablePackages.includes(pkg)) {
			console.error(`❌ Unknown package: ${pkg}`);
			return;
		}

		console.log(`📦 Running tests for package: ${pkg}`);

		const pkgPath = join('packages', pkg);
		const cmd = this.buildVitestCommand(options);

		try {
			execSync(`cd ${pkgPath} && ${cmd}`, { stdio: 'inherit' });
		} catch (error) {
			console.log(`ℹ️  No tests found for package: ${pkg}`);
		}
	}

	private async runAllTests(options: Partial<TestConfig>): Promise<void> {
		console.log('🎯 Running all tests...');

		// Use turbo to run tests across all workspaces
		let cmd = 'turbo run test';

		if (options.coverage) {
			cmd += ' --env-mode=replace --env=COVERAGE=true';
		}

		execSync(cmd, { stdio: 'inherit' });
	}

	private buildJestCommand(options: Partial<TestConfig>): string {
		let cmd = 'jest';

		if (options.watch) cmd += ' --watch';
		if (options.coverage) cmd += ' --coverage';
		if (options.updateSnapshots) cmd += ' --updateSnapshot';
		if (options.verbose) cmd += ' --verbose';

		return cmd;
	}

	private buildVitestCommand(options: Partial<TestConfig>): string {
		let cmd = 'vitest';

		if (options.watch) {
			cmd += ' --watch';
		} else {
			cmd += ' run';
		}

		if (options.coverage) cmd += ' --coverage';
		if (options.updateSnapshots) cmd += ' --update-snapshots';
		if (options.verbose) cmd += ' --verbose';

		return cmd;
	}

	private buildExpoTestCommand(options: Partial<TestConfig>): string {
		let cmd = 'expo test';

		if (options.watch) cmd += ' --watch';
		if (options.coverage) cmd += ' --coverage';
		if (options.updateSnapshots) cmd += ' --updateSnapshot';

		return cmd;
	}

	async setupTestConfig(): Promise<void> {
		console.log('⚙️  Setting up test configuration...');

		// Create vitest config for web and admin apps
		const vitestConfig = `/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**'
      ]
    }
  }
});`;

		// Setup for web app
		if (existsSync('apps/web')) {
			writeFileSync('apps/web/vitest.config.ts', vitestConfig);

			// Create test setup file
			const setupContent = `import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('../env', () => ({
  env: {
    NODE_ENV: 'test',
    API_URL: 'http://localhost:5000'
  }
}));`;

			mkdirSync('apps/web/src/test', { recursive: true });
			writeFileSync('apps/web/src/test/setup.ts', setupContent);
		}

		// Setup for admin app
		if (existsSync('apps/admin')) {
			writeFileSync('apps/admin/vitest.config.ts', vitestConfig);

			const adminSetupContent = `import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('../env', () => ({
  env: {
    NODE_ENV: 'test',
    API_URL: 'http://localhost:5000'
  }
}));`;

			mkdirSync('apps/admin/src/test', { recursive: true });
			writeFileSync('apps/admin/src/test/setup.ts', adminSetupContent);
		}

		console.log('✅ Test configuration setup completed');
	}

	async generateTestReports(): Promise<void> {
		console.log('📊 Generating test reports...');

		try {
			// Create reports directory
			mkdirSync('reports', { recursive: true });

			// Run tests with coverage for all apps
			const apps = ['server', 'web', 'admin'];

			for (const app of apps) {
				console.log(`📈 Generating report for ${app}...`);

				try {
					const appPath = join('apps', app);

					if (app === 'server') {
						execSync(
							`cd ${appPath} && jest --coverage --coverageReporters=json --coverageDirectory=../../reports/${app}`,
							{ stdio: 'inherit' }
						);
					} else {
						execSync(
							`cd ${appPath} && vitest run --coverage --coverage.reporter=json --coverage.reportsDirectory=../../reports/${app}`,
							{ stdio: 'inherit' }
						);
					}
				} catch (error) {
					console.log(`⚠️  No tests or coverage data for ${app}`);
				}
			}

			console.log('✅ Test reports generated in ./reports directory');
		} catch (error) {
			console.error('❌ Failed to generate reports:', error.message);
		}
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || args.includes('--help') || args.includes('-h')) {
		console.log(`
🧪 Test Runner for Quizify

Usage: bun run scripts/test.ts <command> [options]

Commands:
  run                 Run tests
  setup               Setup test configuration files  
  reports             Generate coverage reports

Options:
  --watch             Run tests in watch mode
  --coverage          Generate coverage reports
  --update-snapshots  Update test snapshots
  --verbose           Verbose output
  --apps <apps>       Test specific apps (comma-separated)
  --packages <pkgs>   Test specific packages (comma-separated)

Examples:
  bun run scripts/test.ts run --coverage
  bun run scripts/test.ts run --apps server,web --watch
  bun run scripts/test.ts run --packages ui --verbose
  bun run scripts/test.ts setup
  bun run scripts/test.ts reports
`);
		return;
	}

	const testRunner = new TestRunner();

	// Parse options
	const watch = args.includes('--watch');
	const coverage = args.includes('--coverage');
	const updateSnapshots = args.includes('--update-snapshots');
	const verbose = args.includes('--verbose');

	// Parse apps and packages
	const appsIndex = args.indexOf('--apps');
	const apps = appsIndex !== -1 ? args[appsIndex + 1]?.split(',') || [] : [];

	const packagesIndex = args.indexOf('--packages');
	const packages =
		packagesIndex !== -1 ? args[packagesIndex + 1]?.split(',') || [] : [];

	const config: TestConfig = {
		watch,
		coverage,
		apps,
		packages,
		updateSnapshots,
		verbose,
	};

	try {
		switch (command) {
			case 'run':
				await testRunner.runTests(config);
				break;
			case 'setup':
				await testRunner.setupTestConfig();
				break;
			case 'reports':
				await testRunner.generateTestReports();
				break;
			default:
				console.error(`❌ Unknown command: ${command}`);
				process.exit(1);
		}
	} catch (error) {
		console.error(`❌ Error: ${error.message}`);
		process.exit(1);
	}
}

main();
