# Seek 🚌

Find the closest transit option - Real-time NYC bus tracking

## Features

- 🌍 **GPS Location Tracking** - Automatically detects your current location
- 🚏 **Nearby Bus Stops** - Shows the closest NYC bus stops with distances
- ⏰ **Real-time Arrivals** - Live arrival times in minutes
- 📍 **Cross Streets** - Display your current cross streets
- 🌓 **Light & Dark Mode** - Seamless theme switching
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Auto-refresh** - Updates arrival times every 30 seconds

## Live Demo

Visit the live app: [https://filmpain.github.io/Seek/](https://filmpain.github.io/Seek/)

## Technologies

- **NYC MTA Bus Time API** - Real-time transit data
- **Geolocation API** - Precise location tracking
- **OpenStreetMap Nominatim** - Reverse geocoding for cross streets
- **Vanilla JavaScript** - No framework dependencies
- **CSS Variables** - Smooth theme transitions
- **GitHub Pages** - Static site hosting

## API Information

This app uses the NYC MTA Bus Time API with key: `b66fd694-3c4e-459d-b49d-f3213f650621`

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
5. **Toggle Theme** - Click the moon/sun icon for dark/light mode
6. **Refresh** - Click refresh to update your location

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers with GPS

## Future Enhancements

- [ ] Supabase integration for favorites and history
- [ ] Route planning
- [ ] Push notifications for selected arrivals
- [ ] Service alerts and delays
- [ ] Subway integration
- [ ] Offline support with service workers

## License

MIT License - Feel free to use and modify

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for NYC transit riders
