# Package Generator Script

This script helps you create new packages in the Quizify monorepo using the `ui` package as a template.

## Usage

You can run the script in several ways:

```bash
# Using the npm script
bun run create-package <package-name> [options]

# Or directly
bun run scripts/create-package.ts <package-name> [options]
```

## Options

| Option          | Short | Description                                   | Example                                |
| --------------- | ----- | --------------------------------------------- | -------------------------------------- |
| `--react`       | `-r`  | Create a React component package              | `--react`                              |
| `--utility`     | `-u`  | Create a utility package (default)            | `--utility`                            |
| `--config`      | `-c`  | Create a configuration package                | `--config`                             |
| `--deps`        |       | Additional dependencies (comma-separated)     | `--deps "lodash,moment"`               |
| `--dev-deps`    |       | Additional dev dependencies (comma-separated) | `--dev-deps "jest,@types/jest"`        |
| `--description` |       | Package description                           | `--description "Shared UI components"` |
| `--help`        | `-h`  | Show help message                             | `--help`                               |

## Examples

### Create a React Components Package

```bash
bun run create-package ui-components --react --description "Shared UI components for Quizify"
```

This creates:

- A React package with TypeScript
- React and React DOM dependencies
- ESLint config for React
- A sample component file
- TypeScript config for React libraries

### Create a Utilities Package

```bash
bun run create-package date-utils --utility --description "Date manipulation utilities" --deps "date-fns"
```

This creates:

- A utility package with TypeScript
- Specified dependencies
- Basic TypeScript configuration
- A sample utility function

### Create a Configuration Package

```bash
bun run create-package theme-config --config --description "Theme configuration for the project"
```

This creates:

- A configuration package
- Basic TypeScript setup
- Export configuration for config files

### Create with Custom Dependencies

```bash
bun run create-package api-client --utility --deps "axios,zod" --dev-deps "jest,@types/jest" --description "API client utilities"
```

## Package Structure

The script creates packages with the following structure:

```
packages/your-package/
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
├── README.md            # Package documentation
└── src/
    ├── index.ts|tsx     # Main export file
    └── your-package.ts|tsx  # Main implementation file
```

## Features

- **Automatic dependency management**: Includes appropriate dependencies based on package type
- **TypeScript configuration**: Sets up proper TypeScript config for different package types
- **ESLint integration**: Configures ESLint with the appropriate ruleset
- **Consistent naming**: Follows naming conventions for files and exports
- **Documentation**: Generates basic README with usage instructions
- **Workspace integration**: Automatically integrates with the monorepo structure

## Package Types

### React Packages (`--react`)

- Includes React and React DOM dependencies
- Uses React-specific TypeScript and ESLint configurations
- Creates `.tsx` files with sample React components
- Exports as `"./*": "./src/*.tsx"`

### Utility Packages (`--utility`)

- Basic TypeScript setup
- Creates `.ts` files with utility functions
- Exports as `"./*": "./src/*.ts"`
- Suitable for shared business logic, helpers, etc.

### Config Packages (`--config`)

- Minimal setup for configuration packages
- Suitable for shared constants, theme configs, etc.
- Basic TypeScript configuration

## Naming Conventions

- Package names should be lowercase and use hyphens
- Component names are automatically converted to PascalCase
- Function names are automatically converted to camelCase
- File names match the package name

## Integration with Monorepo

All created packages:

- Are automatically scoped under `@repo/`
- Use workspace-shared ESLint and TypeScript configurations
- Follow the established monorepo patterns
- Can be imported by other packages and apps in the workspace

## Error Handling

The script includes validation for:

- Package name format (lowercase, letters, numbers, hyphens only)
- Existing package conflicts
- Directory creation permissions
- Dependency installation

If any step fails, the script will show a clear error message and exit.
