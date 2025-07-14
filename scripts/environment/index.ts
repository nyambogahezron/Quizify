#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface EnvironmentConfig {
	name: string;
	apps: string[];
	vars: Record<string, string>;
}

class EnvironmentManager {
	private environments = ['development', 'staging', 'production', 'testing'];
	private apps = ['server', 'web', 'admin', 'mobile'];

	async setup(environment: string): Promise<void> {
		if (!this.environments.includes(environment)) {
			throw new Error(`Invalid environment: ${environment}`);
		}

		console.log(`🌍 Setting up ${environment} environment...`);

		try {
			// Create environment files for each app
			await this.createEnvironmentFiles(environment);

			// Setup database for environment
			await this.setupDatabase(environment);

			// Configure services
			await this.configureServices(environment);

			console.log(`✅ ${environment} environment setup completed`);
		} catch (error) {
			console.error(`❌ Environment setup failed: ${error.message}`);
			process.exit(1);
		}
	}

	private async createEnvironmentFiles(environment: string): Promise<void> {
		console.log('📝 Creating environment files...');

		const envConfigs = {
			development: {
				server: {
					NODE_ENV: 'development',
					PORT: '5000',
					DB_HOST: 'localhost',
					DB_PORT: '27017',
					DB_NAME: 'quizify_dev',
					JWT_SECRET: 'dev-secret-key-change-in-production',
					CORS_ORIGIN: 'http://localhost:3000,http://localhost:3001',
					LOG_LEVEL: 'debug',
				},
				web: {
					NODE_ENV: 'development',
					VITE_API_URL: 'http://localhost:5000',
					VITE_APP_NAME: 'Quizify',
					VITE_ENVIRONMENT: 'development',
				},
				admin: {
					NODE_ENV: 'development',
					VITE_API_URL: 'http://localhost:5000',
					VITE_APP_NAME: 'Quizify Admin',
					VITE_ENVIRONMENT: 'development',
				},
				mobile: {
					EXPO_PUBLIC_API_URL: 'http://localhost:5000',
					EXPO_PUBLIC_ENVIRONMENT: 'development',
				},
			},
			staging: {
				server: {
					NODE_ENV: 'staging',
					PORT: '5000',
					DB_HOST: 'staging-db',
					DB_PORT: '27017',
					DB_NAME: 'quizify_staging',
					JWT_SECRET: 'staging-secret-key',
					CORS_ORIGIN:
						'https://staging.quizify.com,https://admin-staging.quizify.com',
					LOG_LEVEL: 'info',
				},
				web: {
					NODE_ENV: 'staging',
					VITE_API_URL: 'https://api-staging.quizify.com',
					VITE_APP_NAME: 'Quizify (Staging)',
					VITE_ENVIRONMENT: 'staging',
				},
				admin: {
					NODE_ENV: 'staging',
					VITE_API_URL: 'https://api-staging.quizify.com',
					VITE_APP_NAME: 'Quizify Admin (Staging)',
					VITE_ENVIRONMENT: 'staging',
				},
				mobile: {
					EXPO_PUBLIC_API_URL: 'https://api-staging.quizify.com',
					EXPO_PUBLIC_ENVIRONMENT: 'staging',
				},
			},
			production: {
				server: {
					NODE_ENV: 'production',
					PORT: '5000',
					DB_HOST: 'production-db',
					DB_PORT: '27017',
					DB_NAME: 'quizify',
					JWT_SECRET: '${JWT_SECRET}', // To be replaced with actual secret
					CORS_ORIGIN: 'https://quizify.com,https://admin.quizify.com',
					LOG_LEVEL: 'warn',
				},
				web: {
					NODE_ENV: 'production',
					VITE_API_URL: 'https://api.quizify.com',
					VITE_APP_NAME: 'Quizify',
					VITE_ENVIRONMENT: 'production',
				},
				admin: {
					NODE_ENV: 'production',
					VITE_API_URL: 'https://api.quizify.com',
					VITE_APP_NAME: 'Quizify Admin',
					VITE_ENVIRONMENT: 'production',
				},
				mobile: {
					EXPO_PUBLIC_API_URL: 'https://api.quizify.com',
					EXPO_PUBLIC_ENVIRONMENT: 'production',
				},
			},
			testing: {
				server: {
					NODE_ENV: 'test',
					PORT: '5001',
					DB_HOST: 'localhost',
					DB_PORT: '27017',
					DB_NAME: 'quizify_test',
					JWT_SECRET: 'test-secret-key',
					LOG_LEVEL: 'error',
				},
				web: {
					NODE_ENV: 'test',
					VITE_API_URL: 'http://localhost:5001',
					VITE_APP_NAME: 'Quizify (Test)',
					VITE_ENVIRONMENT: 'test',
				},
				admin: {
					NODE_ENV: 'test',
					VITE_API_URL: 'http://localhost:5001',
					VITE_APP_NAME: 'Quizify Admin (Test)',
					VITE_ENVIRONMENT: 'test',
				},
				mobile: {
					EXPO_PUBLIC_API_URL: 'http://localhost:5001',
					EXPO_PUBLIC_ENVIRONMENT: 'test',
				},
			},
		};

		const config = envConfigs[environment as keyof typeof envConfigs];

		for (const app of this.apps) {
			const appPath = join('apps', app);
			if (existsSync(appPath)) {
				const envVars = config[app as keyof typeof config];
				const envContent = Object.entries(envVars)
					.map(([key, value]) => `${key}=${value}`)
					.join('\n');

				const envFileName =
					environment === 'development' ? '.env' : `.env.${environment}`;
				writeFileSync(join(appPath, envFileName), envContent);

				console.log(`✅ Created ${envFileName} for ${app}`);
			}
		}
	}

