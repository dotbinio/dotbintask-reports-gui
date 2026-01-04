# Docker Deployment Guide

This guide covers running DotbinTask frontend with Docker.

## Pre-built Images

Pre-built images are available on GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/dotbinio/dotbintask-reports-gui:latest

# Pull specific version
docker pull ghcr.io/dotbinio/dotbintask-reports-gui:v1.0.0
```

Images are automatically built on every push to master and on version tags.

## Quick Start

### Option 1: Use Pre-built Image

```bash
# Run the pre-built image from GHCR
docker run -d \
  --name dotbintask-gui \
  -p 3000:80 \
  ghcr.io/dotbinio/dotbintask-reports-gui:latest
```

### Option 2: Build from Source

```bash
# Build the image locally
docker build -t dotbintask-gui:latest .

# Run the container
docker run -d \
  --name dotbintask-gui \
  -p 3000:80 \
  dotbintask-gui:latest
```

Access the app at: **http://localhost:3000**

### Option 2: Docker Compose (Recommended)

This assumes you have the API running. First, create a Docker network:

```bash
# Create shared network (if not exists)
docker network create dotbintask
```

Then start the frontend:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access the app at: **http://localhost:3000**

## Full Stack Setup (API + Frontend)

To run both the API and frontend together, create a combined `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  # Backend - DotbinTask API
  api:
    image: ghcr.io/dotbinio/dotbintask-api:latest
    # Or build from source:
    # build: ./dotbintask-api
    ports:
      - "8080:8080"
    environment:
      - TW_API_TOKENS=your-secret-token-here
      - TW_API_CORS_ENABLED=true
      - TW_API_CORS_ORIGINS=http://localhost:3000
      - TW_API_ENABLE_UI=false
    volumes:
      - taskdata:/root/.task
    restart: unless-stopped
    networks:
      - dotbintask

  # Frontend - DotbinTask GUI
  frontend:
    image: ghcr.io/dotbinio/dotbintask-reports-gui:latest
    # Or build from source:
    # build: ./dotbintask-reports-gui
    ports:
      - "3000:80"
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - dotbintask

volumes:
  taskdata:

networks:
  dotbintask:
    name: dotbintask
```

Start everything:

```bash
docker-compose up -d
```

- API: http://localhost:8080
- Frontend: http://localhost:3000

## Production Deployment

### Build for Production

```bash
# Build the image
docker build -t dotbintask-gui:latest .

# Tag for your registry
docker tag dotbintask-gui:latest your-registry/dotbintask-gui:latest

# Push to registry
docker push your-registry/dotbintask-gui:latest
```

### Environment Configuration

The frontend is built with `VITE_API_BASE_URL=/` by default, which means it expects the API to be on the same domain.

**To change the API URL at build time:**

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t dotbintask-gui:latest .
```

Update the Dockerfile to accept build args:

```dockerfile
# In builder stage, before RUN npm run build:
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
```

### Nginx Reverse Proxy

For production, use nginx to proxy both frontend and API on the same domain:

```nginx
server {
    listen 80;
    server_name tasks.example.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://localhost:8080;
    }
}
```

## Docker Hub / GitHub Container Registry

### Push to Docker Hub

```bash
# Login
docker login

# Tag
docker tag dotbintask-gui:latest yourusername/dotbintask-gui:latest
docker tag dotbintask-gui:latest yourusername/dotbintask-gui:v1.0.0

# Push
docker push yourusername/dotbintask-gui:latest
docker push yourusername/dotbintask-gui:v1.0.0
```

### Push to GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag
docker tag dotbintask-gui:latest ghcr.io/yourusername/dotbintask-gui:latest
docker tag dotbintask-gui:latest ghcr.io/yourusername/dotbintask-gui:v1.0.0

# Push
docker push ghcr.io/yourusername/dotbintask-gui:latest
docker push ghcr.io/yourusername/dotbintask-gui:v1.0.0
```

## Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dotbintask-gui
  namespace: dotbintask
spec:
  replicas: 2
  selector:
    matchLabels:
      app: dotbintask-gui
  template:
    metadata:
      labels:
        app: dotbintask-gui
    spec:
      containers:
      - name: dotbintask-gui
        image: ghcr.io/yourusername/dotbintask-gui:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: dotbintask-gui
  namespace: dotbintask
spec:
  selector:
    app: dotbintask-gui
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dotbintask-gui
  namespace: dotbintask
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - tasks.example.com
    secretName: dotbintask-tls
  rules:
  - host: tasks.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dotbintask-gui
            port:
              number: 80
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yaml
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs dotbintask-gui

# Inspect container
docker inspect dotbintask-gui
```

### Can't connect to API

1. Check that API is running and accessible
2. Verify CORS configuration in API
3. Check browser console for errors
4. Ensure network connectivity between containers

### PWA not working

1. HTTPS is required for PWA in production
2. Check that service worker registered (DevTools > Application)
3. Verify manifest.json is accessible

### Build fails

```bash
# Clean build with no cache
docker build --no-cache -t dotbintask-gui:latest .

# Check for node_modules issues
rm -rf node_modules package-lock.json
npm install
```

## Performance Optimization

### Multi-platform builds

```bash
# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t dotbintask-gui:latest \
  --push .
```

### Smaller images

The Dockerfile already uses:
- Multi-stage builds (Node for build, nginx for serve)
- Alpine Linux (minimal base images)
- npm ci (clean install)
- .dockerignore (exclude unnecessary files)

Current image size: ~50MB (nginx + static files)

## Security

### Run as non-root (nginx)

Nginx in the Alpine image already runs as nginx user (non-root).

### Scan for vulnerabilities

```bash
# Using Docker Scout
docker scout cves dotbintask-gui:latest

# Using Trivy
trivy image dotbintask-gui:latest
```

### Update dependencies

```bash
# Rebuild with latest base images
docker build --pull -t dotbintask-gui:latest .
```

## Monitoring

### Health checks

The container includes a built-in health check:

```bash
# Check health status
docker ps

# Manual health check
docker exec dotbintask-gui wget -q -O - http://localhost:80/health
```

### Logs

```bash
# Follow logs
docker logs -f dotbintask-gui

# Last 100 lines
docker logs --tail 100 dotbintask-gui
```

### Metrics

For production monitoring, integrate with:
- Prometheus (nginx-prometheus-exporter)
- Grafana (dashboards)
- ELK Stack (centralized logging)

