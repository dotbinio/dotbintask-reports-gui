# Docker Deployment Files

This directory contains files for deploying DotbinTask with Docker.

## Quick Start

```bash
cd deploy/docker

# Start everything
docker-compose up -d
```

Access at: **http://localhost:3000**

## Files

- **`docker-compose.yml`** - Complete stack definition (API + Frontend + Proxy)
- **`nginx-proxy.conf`** - Nginx reverse proxy configuration
