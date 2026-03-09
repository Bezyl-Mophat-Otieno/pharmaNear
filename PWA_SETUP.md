# PWA Setup Guide

## Configuration Complete ✓

Your pharmaNear application is now configured as a Progressive Web App (PWA).

## What's Been Configured

### 1. Vite PWA Plugin (`vite.config.ts`)
- Auto-update service worker registration
- Web app manifest with app metadata
- Workbox caching strategies for:
  - Google Fonts (CacheFirst)
  - Supabase API calls (NetworkFirst)
  - API endpoints (NetworkFirst)
  - Static assets (precached)

### 2. Service Worker Registration (`src/main.tsx`)
- Automatic service worker registration
- Update prompts when new version available
- Offline-ready notifications

### 3. PWA Meta Tags (`index.html`)
- Theme color configuration
- Mobile web app capabilities
- Apple touch icon support

### 4. TypeScript Support (`src/vite-env.d.ts`)
- Type declarations for PWA virtual modules

## Optional: Update Prompt Component

A ready-to-use update prompt component has been created at:
`src/components/PWAUpdatePrompt.tsx`

To use it, add to your App.tsx:

\`\`\`tsx
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';

function App() {
  return (
    <>
      <PWAUpdatePrompt />
      {/* Your app content */}
    </>
  );
}
\`\`\`

## Testing Your PWA

### Development
```bash
npm run dev
# or
pnpm dev
```

The PWA will work in development mode with `devOptions.enabled: true`.

### Production Build
```bash
npm run build
npm run preview
```

### Testing PWA Features

1. **Install Prompt**: Visit your app in Chrome/Edge, look for the install icon in the address bar
2. **Offline Mode**: 
   - Open DevTools → Application → Service Workers
   - Check "Offline" checkbox
   - Refresh the page - it should still work
3. **Update Flow**:
   - Make changes and rebuild
   - The app will prompt users to update

## Lighthouse PWA Audit

Run a Lighthouse audit to verify PWA compliance:

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Click "Generate report"

## Customization

### Update App Icons

Replace these files with your own icons:
- `/public/images/logos/pharmaNear.png` (512x512 recommended)
- `/public/images/logos/shamsy.ico`

### Modify Caching Strategy

Edit `vite.config.ts` → `VitePWA.workbox.runtimeCaching` to adjust:
- Cache duration
- Network strategies (NetworkFirst, CacheFirst, StaleWhileRevalidate)
- URL patterns

### Change Theme Color

Update in `vite.config.ts`:
```ts
manifest: {
  theme_color: '#your-color',
  background_color: '#your-color'
}
```

## Deployment Checklist

- [ ] Icons are optimized (192x192 and 512x512)
- [ ] Theme colors match your brand
- [ ] Test offline functionality
- [ ] Test install prompt on mobile
- [ ] Run Lighthouse PWA audit (score > 90)
- [ ] Test update flow
- [ ] Verify HTTPS in production (required for PWA)

## Resources

- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
