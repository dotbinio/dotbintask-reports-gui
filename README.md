# DotbinTask

> **⚠️ UNDER CONSTRUCTION**: This project is currently in active development and is **not ready for production use**. Features may change without notice. Use at your own risk.

A lightweight Progressive Web App (PWA) for managing your Taskwarrior tasks. Built with Preact, PicoCSS, and Vite.

## Features

- 🔐 **Token Authentication** - Secure API token-based authentication
- 📊 **Customizable Reports** - Choose which reports to display
- 📱 **Mobile-Friendly** - Responsive design works on all devices
- 🌙 **Dark Theme** - Beautiful dark theme by default
- 📴 **Offline Support** - Read-only access to cached tasks without internet
- ⚡ **Lightweight** - Preact keeps the bundle size minimal (~3KB)

## Prerequisites

- Node.js 18+ and npm
- A running instance of the [DotbinTask API](https://github.com/dotbinio/dotbintask-api)
- Valid API authentication token

## Installation

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your API server URL
```

## Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Configuration

Create a `.env` file with:

```env
# For development with API on localhost:8080
VITE_API_BASE_URL=http://localhost:8080

# For production (same domain as API)
# VITE_API_BASE_URL=/
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

## Docker Deployment

### Quick Start with Docker

**Using pre-built image from GitHub Container Registry:**

```bash
# Pull and run the latest image
docker pull ghcr.io/dotbinio/dotbintask-reports-gui:latest
docker run -d -p 3000:80 --name dotbintask-gui ghcr.io/dotbinio/dotbintask-reports-gui:latest
```

**Building from source:**

```bash
# Build the Docker image
docker build -t dotbintask-gui:latest .

# Run the container
docker run -d -p 3000:80 --name dotbintask-gui dotbintask-gui:latest
```

Access at: **http://localhost:3000**

### Available Image Tags

Images are automatically built and pushed to GHCR on every commit:

- `latest` - Latest stable version from master branch
- `v1.0.0` - Specific version tags
- `v1.0` - Minor version
- `v1` - Major version

### Full Stack with Docker Compose

See [DOCKER.md](./DOCKER.md) for complete Docker deployment instructions including:
- Standalone frontend deployment
- Full stack setup (API + Frontend)
- Production deployment
- Kubernetes deployment
- Troubleshooting

## Usage

1. **Authentication**: On first launch, enter your API token. It will be stored securely in your browser's localStorage.

2. **Select Reports**: Choose which reports you want to display (e.g., "next", "active", "completed"). Your preferences are saved automatically.

3. **View Tasks**: Tasks from selected reports are displayed in clean, mobile-friendly tables with:
   - Description with priority badges
   - Project name
   - Tags
   - Urgency (color-coded)
   - Due date

4. **Offline Mode**: When offline, the app will display cached tasks from your last sync. An indicator shows when you're viewing cached data.

## PWA Features

### Installation

The app can be installed as a PWA on:
- Desktop browsers (Chrome, Edge, Safari)
- Mobile devices (iOS Safari, Android Chrome)

Look for the "Install" or "Add to Home Screen" option in your browser.

### Offline Capability

- Static assets are cached for offline use
- API responses are cached with a Network-First strategy
- Tasks data is stored in localStorage for offline read access
- Automatic cache updates when online

## Project Structure

```
dotbintask-reports-gui/
├── src/
│   ├── components/          # Preact components
│   │   ├── AuthPrompt.tsx   # Authentication UI
│   │   ├── ReportSelector.tsx
│   │   ├── ReportView.tsx
│   │   └── TaskList.tsx
│   ├── services/            # Business logic
│   │   ├── api.ts           # API client
│   │   ├── auth.ts          # Token management
│   │   └── storage.ts       # LocalStorage utilities
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── styles/              # Custom CSS
│   │   └── custom.css
│   ├── app.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icon-*.png           # PWA icons
└── vite.config.ts           # Vite + PWA configuration
```

## Tech Stack

- **Framework**: [Preact](https://preactjs.com/) - 3KB React alternative
- **CSS**: [PicoCSS](https://picocss.com/) - Minimal, classless CSS framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast, modern build tool
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) - PWA support with Workbox

## API Integration

This frontend connects to the [Taskwarrior API](../dotbintask-api) backend. Make sure the API is running and accessible.

### CORS Configuration

If running the API on a different domain, ensure CORS is enabled:

```bash
export TW_API_CORS_ENABLED=true
export TW_API_CORS_ORIGINS="http://localhost:5173"
```

## Future Enhancements (Phase 2+)

- Task editing and updating
- Create new tasks
- Mark tasks as done/start/stop
- Multiple tabs for different views
- Search and filtering
- Task detail modal with full information

## License

MIT License - see [LICENSE](../LICENSE) file for details.

