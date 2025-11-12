# Docker Setup

## Overview

This document describes the Docker containerization setup for the Next.js Product Site application. The Docker setup provides a simple and consistent way to run the application in any environment without needing to install Node.js or pnpm locally.

## What Was Built

### 1. Dockerfile
A multi-stage Dockerfile that:
- Uses Node.js 22 Alpine as the base image for smaller size
- Enables pnpm via corepack
- Builds the application in a builder stage
- Creates a lean production image with only necessary files
- Runs as a non-root user for security
- Exposes port 3000 for the application

### 2. .dockerignore
A comprehensive ignore file that excludes:
- Node modules and dependencies
- Development files (tests, storybook, docs)
- Git and IDE files
- Build artifacts and logs
- Environment files

### 3. docker-compose.yml
A Docker Compose configuration that:
- Builds and runs the application
- Maps port 3000 to the host
- Sets appropriate environment variables
- Includes health checks
- Configures restart policy

### 4. next.config.mjs Update
Added `output: 'standalone'` configuration to enable Next.js standalone output mode, which is required for optimized Docker builds.

## How It's Used

### Using Docker Compose (Recommended)

The easiest way to run the application:

```bash
# Build and start the application
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the application
docker-compose down
```

### Using Docker Directly

For more control:

```bash
# Build the image
docker build -t next-product-site .

# Run the container
docker run -p 3000:3000 next-product-site

# Run with custom environment variables
docker run -p 3000:3000 -e NODE_ENV=production next-product-site
```

## Testing Your Changes

### 1. Build the Docker Image
```bash
docker-compose build
```

Expected output: Successful build with no errors.

### 2. Start the Application
```bash
docker-compose up
```

Expected output: Application starts and logs show it's ready.

### 3. Access the Application
Open your browser to [http://localhost:3000](http://localhost:3000)

Expected result: The Next.js Product Site homepage loads successfully.

### 4. Verify Health
```bash
docker-compose ps
```

Expected output: The app service shows as "healthy" after the start period.

### 5. Check Logs
```bash
docker-compose logs -f app
```

Expected output: Application logs with no errors.

### 6. Stop the Application
```bash
docker-compose down
```

Expected output: Container stops gracefully.

## Benefits

1. **Consistency**: Same environment across development, testing, and production
2. **Simplicity**: No need to install Node.js or pnpm locally
3. **Isolation**: Application runs in its own container
4. **Security**: Runs as non-root user
5. **Optimization**: Multi-stage build keeps production image small
6. **Health Monitoring**: Built-in health checks

## Architecture

```
┌─────────────────────────────────────┐
│         Builder Stage               │
│  - Install dependencies             │
│  - Build Next.js application        │
│  - Create standalone output         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Runner Stage                │
│  - Copy built files only            │
│  - Run as non-root user             │
│  - Expose port 3000                 │
│  - Start Node.js server             │
└─────────────────────────────────────┘
```

## Configuration

### Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `production` by default
- `PORT`: Application port (default: 3000)
- `HOSTNAME`: Bind address (default: 0.0.0.0)

You can override these in `docker-compose.yml` or pass them via `-e` flag with `docker run`.

### Port Mapping

By default, the application is accessible on port 3000. To use a different port:

```yaml
# In docker-compose.yml
ports:
  - "8080:3000"  # Access on http://localhost:8080
```

## Troubleshooting

### Build Fails

If the build fails, check:
1. Docker daemon is running
2. You have sufficient disk space
3. pnpm-lock.yaml is present and up to date

### Application Won't Start

If the container starts but the app doesn't respond:
1. Check logs: `docker-compose logs app`
2. Verify port 3000 isn't already in use
3. Check health status: `docker-compose ps`

### Changes Not Reflecting

If code changes aren't reflected:
1. Rebuild the image: `docker-compose up --build`
2. Remove old images: `docker-compose down && docker-compose up --build`

## Production Considerations

For production deployments:

1. **Multi-architecture builds**: Consider building for multiple platforms
2. **Image registry**: Push images to a registry (Docker Hub, ECR, GCR)
3. **Secrets management**: Use Docker secrets or environment-specific files
4. **Resource limits**: Set memory and CPU limits in docker-compose.yml
5. **Logging**: Configure log drivers for centralized logging
6. **Monitoring**: Integrate with monitoring solutions

## Next Steps

- Configure additional services (databases, cache) in docker-compose.yml
- Set up CI/CD to build and push Docker images
- Create different docker-compose files for dev/staging/prod
- Add volume mounts for development hot-reloading
