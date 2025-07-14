#!/usr/bin/env bun

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface PackageConfig {
	name: string;
	description?: string;
	type: 'library' | 'utility' | 'config';
	dependencies?: string[];
	devDependencies?: string[];
	hasReact?: boolean;
}

class PackageGenerator {
	private templatePath: string;
	private packagesPath: string;

	constructor() {
		this.templatePath = join(process.cwd(), 'packages', 'ui');
		this.packagesPath = join(process.cwd(), 'packages');
	}

	async createPackage(config: PackageConfig): Promise<void> {
		const packagePath = join(this.packagesPath, config.name);

		// Check if package already exists
		if (existsSync(packagePath)) {
			throw new Error(`Package '${config.name}' already exists!`);
		}

		console.log(`📦 Creating package: ${config.name}`);

		// Create package directory
		mkdirSync(packagePath, { recursive: true });

		// Create package structure
		await this.createPackageStructure(packagePath, config);

		console.log(`✅ Package '${config.name}' created successfully!`);
		console.log(`📁 Location: ${packagePath}`);

		// Install dependencies
		if (config.dependencies?.length || config.devDependencies?.length) {
			console.log(`📥 Installing dependencies...`);
			this.installDependencies(packagePath, config);
		}

		console.log(`🎉 Done! You can now start developing your package.`);
	}

	private async createPackageStructure(
		packagePath: string,
		config: PackageConfig
	): Promise<void> {
		// Create directories
		const srcPath = join(packagePath, 'src');
		mkdirSync(srcPath, { recursive: true });

		// Create package.json
		this.createPackageJson(packagePath, config);

		// Create tsconfig.json
		this.createTsConfig(packagePath, config);

		// Create eslint.config.mjs
		this.createEslintConfig(packagePath, config);

		// Create README.md
		this.createReadme(packagePath, config);

		// Create initial source files
		this.createInitialSourceFiles(srcPath, config);
	}

	private createPackageJson(packagePath: string, config: PackageConfig): void {
		const packageJson = {
			name: `@repo/${config.name}`,
			version: '0.0.0',
			private: true,
			description: config.description || `${config.name} package`,
			exports: config.hasReact
				? { './*': './src/*.tsx' }
				: { './*': './src/*.ts' },
			scripts: {
				lint: 'eslint . --max-warnings 0',
				'check-types': 'tsc --noEmit',
				...(config.hasReact && {
					'generate:component': 'turbo gen react-component',
				}),
			},
			devDependencies: {
				'@repo/eslint-config': '*',
				'@repo/typescript-config': '*',
				'@types/node': '^22.15.3',
				eslint: '^9.30.0',
				typescript: '5.8.2',
				...(config.hasReact && {
					'@types/react': '19.1.0',
					'@types/react-dom': '19.1.1',
				}),
				...config.devDependencies?.reduce(
					(acc, dep) => ({ ...acc, [dep]: 'latest' }),
					{}
				),
			},
			dependencies: {
				...(config.hasReact && {
					react: '^19.1.0',
					'react-dom': '^19.1.0',
				}),
				...config.dependencies?.reduce(
					(acc, dep) => ({ ...acc, [dep]: 'latest' }),
					{}
				),
			},
		};

		writeFileSync(
			join(packagePath, 'package.json'),
			JSON.stringify(packageJson, null, 2)
		);
	}

	private createTsConfig(packagePath: string, config: PackageConfig): void {
		const tsConfigTemplate = config.hasReact
			? '@repo/typescript-config/react-library.json'
			: '@repo/typescript-config/base.json';

		const tsConfig = {
			extends: tsConfigTemplate,
			compilerOptions: {
				outDir: 'dist',
			},
			include: ['src'],
			exclude: ['node_modules', 'dist'],
		};

		writeFileSync(
			join(packagePath, 'tsconfig.json'),
			JSON.stringify(tsConfig, null, 2)
		);
	}

	private createEslintConfig(packagePath: string, config: PackageConfig): void {
		const configType = config.hasReact ? 'react-internal' : 'base';

		const eslintConfig = `import { config } from "@repo/eslint-config/${configType}";

/** @type {import("eslint").Linter.Config} */
export default config;
`;

		writeFileSync(join(packagePath, 'eslint.config.mjs'), eslintConfig);
	}

