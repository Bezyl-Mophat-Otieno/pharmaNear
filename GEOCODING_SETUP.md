# Geocoding Setup Guide

This application uses OpenWeather's Geocoding API to provide location autocomplete functionality in the seller onboarding process.

## Setup Instructions

### 1. Get an OpenWeather API Key

1. Visit [OpenWeather API](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

### 2. Configure Environment Variables

Add your API key to both `.env` and `.env.local` files:

```env
VITE_OPEN_WEATHER_API_KEY=your_api_key_here
VITE_OPEN_WEATHER_API_GEOCODE_URL=http://api.openweathermap.org/geo/1.0/direct
VITE_OPEN_WEATHER_API_FORECAST_URL=https://api.openweathermap.org/data/3.0/onecall
```

### 3. How It Works

- **User Input**: As the seller types their business location, the app searches for matching locations
- **Debounced Search**: API calls are debounced (500ms) to avoid excessive requests
- **Caching**: Results are cached in localStorage for 24 hours to reduce API calls
- **Location Selection**: When a location is selected, the full address and coordinates (lat/lon) are automatically captured
- **Data Storage**: The selected location data is stored in the onboarding form state

### 4. Features

- Real-time location suggestions as you type
- Displays location name, state (if available), and country
- Shows coordinates for verification
- Visual feedback with selected location display
- Automatic caching to improve performance
- Click outside to close suggestions dropdown

### 5. API Limits

The free tier of OpenWeather API includes:
- 60 calls/minute
- 1,000,000 calls/month

With caching and debouncing, this should be more than sufficient for typical usage.

## Files Created

- `src/services/geocoding.ts` - Geocoding service with caching
- `src/types/geocoding.ts` - TypeScript types and Zod schemas
- `src/utils/normalizeInput.ts` - Input normalization utility
- `src/components/seller/StepBusinessInfo.tsx` - Updated with autocomplete

## Testing

1. Start the development server
2. Navigate to the seller onboarding page
3. In the Business Information step, start typing a city name (e.g., "Nairobi")
4. Select a location from the dropdown
5. Verify that the full address and coordinates are captured
