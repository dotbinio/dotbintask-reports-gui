# Docker/Podman Quick Start

> **Note**: All commands work with both Docker and Podman. Just replace `docker` with `podman` if using Podman.

## Single Command Deployment

### Frontend Only

```bash
# Docker
docker build -t dotbintask-gui . && docker run -d -p 3000:80 --name dotbintask-gui dotbintask-gui

# Podman
podman build -t dotbintask-gui . && podman run -d -p 3000:80 --name dotbintask-gui dotbintask-gui
```

Access at: **http://localhost:3000**

### Full Stack (API + Frontend)

Create `docker-compose.yml` in your workspace root:

```yaml
version: '3.8'

services:
  api:
    image: ghcr.io/dotbinio/dotbintask-api:latest
    ports:
      - "8080:8080"
    environment:
      - TW_API_TOKENS=your-secret-token
      - TW_API_CORS_ENABLED=true
      - TW_API_CORS_ORIGINS=http://localhost:3000
    volumes:
      - taskdata:/root/.task
    networks:
      - dotbintask

  frontend:
    build: ./dotbintask-reports-gui
    ports:
      - "3000:80"
    depends_on:
      - api
    networks:
      - dotbintask

volumes:
  taskdata:

networks:
  dotbintask:
```

Then run:

```bash
docker-compose up -d
```

- **API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Token**: `your-secret-token`

## Common Commands

```bash
# View logs
docker logs -f dotbintask-gui

# Stop container
docker stop dotbintask-gui

# Remove container
docker rm dotbintask-gui

# Rebuild
docker build --no-cache -t dotbintask-gui .

# Shell into container
docker exec -it dotbintask-gui sh
```

## Troubleshooting

### Can't connect to API
- Ensure API is running: `docker ps | grep api`
- Check CORS settings in API
- Verify network connectivity

### Container exits immediately
```bash
docker logs dotbintask-gui
```

### Port already in use
```bash
# Use different port
docker run -d -p 8888:80 dotbintask-gui
```

## Full Documentation

See [DOCKER.md](./DOCKER.md) for complete documentation including:
- Production deployment
- Kubernetes setup
- Security best practices
- Performance optimization