	private createReadme(packagePath: string, config: PackageConfig): void {
		const readme = `# @repo/${config.name}

${config.description || `${config.name} package for the Quizify project.`}

## Installation

This package is part of the Quizify monorepo and is installed automatically when you install the root dependencies.

## Usage

\`\`\`typescript
import { ... } from "@repo/${config.name}";
\`\`\`

## Development

\`\`\`bash
# Lint the package
bun run lint

# Type check
bun run check-types
\`\`\`
`;

		writeFileSync(join(packagePath, 'README.md'), readme);
	}

	private createInitialSourceFiles(
		srcPath: string,
		config: PackageConfig
	): void {
		if (config.hasReact) {
			// Create a basic React component
			const componentName = this.pascalCase(config.name);
			const componentContent = `"use client";

import { ReactNode } from "react";

interface ${componentName}Props {
  children: ReactNode;
  className?: string;
}

export const ${componentName} = ({ children, className }: ${componentName}Props) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
`;
			writeFileSync(join(srcPath, `${config.name}.tsx`), componentContent);

			// Create an index file
			const indexContent = `export { ${componentName} } from "./${config.name}";
`;
			writeFileSync(join(srcPath, 'index.tsx'), indexContent);
		} else {
			// Create a basic TypeScript utility
			const utilContent = `/**
 * ${config.description || `Utilities for ${config.name}`}
 */

export function ${this.camelCase(config.name)}Utility(): string {
  return "Hello from ${config.name}!";
}
`;
			writeFileSync(join(srcPath, `${config.name}.ts`), utilContent);

			// Create an index file
			const indexContent = `export * from "./${config.name}";
`;
			writeFileSync(join(srcPath, 'index.ts'), indexContent);
		}
	}

	private installDependencies(
		packagePath: string,
		config: PackageConfig
	): void {
		try {
			execSync('bun install', { cwd: packagePath, stdio: 'inherit' });
		} catch (error) {
			console.warn(
				'⚠️  Failed to install dependencies automatically. You can run "bun install" manually.'
			);
		}
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	private camelCase(str: string): string {
		return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
	}

	private pascalCase(str: string): string {
		return this.capitalize(this.camelCase(str));
	}
}

// CLI Interface
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		console.log(`
📦 Package Generator for Quizify

Usage: bun run scripts/create-package.ts <package-name> [options]

Options:
  --react, -r          Create a React component package
  --utility, -u        Create a utility package (default)
  --config, -c         Create a configuration package
  --deps <deps>        Additional dependencies (comma-separated)
  --dev-deps <deps>    Additional dev dependencies (comma-separated)
  --description <desc> Package description
  --help, -h           Show this help message

Examples:
  bun run scripts/create-package.ts my-components --react --description "Shared UI components"
  bun run scripts/create-package.ts utils --utility --deps "lodash,moment"
  bun run scripts/create-package.ts theme-config --config
`);
		return;
	}

	const packageName = args[0];

	if (!packageName || !/^[a-z][a-z0-9-]*$/.test(packageName)) {
		console.error(
			'❌ Package name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens.'
		);
		process.exit(1);
	}

	const config: PackageConfig = {
		name: packageName,
		type: 'utility',
		hasReact: false,
		dependencies: [],
		devDependencies: [],
	};

	// Parse arguments
	for (let i = 1; i < args.length; i++) {
		const arg = args[i];

		switch (arg) {
			case '--react':
			case '-r':
				config.type = 'library';
				config.hasReact = true;
				break;
			case '--utility':
			case '-u':
				config.type = 'utility';
				config.hasReact = false;
				break;
			case '--config':
			case '-c':
				config.type = 'config';
				config.hasReact = false;
				break;
			case '--deps':
				if (i + 1 < args.length) {
					config.dependencies = args[++i].split(',').map((dep) => dep.trim());
				}
				break;
			case '--dev-deps':
				if (i + 1 < args.length) {
					config.devDependencies = args[++i]
						.split(',')
						.map((dep) => dep.trim());
				}
				break;
			case '--description':
				if (i + 1 < args.length) {
					config.description = args[++i];
				}
				break;
		}
	}

	try {
		const generator = new PackageGenerator();
		await generator.createPackage(config);
	} catch (error) {
		console.error(`❌ Error creating package: ${error.message}`);
		process.exit(1);
	}
}

main();
