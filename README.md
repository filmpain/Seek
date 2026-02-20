# Seek 🚌

Find the closest transit option - Real-time NYC transit tracking

## Features

- 🌍 **GPS Location Tracking** - Automatically detects your current location
- 🚏 **Nearby Bus Stops** - Shows the closest NYC bus stops with distances
- 🚇 **Nearby Subway Stations** - Shows the closest NYC subway stations with lines served
- 🚶 **Walking Time Estimates** - Estimated walk time to nearby subway stations
- ⏰ **Real-time Arrivals** - Live bus arrival times and subway headway schedules
- 📍 **Cross Streets** - Display your current cross streets
- 🌓 **Light & Dark Mode** - Seamless theme switching
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Auto-refresh** - Updates arrival times every 30 seconds
- ⭐ **Favorite Stops** - Save your favorite stops for quick access
- 💾 **Supabase Backend** - Cloud storage for favorites (with localStorage fallback)

## Live Demo

Visit the live app: [https://filmpain.github.io/Seek/](https://filmpain.github.io/Seek/)

## Technologies

- **NYC MTA Bus Time API** - Real-time bus transit data
- **NYC Subway Station Data** - Static GTFS-based subway station coordinates and lines
- **Geolocation API** - Precise location tracking
- **OpenStreetMap Nominatim** - Reverse geocoding for cross streets
- **Supabase** - Backend database for favorites and preferences
- **Vanilla JavaScript** - No framework dependencies
- **CSS Variables** - Smooth theme transitions
- **GitHub Pages** - Static site hosting

## API Information

This app uses the NYC MTA Bus Time API for real-time transit data.

### API Endpoints Used:
- `stops-for-location` - Find nearby bus stops
- `stop-monitoring` - Get real-time arrival predictions

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/filmpain/Seek.git
cd Seek
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

3. Visit `http://localhost:8000`

## Usage

1. **Allow Location Access** - Grant permission when prompted
2. **View Nearby Stops** - See bus stops sorted by distance
3. **Select a Stop** - Click any stop to see upcoming arrivals
4. **Check Arrival Times** - See when buses will arrive in minutes
5. **Save Favorites** - Click the star (☆) on any stop to save it
6. **View Favorites** - Click "⭐ Favorites" to see your saved stops
7. **Toggle Theme** - Click the moon/sun icon for dark/light mode
8. **Refresh** - Click refresh to update your location

## Supabase Setup (Optional)

The app works without Supabase using localStorage. To enable cloud storage:

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL schema from `SUPABASE_SCHEMA.md`
3. Update `app.js` with your Supabase URL and anon key

See `SUPABASE_SCHEMA.md` for detailed setup instructions.

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers with GPS

## Deployment

This site is automatically deployed to GitHub Pages using GitHub Actions.

**Live Site:** [https://filmpain.github.io/Seek/](https://filmpain.github.io/Seek/)

### GitHub Pages Configuration

To enable deployment:

1. Go to repository **Settings** → **Pages**
2. Under "Build and deployment" → **Source**
3. Select **"GitHub Actions"**
4. Save the settings

The workflow automatically deploys on every push to the `main` branch.

## License

MIT License - Feel free to use and modify

