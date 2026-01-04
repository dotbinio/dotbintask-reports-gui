# DotbinTask - Quick Start Guide

## Prerequisites

1. **Taskwarrior API Backend** must be running on `localhost:8080`
   ```bash
   cd ../dotbintask-api
   export TW_API_TOKENS="your-secret-token"
   export TW_API_CORS_ENABLED=true
   export TW_API_CORS_ORIGINS="http://localhost:5173"
   make run
   ```

2. **Node.js 18+** installed

## Setup & Run

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start development server
npm run dev
```

The app will be available at: **http://localhost:5173**

## First Use

1. Open http://localhost:5173 in your browser
2. Enter your API token (the same token you set in `TW_API_TOKENS`)
3. Select which reports you want to display
4. View your tasks!

## Configuration

The `.env` file is already configured for development:
```env
VITE_API_BASE_URL=http://localhost:8080
```

For production (same domain as API), change to:
```env
VITE_API_BASE_URL=/
```

## Building for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

Built files will be in `dist/` directory.

## Testing PWA Features

1. Build the production version: `npm run build`
2. Preview it: `npm run preview`
3. Open in Chrome/Edge
4. Click the install icon in the address bar
5. Test offline mode by:
   - Loading some tasks
   - Opening DevTools > Application > Service Workers
   - Check "Offline"
   - Refresh the page - cached tasks should still appear

## Troubleshooting

### "Authentication failed" error
- Verify API is running on localhost:8080
- Check that CORS is enabled in the API
- Ensure the token matches what's set in `TW_API_TOKENS`

### "Failed to load reports" error
- Check API is accessible at the configured base URL
- Verify CORS headers are correct
- Check browser console for detailed error messages

### No tasks showing
- Verify you have tasks in Taskwarrior: `task list`
- Check that the selected reports have tasks
- Try selecting different reports

## Features

✅ Token authentication with localStorage  
✅ Customizable report selection  
✅ Mobile-friendly responsive design  
✅ Dark theme by default  
✅ Offline read-only access  
✅ PWA installable on desktop and mobile  
✅ Automatic cache updates  

## Next Steps

See [README.md](./README.md) for full documentation.

