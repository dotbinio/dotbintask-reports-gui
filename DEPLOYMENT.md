# Deployment Guide

This guide covers deploying DotbinTask to production.

## Prerequisites

- Built application (`npm run build`)
- Web server (nginx, Caddy, Apache, etc.)
- Taskwarrior API backend accessible

## Build for Production

```bash
# Set production API URL
echo "VITE_API_BASE_URL=/" > .env

# Build
npm run build
```

The `dist/` directory contains all files needed for deployment.

## Deployment Options

### Option 1: Same Domain as API (Recommended)

Deploy the frontend to the same domain as your API backend. This avoids CORS issues.

**Example with nginx:**

```nginx
server {
    listen 80;
    server_name tasks.example.com;

    # Frontend (static files)
    location / {
        root /var/www/dotbintask/dist;
        try_files $uri $uri/ /index.html;
    }

    # API backend (proxy to Go server)
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:8080;
    }
}
```

**Deploy steps:**
```bash
# Copy built files to web server
scp -r dist/* user@server:/var/www/dotbintask/dist/

# Restart web server
ssh user@server 'sudo systemctl restart nginx'
```

### Option 2: Different Domain (CORS Required)

If deploying to a different domain, configure CORS in the API:

```bash
export TW_API_CORS_ENABLED=true
export TW_API_CORS_ORIGINS="https://tasks.example.com"
```

Build with full API URL:
```bash
echo "VITE_API_BASE_URL=https://api.example.com" > .env
npm run build
```

### Option 3: Static Hosting (Netlify, Vercel, Cloudflare Pages)

These platforms work great for the frontend, but you'll need CORS configured on your API.

**Netlify/Vercel:**
1. Connect your git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL=https://your-api-domain.com`

**Cloudflare Pages:**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy
wrangler pages deploy dist
```

### Option 4: Docker

Create a `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:
```bash
docker build -t dotbintask .
docker run -p 8080:80 dotbintask
```

## PWA Considerations

### HTTPS Required

PWAs require HTTPS in production. Use Let's Encrypt for free SSL:

```bash
# With Certbot
sudo certbot --nginx -d tasks.example.com
```

### Service Worker Scope

The service worker is scoped to the root (`/`). If deploying to a subdirectory, update `vite.config.ts`:

```typescript
VitePWA({
  base: '/taskwarrior/',  // for /taskwarrior/ subdirectory
  // ... rest of config
})
```

### Cache Strategy

The app uses:
- **Precaching**: All static assets (JS, CSS, HTML)
- **Network-First**: API calls (with 24h cache fallback)
- **localStorage**: Task data for offline access

## Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | `/` or full URL |

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Can authenticate with API token
- [ ] Reports load correctly
- [ ] Tasks display properly
- [ ] PWA installable (install icon appears)
- [ ] Service worker registers (check DevTools > Application)
- [ ] Offline mode works (load tasks, go offline, refresh)
- [ ] Mobile responsive (test on phone)
- [ ] HTTPS enabled (for PWA features)

## Monitoring

### Check Service Worker Status

In browser DevTools:
1. Application tab > Service Workers
2. Should show "activated and running"

### Check Cache

In browser DevTools:
1. Application tab > Cache Storage
2. Should see caches for static assets and API responses

### Check Offline Mode

1. Load the app and view some tasks
2. DevTools > Network tab > Throttling > Offline
3. Refresh page
4. Tasks should still appear with "Offline mode" indicator

## Troubleshooting

### PWA not installable
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker registered successfully
- Check browser console for errors

### Service worker not updating
- Hard refresh (Ctrl+Shift+R)
- Clear site data in DevTools
- Check "Update on reload" in Service Workers panel

### CORS errors
- Verify API CORS configuration
- Check allowed origins match exactly
- Ensure credentials are allowed if needed

### Offline mode not working
- Check service worker is active
- Verify cache storage has data
- Check localStorage has cached tasks
- Try loading tasks while online first

## Security

### API Token Storage
- Tokens stored in localStorage (not cookies)
- Only sent in Authorization header
- Cleared on logout
- Not accessible to other domains

### Content Security Policy (Optional)

Add to nginx config:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://your-api-domain.com;";
```

## Performance

The production build is highly optimized:
- **Bundle size**: ~22KB JS (gzipped: ~9KB)
- **CSS**: ~84KB (gzipped: ~12KB) - PicoCSS
- **Total**: ~106KB initial load
- **PWA overhead**: ~13KB (service worker + workbox)

### Further Optimization

1. **Enable compression** in web server (gzip/brotli)
2. **Set cache headers** for static assets
3. **Use CDN** for global distribution
4. **Enable HTTP/2** for multiplexing

## Updates

To deploy updates:

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies (if changed)
npm install

# 3. Build
npm run build

# 4. Deploy
# (copy dist/ to server or push to hosting platform)

# 5. Users will auto-update on next visit
# (service worker will detect new version)
```

The PWA will automatically update in the background when users revisit the site.

