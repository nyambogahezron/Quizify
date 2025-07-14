#!/usr/bin/env bun

import { execSync } from 'child_process';
import {
	readFileSync,
	writeFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	statSync,
} from 'fs';
import { join, extname } from 'path';

interface MaintenanceConfig {
	type: 'cleanup' | 'health' | 'backup' | 'update' | 'security' | 'performance';
	schedule?: string;
	options?: Record<string, any>;
}

class MaintenanceManager {
	async runMaintenance(config: MaintenanceConfig): Promise<void> {
		console.log(`🔧 Running ${config.type} maintenance...`);

		try {
			switch (config.type) {
				case 'cleanup':
					await this.runCleanup(config.options);
					break;
				case 'health':
					await this.runHealthCheck(config.options);
					break;
				case 'backup':
					await this.runBackup(config.options);
					break;
				case 'update':
					await this.runUpdate(config.options);
					break;
				case 'security':
					await this.runSecurityCheck(config.options);
					break;
				case 'performance':
					await this.runPerformanceAnalysis(config.options);
					break;
				default:
					throw new Error(`Unknown maintenance type: ${config.type}`);
			}

			console.log(`✅ ${config.type} maintenance completed`);
		} catch (error) {
			console.error(`❌ ${config.type} maintenance failed:`, error.message);
			process.exit(1);
		}
	}