	private async setupDatabase(environment: string): Promise<void> {
		console.log(`🗄️  Setting up database for ${environment}...`);

		const dbConfigs = {
			development: {
				name: 'quizify_dev',
				port: 27017,
			},
			staging: {
				name: 'quizify_staging',
				port: 27017,
			},
			production: {
				name: 'quizify',
				port: 27017,
			},
			testing: {
				name: 'quizify_test',
				port: 27017,
			},
		};

		const config = dbConfigs[environment as keyof typeof dbConfigs];

		try {
			// Check if MongoDB is running
			execSync('mongosh --eval "db.runCommand({ping: 1})" --quiet', {
				stdio: 'inherit',
			});

			// Create database and initial collections
			const setupScript = `
        use ${config.name}
        db.createCollection('users')
        db.createCollection('quizzes')
        db.createCollection('questions')
        db.createCollection('attempts')
        db.createCollection('categories')
        
        // Create indexes for better performance
        db.users.createIndex({ "email": 1 }, { unique: true })
        db.users.createIndex({ "username": 1 }, { unique: true })
        db.quizzes.createIndex({ "category": 1 })
        db.quizzes.createIndex({ "createdBy": 1 })
        db.attempts.createIndex({ "userId": 1, "quizId": 1 })
        
        print("Database ${config.name} setup completed")
      `;

			writeFileSync('/tmp/db-setup.js', setupScript);
			execSync('mongosh /tmp/db-setup.js', { stdio: 'inherit' });

			console.log(`✅ Database ${config.name} setup completed`);
		} catch (error) {
			console.warn(`⚠️  Could not setup database: ${error.message}`);
		}
	}

	private async configureServices(environment: string): Promise<void> {
		console.log('⚙️  Configuring services...');

		// Create environment-specific docker-compose override
		if (environment !== 'development') {
			const dockerOverride = this.createDockerOverride(environment);
			writeFileSync(
				`docker-compose.${environment}.override.yml`,
				dockerOverride
			);
		}

		// Create environment-specific nginx config (if using nginx)
		if (environment === 'production') {
			const nginxConfig = this.createNginxConfig();
			mkdirSync('config/nginx', { recursive: true });
			writeFileSync('config/nginx/nginx.conf', nginxConfig);
		}

		// Create environment-specific pm2 config (for production deployments)
		if (environment === 'production') {
			const pm2Config = this.createPM2Config();
			writeFileSync('ecosystem.config.js', pm2Config);
		}
	}

	private createDockerOverride(environment: string): string {
		return `version: '3.8'

services:
  server:
    environment:
      - NODE_ENV=${environment}
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  web:
    environment:
      - NODE_ENV=${environment}
    restart: unless-stopped

  admin:
    environment:
      - NODE_ENV=${environment}
    restart: unless-stopped

  db:
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
`;
	}

	private createNginxConfig(): string {
		return `events {
    worker_connections 1024;
}

http {
    upstream api {
        server localhost:5000;
    }

    upstream web {
        server localhost:3000;
    }

    upstream admin {
        server localhost:3001;
    }

    # Main website
    server {
        listen 80;
        server_name quizify.com www.quizify.com;
        
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # API
    server {
        listen 80;
        server_name api.quizify.com;
        
        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Admin panel
    server {
        listen 80;
        server_name admin.quizify.com;
        
        location / {
            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
`;
	}

