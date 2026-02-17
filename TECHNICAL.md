# Seek - Technical Documentation

## Architecture Overview

Seek is a single-page application (SPA) built with vanilla JavaScript, CSS, and HTML5. It requires no build process and can be deployed as static files to any web server or CDN.

## File Structure

```
Seek/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with theming
├── app.js              # Application logic and API integration
├── README.md           # User documentation
├── .gitignore          # Git ignore rules
└── .github/
    └── workflows/
        └── pages.yml   # GitHub Pages deployment workflow
```

## Core Features

### 1. GPS Geolocation
- Uses browser's Geolocation API with high accuracy mode
- Graceful fallback to default location (Times Square) if permission denied
- Real-time location updates with refresh button

### 2. Nearby Bus Stops Discovery
- Fetches stops from NYC MTA Bus Time API
- Calculates distances using Haversine formula
- Displays 12 closest stops sorted by distance
- Shows stop names, IDs, and distances in miles

### 3. Real-time Arrival Predictions
- Fetches live arrival data for selected stops
- Displays time in minutes until arrival
- Shows actual arrival time (formatted)
- Indicates distance and stops away
- Auto-refreshes every 30 seconds

### 4. Cross Streets Display
- Uses OpenStreetMap Nominatim API for reverse geocoding
- Shows street names and neighborhood information
- Helps users identify their exact location

### 5. Theme System
- Light and dark mode support
- Persistent theme selection (localStorage)
- Smooth transitions between themes
- CSS variables for maintainability

### 6. Demo Mode
- Automatic fallback when API is unavailable
- Sample data for testing and demonstrations
- Realistic NYC bus route information

## API Integration

### NYC MTA Bus Time API

**Base URL**: `https://bustime.mta.info/api`

**Endpoints Used**:

1. **Stops for Location**
   - Endpoint: `/where/stops-for-location.json`
   - Purpose: Find nearby bus stops
   - Parameters: `lat`, `lon`, `latSpan`, `lonSpan`

2. **Stop Monitoring**
   - Endpoint: `/siri/stop-monitoring.json`
   - Purpose: Get real-time arrivals
   - Parameters: `MonitoringRef`, `MaximumStopVisits`

### OpenStreetMap Nominatim

**Base URL**: `https://nominatim.openstreetmap.org`

**Endpoint**: `/reverse`
- Purpose: Reverse geocoding (coordinates to address)
- Parameters: `lat`, `lon`, `zoom`, `format`

## State Management

The application uses a simple state object:

```javascript
state = {
    currentLocation: { lat, lon, accuracy },
    nearbyStops: [...],
    selectedStop: { id, name, ... },
    arrivals: [...],
    theme: 'light' | 'dark'
}
```

## Distance Calculation

Uses the Haversine formula to calculate great-circle distances:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
```

## Responsive Design

**Breakpoints**:
- Desktop: > 768px
- Mobile: ≤ 768px

**Mobile Optimizations**:
- Single column layout for stops
- Stacked arrival cards
- Full-width buttons
- Larger touch targets

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Required APIs**:
- Geolocation API
- Fetch API
- localStorage
- CSS Custom Properties

## Performance Considerations

1. **API Calls**: Throttled and cached where possible
2. **Auto-refresh**: Only refreshes active stop's arrivals
3. **DOM Updates**: Minimal re-renders using innerHTML
4. **CSS**: Hardware-accelerated transforms and transitions

## Future Enhancements

### Planned Features
- [ ] Supabase integration for favorites
- [ ] User authentication
- [ ] Saved stops and routes
- [ ] Push notifications
- [ ] Service alerts
- [ ] Subway integration
- [ ] Route planning
- [ ] Offline mode (Service Workers)

### Technical Improvements
- [ ] TypeScript conversion
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics

## Deployment

### GitHub Pages
The app is automatically deployed to GitHub Pages on push to `main` branch.

**Configuration**: `.github/workflows/pages.yml`

### Manual Deployment
1. Copy all files to web server root
2. Ensure HTTPS is enabled
3. Configure CORS if using custom domain

### Environment Variables
No environment variables required for basic functionality.

## Development

### Local Setup
```bash
# Clone repository
git clone https://github.com/filmpain/Seek.git
cd Seek

# Start local server (choose one)
python -m http.server 8000
# or
npx serve
# or
php -S localhost:8000

# Open browser
open http://localhost:8000
```

### Testing
- Manual testing in multiple browsers
- Mobile device testing (real devices or emulators)
- Geolocation testing in different locations
- API error handling testing

## Security

### API Key Management
- MTA API key is designed for client-side use
- Public transit data only (no sensitive information)
- Rate limiting handled by MTA

### Data Privacy
- No user data collected or stored
- Location data never sent to third parties
- Only used for finding nearby stops
- Theme preference stored in localStorage only

### HTTPS
- All external API calls use HTTPS
- Required for Geolocation API to work

## Troubleshooting

### Location Not Working
1. Check browser location permissions
2. Ensure HTTPS connection
3. Verify Geolocation API support

### API Not Responding
- Check network connectivity
- Verify API key is valid
- Demo mode activates automatically

### Theme Not Persisting
- Check browser localStorage support
- Clear cache and try again

## License

MIT License - Free to use and modify

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues first
- Provide browser and OS information
