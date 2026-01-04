# Development Guide

This guide is for developers who want to contribute to or modify DotbinTask.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- A running instance of the [DotbinTask API](https://github.com/dotbinio/dotbintask-api)
- Valid API authentication token

### Installation

```bash
# Clone the repository
git clone https://github.com/dotbinio/dotbintask-reports-gui.git
cd dotbintask-reports-gui

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your API server URL
```

### Running in Development Mode

```bash
# Start development server with hot reload
npm run dev
```

The app will be available at **http://localhost:5173**

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

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

## API Configuration

The API base URL is configured via environment variables:

### Development

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Production

For production builds, set the environment variable:
```bash
# Build with custom API URL
VITE_API_BASE_URL=https://api.example.com npm run build
```

Or use Docker build args:
```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t dotbintask-gui .
```

## Development Workflow

1. **Make changes** to the source files
2. **Hot reload** will automatically update the browser
3. **Check TypeScript** for type errors
4. **Build** to verify production build works
5. **Commit** your changes

## Code Style

- Use TypeScript for type safety
- Follow existing code structure and naming conventions
- Use Preact hooks for state management
- Keep components small and focused
- Add comments for complex logic

## Testing

```bash
# Run TypeScript type checking
npm run build

# Check for linter errors
# (No linter configured yet - contributions welcome!)
```

## PWA Development

### Testing PWA Features

PWA features only work in production builds:

```bash
# Build for production
npm run build

# Serve the production build
npm run preview
```

Then test:
1. Service worker registration (DevTools > Application)
2. Install prompt
3. Offline mode

### Debugging Service Worker

1. Open DevTools > Application > Service Workers
2. Check "Update on reload"
3. Use "Unregister" to clear the service worker
4. Check Cache Storage to see cached data

## Docker Development

### Building Docker Image

```bash
# Build the image
docker build -t dotbintask-gui:dev .

# Run locally
docker run -d -p 3000:80 dotbintask-gui:dev
```

### Docker Compose Development

```bash
# Build and run with docker-compose
docker-compose up --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Contributing

### Before Submitting a PR

1. Ensure code builds without errors
2. Test in both development and production modes
3. Test PWA features (service worker, offline mode)
4. Update documentation if needed
5. Follow existing code style

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add task filtering`
- `fix: resolve offline mode bug`
- `docs: update installation guide`
- `chore: update dependencies`

## Troubleshooting

### Dev server won't start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build fails

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clean build
rm -rf dist
npm run build
```

### Hot reload not working

- Check that you're editing files in `src/`
- Restart the dev server
- Clear browser cache

### PWA not updating

- Unregister service worker in DevTools
- Clear cache storage
- Hard refresh (Ctrl+Shift+R)

## Resources

- [Preact Documentation](https://preactjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [PicoCSS Documentation](https://picocss.com/)
- [PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## License

MIT License - see [LICENSE](../LICENSE) file for details.