	private createPM2Config(): string {
		return `module.exports = {
  apps: [
    {
      name: 'quizify-server',
      script: 'apps/server/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/server-err.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true
    },
    {
      name: 'quizify-web',
      script: 'serve',
      args: '-s apps/web/dist -l 3000',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/web-err.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true
    },
    {
      name: 'quizify-admin',
      script: 'serve',
      args: '-s apps/admin/dist -l 3001',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/admin-err.log',
      out_file: './logs/admin-out.log',
      log_file: './logs/admin-combined.log',
      time: true
    }
  ]
};
`;
	}

	async switch(environment: string): Promise<void> {
		if (!this.environments.includes(environment)) {
			throw new Error(`Invalid environment: ${environment}`);
		}

		console.log(`🔄 Switching to ${environment} environment...`);

		try {
			// Copy environment files
			for (const app of this.apps) {
				const appPath = join('apps', app);
				const sourceEnv =
					environment === 'development' ? '.env' : `.env.${environment}`;
				const targetEnv = '.env';

				if (existsSync(join(appPath, sourceEnv))) {
					const envContent = readFileSync(join(appPath, sourceEnv), 'utf-8');
					writeFileSync(join(appPath, targetEnv), envContent);
					console.log(`✅ Switched ${app} to ${environment}`);
				}
			}

			// Stop current services
			try {
				execSync('docker-compose down', { stdio: 'inherit' });
			} catch (error) {
				// Ignore if not running
			}

			// Start services for the new environment
			if (environment !== 'development') {
				execSync(
					`docker-compose -f docker-compose.yml -f docker-compose.${environment}.yml up -d`,
					{ stdio: 'inherit' }
				);
			} else {
				execSync('docker-compose up -d', { stdio: 'inherit' });
			}

			console.log(`✅ Successfully switched to ${environment} environment`);
		} catch (error) {
			console.error(`❌ Failed to switch environment: ${error.message}`);
			process.exit(1);
		}
	}

	async validate(environment: string): Promise<void> {
		console.log(`🔍 Validating ${environment} environment...`);

		const issues: string[] = [];

		// Check environment files exist
		for (const app of this.apps) {
			const appPath = join('apps', app);
			const envFile =
				environment === 'development' ? '.env' : `.env.${environment}`;

			if (!existsSync(join(appPath, envFile))) {
				issues.push(`Missing ${envFile} for ${app}`);
			}
		}

		// Check required environment variables
		const requiredVars = {
			server: ['NODE_ENV', 'PORT', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'],
			web: ['NODE_ENV', 'VITE_API_URL'],
			admin: ['NODE_ENV', 'VITE_API_URL'],
			mobile: ['EXPO_PUBLIC_API_URL'],
		};

		for (const [app, vars] of Object.entries(requiredVars)) {
			const appPath = join('apps', app);
			const envFile =
				environment === 'development' ? '.env' : `.env.${environment}`;
			const envPath = join(appPath, envFile);

			if (existsSync(envPath)) {
				const envContent = readFileSync(envPath, 'utf-8');

				for (const varName of vars) {
					if (!envContent.includes(`${varName}=`)) {
						issues.push(`Missing ${varName} in ${app}/${envFile}`);
					}
				}
			}
		}

		// Check database connectivity (for non-production)
		if (environment !== 'production') {
			try {
				execSync('mongosh --eval "db.runCommand({ping: 1})" --quiet');
				console.log('✅ Database connectivity check passed');
			} catch (error) {
				issues.push('Database is not accessible');
			}
		}

		// Report results
		if (issues.length === 0) {
			console.log(`✅ ${environment} environment validation passed`);
		} else {
			console.log(`❌ ${environment} environment validation failed:`);
			issues.forEach((issue) => console.log(`  - ${issue}`));
			process.exit(1);
		}
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || args.includes('--help') || args.includes('-h')) {
		console.log(`
🌍 Environment Manager for Quizify

Usage: bun run scripts/environment.ts <command> [options]

Commands:
  setup <env>         Setup environment configuration
  switch <env>        Switch to different environment
  validate <env>      Validate environment configuration

Environments:
  development         Local development environment
  staging             Staging environment
  production          Production environment
  testing             Testing environment

Examples:
  bun run scripts/environment.ts setup development
  bun run scripts/environment.ts switch staging
  bun run scripts/environment.ts validate production
`);
		return;
	}

	const environment = args[1];

	if (!environment) {
		console.error('❌ Please specify an environment');
		process.exit(1);
	}

	const envManager = new EnvironmentManager();

	try {
		switch (command) {
			case 'setup':
				await envManager.setup(environment);
				break;
			case 'switch':
				await envManager.switch(environment);
				break;
			case 'validate':
				await envManager.validate(environment);
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
