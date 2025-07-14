#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DatabaseConfig {
	host: string;
	port: number;
	name: string;
	user?: string;
	password?: string;
}

class DatabaseManager {
	private config: DatabaseConfig;

	constructor() {
		this.config = this.loadConfig();
	}

	private loadConfig(): DatabaseConfig {
		const envPath = join(process.cwd(), 'apps', 'server', '.env');

		if (!existsSync(envPath)) {
			throw new Error(
				'Server .env file not found. Please create one based on env-example.txt'
			);
		}

		const envContent = readFileSync(envPath, 'utf-8');
		const envVars = envContent.split('\n').reduce(
			(acc, line) => {
				const [key, value] = line.split('=');
				if (key && value) {
					acc[key.trim()] = value.trim().replace(/['"]/g, '');
				}
				return acc;
			},
			{} as Record<string, string>
		);

		return {
			host: envVars.DB_HOST || 'localhost',
			port: parseInt(envVars.DB_PORT || '27017'),
			name: envVars.DB_NAME || 'quizify',
			user: envVars.DB_USER,
			password: envVars.DB_PASSWORD,
		};
	}

	async backup(): Promise<void> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupPath = `./backups/db-backup-${timestamp}`;

		console.log('🗄️  Creating database backup...');

		try {
			execSync(`mkdir -p ./backups`, { stdio: 'inherit' });

			const mongodumpCmd = this.config.user
				? `mongodump --host ${this.config.host}:${this.config.port} --db ${this.config.name} --username ${this.config.user} --password ${this.config.password} --out ${backupPath}`
				: `mongodump --host ${this.config.host}:${this.config.port} --db ${this.config.name} --out ${backupPath}`;

			execSync(mongodumpCmd, { stdio: 'inherit' });
			console.log(`✅ Database backup created: ${backupPath}`);
		} catch (error) {
			console.error('❌ Backup failed:', error.message);
			process.exit(1);
		}
	}

	async restore(backupPath: string): Promise<void> {
		if (!existsSync(backupPath)) {
			throw new Error(`Backup path not found: ${backupPath}`);
		}

		console.log('📥 Restoring database from backup...');

		try {
			const mongorestoreCmd = this.config.user
				? `mongorestore --host ${this.config.host}:${this.config.port} --db ${this.config.name} --username ${this.config.user} --password ${this.config.password} --drop ${backupPath}/${this.config.name}`
				: `mongorestore --host ${this.config.host}:${this.config.port} --db ${this.config.name} --drop ${backupPath}/${this.config.name}`;

			execSync(mongorestoreCmd, { stdio: 'inherit' });
			console.log('✅ Database restored successfully');
		} catch (error) {
			console.error('❌ Restore failed:', error.message);
			process.exit(1);
		}
	}

	async seed(): Promise<void> {
		console.log('🌱 Seeding database...');

		try {
			// Change to server directory and run seed script
			execSync('cd apps/server && bun run scripts/seed.ts', {
				stdio: 'inherit',
			});
			console.log('✅ Database seeded successfully');
		} catch (error) {
			console.error('❌ Seeding failed:', error.message);
			process.exit(1);
		}
	}

	async reset(): Promise<void> {
		console.log('🔄 Resetting database...');

		try {
			// Drop the database
			const dropCmd = this.config.user
				? `mongo --host ${this.config.host}:${this.config.port} --username ${this.config.user} --password ${this.config.password} --eval "db.getSiblingDB('${this.config.name}').dropDatabase()"`
				: `mongo --host ${this.config.host}:${this.config.port} --eval "db.getSiblingDB('${this.config.name}').dropDatabase()"`;

			execSync(dropCmd, { stdio: 'inherit' });
			console.log('✅ Database dropped');

			// Seed with fresh data
			await this.seed();
		} catch (error) {
			console.error('❌ Reset failed:', error.message);
			process.exit(1);
		}
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || args.includes('--help') || args.includes('-h')) {
		console.log(`
🗄️  Database Management for Quizify

Usage: bun run scripts/database.ts <command> [options]

Commands:
  backup              Create a database backup
  restore <path>      Restore database from backup
  seed                Seed database with initial data
  reset               Reset database (drop + seed)

Examples:
  bun run scripts/database.ts backup
  bun run scripts/database.ts restore ./backups/db-backup-2024-01-15T10-30-00-000Z
  bun run scripts/database.ts seed
  bun run scripts/database.ts reset
`);
		return;
	}

	try {
		const dbManager = new DatabaseManager();

		switch (command) {
			case 'backup':
				await dbManager.backup();
				break;
			case 'restore':
				const backupPath = args[1];
				if (!backupPath) {
					console.error('❌ Please provide backup path');
					process.exit(1);
				}
				await dbManager.restore(backupPath);
				break;
			case 'seed':
				await dbManager.seed();
				break;
			case 'reset':
				await dbManager.reset();
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
