#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DockerConfig {
	services: string[];
	env: string;
	rebuild: boolean;
	logs: boolean;
}

class DockerManager {
	private availableServices = [
		'server',
		'web',
		'admin',
		'mobile',
		'db',
		'redis',
	];
	private defaultComposeFile = 'docker-compose.yml';

	async start(config: DockerConfig): Promise<void> {
		console.log('🐳 Starting Docker services...');

		const { services, env, rebuild, logs } = config;

		try {
			// Build command
			let cmd = 'docker-compose';

			if (env !== 'development') {
				cmd += ` -f docker-compose.${env}.yml`;
			}

			if (rebuild) {
				console.log('🔨 Building containers...');
				execSync(`${cmd} build`, { stdio: 'inherit' });
			}

			// Start services
			const serviceArgs = services.length > 0 ? services.join(' ') : '';
			execSync(`${cmd} up -d ${serviceArgs}`, { stdio: 'inherit' });

			console.log('✅ Docker services started');

			if (logs) {
				console.log('📋 Showing logs...');
				execSync(`${cmd} logs -f ${serviceArgs}`, { stdio: 'inherit' });
			}
		} catch (error) {
			console.error('❌ Failed to start Docker services:', error.message);
			process.exit(1);
		}
	}

	async stop(services: string[] = []): Promise<void> {
		console.log('⏹️  Stopping Docker services...');

		try {
			const serviceArgs = services.length > 0 ? services.join(' ') : '';
			execSync(`docker-compose stop ${serviceArgs}`, { stdio: 'inherit' });
			console.log('✅ Docker services stopped');
		} catch (error) {
			console.error('❌ Failed to stop Docker services:', error.message);
			process.exit(1);
		}
	}

	async restart(services: string[] = []): Promise<void> {
		console.log('🔄 Restarting Docker services...');

		try {
			const serviceArgs = services.length > 0 ? services.join(' ') : '';
			execSync(`docker-compose restart ${serviceArgs}`, { stdio: 'inherit' });
			console.log('✅ Docker services restarted');
		} catch (error) {
			console.error('❌ Failed to restart Docker services:', error.message);
			process.exit(1);
		}
	}

	async logs(services: string[] = [], follow: boolean = false): Promise<void> {
		console.log('📋 Showing Docker logs...');

		try {
			const serviceArgs = services.length > 0 ? services.join(' ') : '';
			const followFlag = follow ? '-f' : '';
			execSync(`docker-compose logs ${followFlag} ${serviceArgs}`, {
				stdio: 'inherit',
			});
		} catch (error) {
			console.error('❌ Failed to show logs:', error.message);
			process.exit(1);
		}
	}

	async status(): Promise<void> {
		console.log('📊 Docker services status:');

		try {
			execSync('docker-compose ps', { stdio: 'inherit' });
		} catch (error) {
			console.error('❌ Failed to get status:', error.message);
			process.exit(1);
		}
	}

	async cleanup(): Promise<void> {
		console.log('🧹 Cleaning up Docker resources...');

		try {
			// Stop all services
			execSync('docker-compose down', { stdio: 'inherit' });

			// Remove unused images, containers, networks, and volumes
			execSync('docker system prune -a --volumes -f', { stdio: 'inherit' });

			console.log('✅ Docker cleanup completed');
		} catch (error) {
			console.error('❌ Cleanup failed:', error.message);
			process.exit(1);
		}
	}

	async shell(service: string): Promise<void> {
		if (!this.availableServices.includes(service)) {
			console.error(`❌ Unknown service: ${service}`);
			console.log(`Available services: ${this.availableServices.join(', ')}`);
			process.exit(1);
		}

		console.log(`🐚 Opening shell in ${service} container...`);

		try {
			execSync(`docker-compose exec ${service} /bin/bash`, {
				stdio: 'inherit',
			});
		} catch (error) {
			// Try with sh if bash is not available
			try {
				execSync(`docker-compose exec ${service} /bin/sh`, {
					stdio: 'inherit',
				});
			} catch (shError) {
				console.error('❌ Failed to open shell:', error.message);
				process.exit(1);
			}
		}
	}

	async createComposeFile(): Promise<void> {
		const composeContent = `version: '3.8'

services:
  # Database
  db:
    image: mongo:7
    container_name: quizify-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: quizify
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./apps/server/data/init:/docker-entrypoint-initdb.d
    networks:
      - quizify-network

  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    container_name: quizify-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - quizify-network

  # Server API
  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    container_name: quizify-server
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DB_HOST: db
      DB_PORT: 27017
      DB_NAME: quizify
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "5000:5000"
    volumes:
      - ./apps/server:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    networks:
      - quizify-network

  # Web Application
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: quizify-web
    restart: unless-stopped
    environment:
      NODE_ENV: development
      VITE_API_URL: http://localhost:5000
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    depends_on:
      - server
    networks:
      - quizify-network

  # Admin Panel
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    container_name: quizify-admin
    restart: unless-stopped
    environment:
      NODE_ENV: development
      VITE_API_URL: http://localhost:5000
    ports:
      - "3001:3000"
    volumes:
      - ./apps/admin:/app
      - /app/node_modules
    depends_on:
      - server
    networks:
      - quizify-network

volumes:
  mongo_data:
  redis_data:

networks:
  quizify-network:
    driver: bridge
`;

		writeFileSync(this.defaultComposeFile, composeContent);
		console.log('✅ docker-compose.yml created');
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || args.includes('--help') || args.includes('-h')) {
		console.log(`
🐳 Docker Management for Quizify

Usage: bun run scripts/docker.ts <command> [options]

Commands:
  start [services...]     Start Docker services
  stop [services...]      Stop Docker services  
  restart [services...]   Restart Docker services
  logs [services...]      Show logs from services
  status                  Show status of all services
  cleanup                 Stop all services and cleanup resources
  shell <service>         Open shell in service container
  init                    Create initial docker-compose.yml

Options:
  --env <env>            Environment (development|staging|production)
  --rebuild              Rebuild containers before starting
  --follow               Follow logs (use with logs command)

Examples:
  bun run scripts/docker.ts start --rebuild
  bun run scripts/docker.ts start server db --env production
  bun run scripts/docker.ts logs web --follow
  bun run scripts/docker.ts shell server
  bun run scripts/docker.ts cleanup
`);
		return;
	}

	const dockerManager = new DockerManager();

	// Parse options
	const envIndex = args.indexOf('--env');
	const env = envIndex !== -1 ? args[envIndex + 1] : 'development';
	const rebuild = args.includes('--rebuild');
	const follow = args.includes('--follow');

	// Get services (filter out options)
	const services = args
		.slice(1)
		.filter(
			(arg) => !arg.startsWith('--') && args[args.indexOf(arg) - 1] !== '--env'
		);

	try {
		switch (command) {
			case 'start':
				await dockerManager.start({ services, env, rebuild, logs: false });
				break;
			case 'stop':
				await dockerManager.stop(services);
				break;
			case 'restart':
				await dockerManager.restart(services);
				break;
			case 'logs':
				await dockerManager.logs(services, follow);
				break;
			case 'status':
				await dockerManager.status();
				break;
			case 'cleanup':
				await dockerManager.cleanup();
				break;
			case 'shell':
				const service = args[1];
				if (!service) {
					console.error('❌ Please specify a service');
					process.exit(1);
				}
				await dockerManager.shell(service);
				break;
			case 'init':
				await dockerManager.createComposeFile();
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