	private async runCleanup(options: any = {}): Promise<void> {
		console.log('🧹 Running cleanup tasks...');

		// Clean node_modules if requested
		if (options.cleanModules) {
			console.log('📦 Cleaning node_modules...');
			try {
				execSync(
					'find . -name "node_modules" -type d -prune -exec rm -rf {} +',
					{ stdio: 'inherit' }
				);
				execSync('bun install', { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Failed to clean node_modules');
			}
		}

		// Clean build artifacts
		console.log('🗑️  Cleaning build artifacts...');
		const cleanupPaths = [
			'apps/*/dist',
			'apps/*/build',
			'apps/*/.next',
			'packages/*/dist',
			'**/.turbo',
			'reports',
		];

		for (const pattern of cleanupPaths) {
			try {
				execSync(`rm -rf ${pattern}`, { stdio: 'inherit' });
			} catch (error) {
				// Ignore errors for non-existent paths
			}
		}

		// Clean log files
		if (options.cleanLogs) {
			console.log('📋 Cleaning log files...');
			try {
				execSync('find . -name "*.log" -type f -delete', { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Failed to clean log files');
			}
		}

		// Clean Docker resources
		if (options.cleanDocker) {
			console.log('🐳 Cleaning Docker resources...');
			try {
				execSync('docker system prune -f', { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Failed to clean Docker resources');
			}
		}

		// Clean temporary files
		console.log('🗂️  Cleaning temporary files...');
		try {
			execSync('find . -name ".DS_Store" -type f -delete', {
				stdio: 'inherit',
			});
			execSync('find . -name "*.tmp" -type f -delete', { stdio: 'inherit' });
			execSync('find . -name "Thumbs.db" -type f -delete', {
				stdio: 'inherit',
			});
		} catch (error) {
			console.warn('⚠️  Some temporary files could not be cleaned');
		}
	}

	private async runHealthCheck(options: any = {}): Promise<void> {
		console.log('🏥 Running health checks...');

		const healthReport = {
			timestamp: new Date().toISOString(),
			checks: [] as any[],
		};

		// Check disk space
		console.log('💾 Checking disk space...');
		try {
			const diskUsage = execSync('df -h .', { encoding: 'utf-8' });
			const usage = diskUsage.split('\n')[1].split(/\s+/)[4];

			healthReport.checks.push({
				name: 'Disk Space',
				status: parseInt(usage) < 90 ? 'healthy' : 'warning',
				details: `Disk usage: ${usage}`,
				usage,
			});
		} catch (error) {
			healthReport.checks.push({
				name: 'Disk Space',
				status: 'error',
				details: 'Could not check disk space',
			});
		}

		// Check dependencies
		console.log('📦 Checking dependencies...');
		try {
			execSync('bun check', { stdio: 'inherit' });
			healthReport.checks.push({
				name: 'Dependencies',
				status: 'healthy',
				details: 'All dependencies are up to date',
			});
		} catch (error) {
			healthReport.checks.push({
				name: 'Dependencies',
				status: 'warning',
				details: 'Some dependencies may need updates',
			});
		}

		// Check for security vulnerabilities
		console.log('🔒 Checking for security vulnerabilities...');
		try {
			execSync('bun audit', { stdio: 'inherit' });
			healthReport.checks.push({
				name: 'Security Audit',
				status: 'healthy',
				details: 'No security vulnerabilities found',
			});
		} catch (error) {
			healthReport.checks.push({
				name: 'Security Audit',
				status: 'warning',
				details: 'Security vulnerabilities detected',
			});
		}

		// Check application health (if services are running)
		if (options.checkServices) {
			const services = ['server', 'web', 'admin'];
			const ports = { server: 5000, web: 3000, admin: 3001 };

			for (const service of services) {
				console.log(`🌐 Checking ${service} service...`);
				try {
					execSync(
						`curl -f http://localhost:${ports[service as keyof typeof ports]} > /dev/null 2>&1`
					);
					healthReport.checks.push({
						name: `${service} Service`,
						status: 'healthy',
						details: `${service} is responding on port ${ports[service as keyof typeof ports]}`,
					});
				} catch (error) {
					healthReport.checks.push({
						name: `${service} Service`,
						status: 'error',
						details: `${service} is not responding`,
					});
				}
			}
		}

		// Save health report
		mkdirSync('reports', { recursive: true });
		writeFileSync(
			'reports/health-report.json',
			JSON.stringify(healthReport, null, 2)
		);

		// Display summary
		const healthy = healthReport.checks.filter(
			(c) => c.status === 'healthy'
		).length;
		const warnings = healthReport.checks.filter(
			(c) => c.status === 'warning'
		).length;
		const errors = healthReport.checks.filter(
			(c) => c.status === 'error'
		).length;

		console.log(`📊 Health Check Summary:`);
		console.log(`  ✅ Healthy: ${healthy}`);
		console.log(`  ⚠️  Warnings: ${warnings}`);
		console.log(`  ❌ Errors: ${errors}`);
	}

	private async runBackup(options: any = {}): Promise<void> {
		console.log('💾 Running backup tasks...');

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupDir = `./backups/full-backup-${timestamp}`;

		mkdirSync(backupDir, { recursive: true });

		// Backup source code (if not already in git)
		if (options.backupCode) {
			console.log('📂 Backing up source code...');
			execSync(
				`tar -czf ${backupDir}/source-code.tar.gz --exclude=node_modules --exclude=.git --exclude=dist --exclude=build .`,
				{ stdio: 'inherit' }
			);
		}

		// Backup configuration files
		console.log('⚙️  Backing up configuration files...');
		const configFiles = [
			'package.json',
			'turbo.json',
			'.env.example',
			'docker-compose.yml',
			'apps/*/package.json',
			'packages/*/package.json',
		];

		execSync(
			`tar -czf ${backupDir}/config-files.tar.gz ${configFiles.join(' ')}`,
			{ stdio: 'inherit' }
		);

		// Backup database (if MongoDB is accessible)
		if (options.backupDatabase) {
			console.log('🗄️  Backing up database...');
			try {
				execSync(`mongodump --out ${backupDir}/database`, { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Database backup failed - service may not be running');
			}
		}

		// Backup uploads/static files
		if (options.backupUploads && existsSync('apps/server/public/uploads')) {
			console.log('📎 Backing up uploads...');
			execSync(
				`tar -czf ${backupDir}/uploads.tar.gz apps/server/public/uploads`,
				{ stdio: 'inherit' }
			);
		}

		console.log(`✅ Backup completed: ${backupDir}`);
	}

	private async runUpdate(options: any = {}): Promise<void> {
		console.log('🔄 Running update tasks...');

		// Update dependencies
		if (options.updateDeps !== false) {
			console.log('📦 Updating dependencies...');
			try {
				execSync('bun update', { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Failed to update some dependencies');
			}
		}

		// Update Turbo
		if (options.updateTurbo !== false) {
			console.log('⚡ Updating Turbo...');
			try {
				execSync('bun add -D turbo@latest', { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Failed to update Turbo');
			}
		}

		// Update Docker images
		if (options.updateDocker) {
			console.log('🐳 Updating Docker images...');
			try {
				execSync('docker-compose pull', { stdio: 'inherit' });
			} catch (error) {
				console.warn('⚠️  Failed to update Docker images');
			}
		}

		// Run post-update tasks
		console.log('🔧 Running post-update tasks...');
		try {
			execSync('turbo run build', { stdio: 'inherit' });
			execSync('turbo run lint', { stdio: 'inherit' });
		} catch (error) {
			console.warn('⚠️  Some post-update tasks failed');
		}
	}

	private async runSecurityCheck(options: any = {}): Promise<void> {
		console.log('🔒 Running security checks...');

		const securityReport = {
			timestamp: new Date().toISOString(),
			vulnerabilities: [] as any[],
			recommendations: [] as string[],
		};

		// Audit dependencies
		console.log('🔍 Auditing dependencies...');
		try {
			const auditResult = execSync('bun audit --json', { encoding: 'utf-8' });
			const audit = JSON.parse(auditResult);
			securityReport.vulnerabilities.push(...(audit.vulnerabilities || []));
		} catch (error) {
			console.warn('⚠️  Could not run dependency audit');
		}

		// Check for sensitive files
		console.log('🕵️  Checking for sensitive files...');
		const sensitivePatterns = [
			'**/.env',
			'**/config/secrets.*',
			'**/*.key',
			'**/*.pem',
			'**/private.json',
		];

		for (const pattern of sensitivePatterns) {
			try {
				const files = execSync(
					`find . -path "${pattern}" -not -path "./node_modules/*"`,
					{ encoding: 'utf-8' }
				).trim();

				if (files) {
					securityReport.recommendations.push(
						`Sensitive files found: ${files.split('\n').join(', ')}`
					);
				}
			} catch (error) {
				// Ignore find errors
			}
		}

		// Check file permissions
		if (process.platform !== 'win32') {
			console.log('🔐 Checking file permissions...');
			try {
				const executableFiles = execSync(
					'find . -perm +111 -type f -not -path "./node_modules/*" -not -path "./.git/*"',
					{ encoding: 'utf-8' }
				).trim();

				if (executableFiles) {
					securityReport.recommendations.push(
						'Review executable file permissions'
					);
				}
			} catch (error) {
				// Ignore permission check errors
			}
		}

		// Save security report
		mkdirSync('reports', { recursive: true });
		writeFileSync(
			'reports/security-report.json',
			JSON.stringify(securityReport, null, 2)
		);

		console.log(`📊 Security Check Summary:`);
		console.log(
			`  🚨 Vulnerabilities: ${securityReport.vulnerabilities.length}`
		);
		console.log(
			`  💡 Recommendations: ${securityReport.recommendations.length}`
		);
	}

	private async runPerformanceAnalysis(options: any = {}): Promise<void> {
		console.log('⚡ Running performance analysis...');

		const performanceReport = {
			timestamp: new Date().toISOString(),
			metrics: {} as any,
			recommendations: [] as string[],
		};

		// Analyze bundle sizes
		console.log('📦 Analyzing bundle sizes...');
		try {
			// Build applications first
			execSync('turbo run build', { stdio: 'inherit' });

			// Analyze web app bundle
			if (existsSync('apps/web/dist')) {
				const bundleStats = this.analyzeBundleSize('apps/web/dist');
				performanceReport.metrics.webBundle = bundleStats;

				if (bundleStats.totalSize > 5 * 1024 * 1024) {
					// 5MB
					performanceReport.recommendations.push(
						'Web app bundle size is large. Consider code splitting and tree shaking.'
					);
				}
			}

			// Analyze admin app bundle
			if (existsSync('apps/admin/dist')) {
				const bundleStats = this.analyzeBundleSize('apps/admin/dist');
				performanceReport.metrics.adminBundle = bundleStats;

				if (bundleStats.totalSize > 3 * 1024 * 1024) {
					// 3MB
					performanceReport.recommendations.push(
						'Admin app bundle size is large. Consider lazy loading.'
					);
				}
			}
		} catch (error) {
			console.warn('⚠️  Could not analyze bundle sizes');
		}

		// Analyze dependencies
		console.log('📊 Analyzing dependencies...');
		try {
			const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
			const depCount =
				Object.keys(packageJson.dependencies || {}).length +
				Object.keys(packageJson.devDependencies || {}).length;

			performanceReport.metrics.dependencyCount = depCount;

			if (depCount > 100) {
				performanceReport.recommendations.push(
					'Large number of dependencies. Review and remove unused packages.'
				);
			}
		} catch (error) {
			console.warn('⚠️  Could not analyze dependencies');
		}

		// Check for large files
		console.log('📁 Checking for large files...');
		try {
			const largeFiles = execSync(
				'find . -size +10M -not -path "./node_modules/*" -not -path "./.git/*"',
				{ encoding: 'utf-8' }
			).trim();

			if (largeFiles) {
				performanceReport.metrics.largeFiles = largeFiles.split('\n');
				performanceReport.recommendations.push(
					'Large files detected. Consider optimization or moving to external storage.'
				);
			}
		} catch (error) {
			// Ignore find errors
		}

		// Save performance report
		mkdirSync('reports', { recursive: true });
		writeFileSync(
			'reports/performance-report.json',
			JSON.stringify(performanceReport, null, 2)
		);

		console.log(`📊 Performance Analysis Summary:`);
		console.log(`  📦 Bundle analysis completed`);
		console.log(
			`  💡 Recommendations: ${performanceReport.recommendations.length}`
		);
	}

	private analyzeBundleSize(distPath: string): any {
		let totalSize = 0;
		const files: { path: string; size: number; sizeKB: number }[] = [];

		const analyzeDirectory = (dirPath: string) => {
			const items = readdirSync(dirPath);

			for (const item of items) {
				const itemPath = join(dirPath, item);
				const stats = statSync(itemPath);

				if (stats.isDirectory()) {
					analyzeDirectory(itemPath);
				} else {
					const size = stats.size;
					totalSize += size;

					if (size > 100 * 1024) {
						// Files larger than 100KB
						files.push({
							path: itemPath,
							size,
							sizeKB: Math.round(size / 1024),
						});
					}
				}
			}
		};

		analyzeDirectory(distPath);

		return {
			totalSize,
			totalSizeKB: Math.round(totalSize / 1024),
			totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
			largeFiles: files.sort((a, b) => b.size - a.size),
		};
	}

	async createCronJob(config: MaintenanceConfig): Promise<void> {
		console.log('⏰ Creating cron job...');

		if (!config.schedule) {
			throw new Error('Schedule is required for cron job creation');
		}

		const cronCommand = `cd ${process.cwd()} && bun run scripts/maintenance.ts ${config.type}`;
		const cronEntry = `${config.schedule} ${cronCommand}`;

		// Add to crontab (Linux/macOS only)
		if (process.platform !== 'win32') {
			try {
				// Get current crontab
				let currentCrontab = '';
				try {
					currentCrontab = execSync('crontab -l', { encoding: 'utf-8' });
				} catch (error) {
					// No existing crontab
				}

				// Add new entry if not already present
				if (!currentCrontab.includes(cronCommand)) {
					const newCrontab =
						currentCrontab + (currentCrontab ? '\n' : '') + cronEntry + '\n';

					// Write to temporary file and install
					writeFileSync('/tmp/quizify-crontab', newCrontab);
					execSync('crontab /tmp/quizify-crontab', { stdio: 'inherit' });

					console.log(`✅ Cron job created: ${cronEntry}`);
				} else {
					console.log('ℹ️  Cron job already exists');
				}
			} catch (error) {
				console.error('❌ Failed to create cron job:', error.message);
			}
		} else {
			console.log(
				'ℹ️  Cron jobs not supported on Windows. Use Task Scheduler instead.'
			);
		}
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || args.includes('--help') || args.includes('-h')) {
		console.log(`
🔧 Maintenance Manager for Quizify

Usage: bun run scripts/maintenance.ts <type> [options]

Maintenance Types:
  cleanup             Clean build artifacts, logs, and temporary files
  health              Run comprehensive health checks
  backup              Create backups of code, config, and data
  update              Update dependencies and Docker images
  security            Run security audits and checks
  performance         Analyze bundle sizes and performance

Options:
  --clean-modules     Clean and reinstall node_modules (cleanup)
  --clean-logs        Clean log files (cleanup)
  --clean-docker      Clean Docker resources (cleanup)
  --check-services    Check running services (health)
  --backup-code       Include source code in backup
  --backup-database   Include database in backup
  --backup-uploads    Include uploads in backup
  --update-deps       Update dependencies (default: true)
  --update-turbo      Update Turbo (default: true)
  --update-docker     Update Docker images
  --schedule <cron>   Create cron job with schedule

Examples:
  bun run scripts/maintenance.ts cleanup --clean-modules --clean-docker
  bun run scripts/maintenance.ts health --check-services
  bun run scripts/maintenance.ts backup --backup-database --backup-uploads
  bun run scripts/maintenance.ts security
  bun run scripts/maintenance.ts cleanup --schedule "0 2 * * 0"
`);
		return;
	}

	const maintenanceManager = new MaintenanceManager();

	// Parse options
	const options = {
		cleanModules: args.includes('--clean-modules'),
		cleanLogs: args.includes('--clean-logs'),
		cleanDocker: args.includes('--clean-docker'),
		checkServices: args.includes('--check-services'),
		backupCode: args.includes('--backup-code'),
		backupDatabase: args.includes('--backup-database'),
		backupUploads: args.includes('--backup-uploads'),
		updateDeps: !args.includes('--no-update-deps'),
		updateTurbo: !args.includes('--no-update-turbo'),
		updateDocker: args.includes('--update-docker'),
	};

	const scheduleIndex = args.indexOf('--schedule');
	const schedule = scheduleIndex !== -1 ? args[scheduleIndex + 1] : undefined;

	const config: MaintenanceConfig = {
		type: command as any,
		schedule,
		options,
	};

	try {
		await maintenanceManager.runMaintenance(config);

		// Create cron job if schedule is provided
		if (schedule) {
			await maintenanceManager.createCronJob(config);
		}
	} catch (error) {
		console.error(`❌ Error: ${error.message}`);
		process.exit(1);
	}
}

main();
