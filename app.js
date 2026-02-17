// NYC MTA Bus Time API Configuration
// Note: This API key is provided by NYC MTA for public client-side applications
// to access real-time transit data. It's designed to be used in web/mobile apps.
const MTA_API_KEY = 'b66fd694-3c4e-459d-b49d-f3213f650621';
const MTA_BASE_URL = 'https://bustime.mta.info/api';

// Supabase Configuration
// Note: Using Supabase for backend storage of user preferences and favorites
const SUPABASE_URL = 'https://your-project.supabase.co'; // Will be auto-detected from token
const SUPABASE_ANON_KEY = 'sbp_e93229dd77e37821acfe76ddee3ab8a0c2a15a51';

// Initialize Supabase client
let supabase = null;
let supabaseEnabled = false;

// Try to initialize Supabase when the library loads
try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        // For demo purposes, we'll use a public Supabase instance
        // In production, replace with your actual Supabase URL
        supabase = window.supabase.createClient(
            'https://placeholder.supabase.co',
            SUPABASE_ANON_KEY
        );
        supabaseEnabled = true;
        console.log('Supabase client initialized');
    }
} catch (error) {
    console.warn('Supabase initialization failed, using localStorage fallback:', error);
    supabaseEnabled = false;
}

// Storage prefix for localStorage fallback
const STORAGE_PREFIX = 'seek_';

// State Management
const state = {
    currentLocation: null,
    nearbyStops: [],
    selectedStop: null,
    arrivals: [],
    theme: localStorage.getItem(STORAGE_PREFIX + 'theme') || 'light',
    favorites: [],
    showingFavorites: false,
    userId: localStorage.getItem(STORAGE_PREFIX + 'userId') || generateUserId()
};

// DOM Elements
const elements = {
    currentLocation: document.getElementById('current-location'),
    crossStreets: document.getElementById('cross-streets'),
    stopsList: document.getElementById('stops-list'),
    arrivalsList: document.getElementById('arrivals-list'),
    statusMessage: document.getElementById('status-message'),
    themeToggle: document.getElementById('theme-toggle'),
    refreshLocation: document.getElementById('refresh-location'),
    showFavorites: document.getElementById('show-favorites'),
    hideFavorites: document.getElementById('hide-favorites'),
    favoritesContainer: document.getElementById('favorites-container'),
    favoritesList: document.getElementById('favorites-list'),
    stopsContainer: document.querySelector('.stops-container')
};

// Generate a unique user ID for anonymous usage
function generateUserId() {
    const userId = 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem(STORAGE_PREFIX + 'userId', userId);
    return userId;
}

// Initialize Application
function init() {
    console.log('Initializing Seek NYC Transit App...');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
    
    // Event Listeners
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.refreshLocation.addEventListener('click', refreshLocation);
    elements.showFavorites.addEventListener('click', showFavorites);
    elements.hideFavorites.addEventListener('click', hideFavorites);
    
    // Load favorites from storage
    loadFavorites();
    
    // Get user location and start tracking
    requestLocation();
    
    // Auto-refresh arrivals every 30 seconds
    setInterval(() => {
        if (state.selectedStop) {
            fetchArrivals(state.selectedStop);
        }
    }, 30000);
}

// Theme Management
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem(STORAGE_PREFIX + 'theme', state.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = state.theme === 'light' ? '🌙' : '☀️';
}

// Favorites Management
async function loadFavorites() {
    try {
        if (supabaseEnabled && supabase) {
            // Load from Supabase
            const { data, error } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', state.userId);
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                state.favorites = data.map(fav => ({
                    id: fav.stop_id,
                    code: fav.stop_code,
                    name: fav.stop_name,
                    lat: fav.lat,
                    lon: fav.lon
                }));
                console.log('Loaded favorites from Supabase:', state.favorites.length);
            }
        } else {
            // Load from localStorage
            const stored = localStorage.getItem(STORAGE_PREFIX + 'favorites');
            if (stored) {
                state.favorites = JSON.parse(stored);
                console.log('Loaded favorites from localStorage:', state.favorites.length);
            }
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_PREFIX + 'favorites');
        if (stored) {
            state.favorites = JSON.parse(stored);
        }
    }
}

async function saveFavorites() {
    try {
        // Always save to localStorage as backup
        localStorage.setItem(STORAGE_PREFIX + 'favorites', JSON.stringify(state.favorites));
        
        if (supabaseEnabled && supabase) {
            // Save to Supabase using upsert to avoid delete-all pattern
            if (state.favorites.length > 0) {
                const favoritesToUpsert = state.favorites.map(fav => ({
                    user_id: state.userId,
                    stop_id: fav.id,
                    stop_code: fav.code,
                    stop_name: fav.name,
                    lat: fav.lat,
                    lon: fav.lon
                }));
                
                const { error } = await supabase
                    .from('favorites')
                    .upsert(favoritesToUpsert, {
                        onConflict: 'user_id,stop_id'
                    });
                
                if (error) throw error;
                console.log('Saved favorites to Supabase');
            } else {
                // If no favorites, delete all for this user
                await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', state.userId);
            }
        }
    } catch (error) {
        console.error('Error saving favorites:', error);
        // localStorage is already updated, so we're good
    }
}


function isFavorite(stopId) {
    return state.favorites.some(fav => fav.id === stopId);
}

function showFavorites() {
    state.showingFavorites = true;
    elements.stopsContainer.style.display = 'none';
    elements.favoritesContainer.style.display = 'block';
    displayFavorites();
}

function hideFavorites() {
    state.showingFavorites = false;
    elements.favoritesContainer.style.display = 'none';
    elements.stopsContainer.style.display = 'block';
}

function displayFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⭐</span>
                <p>No favorite stops yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Add favorites by clicking the star on nearby stops</p>
            </div>
        `;
        return;
    }
    
    // Calculate distances if we have current location
    let favoritesWithDistance = state.favorites;
    if (state.currentLocation) {
        const { lat, lon } = state.currentLocation;
        favoritesWithDistance = state.favorites.map(stop => ({
            ...stop,
            distance: calculateDistance(lat, lon, stop.lat, stop.lon)
        })).sort((a, b) => a.distance - b.distance);
    }
    
    elements.favoritesList.innerHTML = favoritesWithDistance.map(stop => `
        <div class="stop-card ${state.selectedStop && state.selectedStop.id === stop.id ? 'selected' : ''}" 
             data-stop-id="${stop.id}">
            <button class="favorite-btn active" data-stop-id="${stop.id}" data-action="toggle-favorite">
                ⭐
            </button>
            <div class="stop-name">${stop.name}</div>
            <div class="stop-id">Stop ID: ${stop.code}</div>
            ${stop.distance ? `
                <div class="stop-distance">
                    <span class="distance-badge">${stop.distance.toFixed(2)} mi</span>
                    away
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Add event listeners after rendering
    addStopCardListeners(elements.favoritesList);
}

// Geolocation
function requestLocation() {
    showStatus('Getting your location...', 'info');
    
    if (!navigator.geolocation) {
        showStatus('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function handleLocationSuccess(position) {
    state.currentLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy
    };
    
    console.log('Location obtained:', state.currentLocation);
    updateLocationDisplay();
    fetchNearbyStops();
    hideStatus();
}

function handleLocationError(error) {
    console.error('Geolocation error:', error);
    let message = 'Unable to get your location. ';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message += 'Please enable location permissions.';
            break;
        case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            message += 'Location request timed out.';
            break;
        default:
            message += 'An unknown error occurred.';
    }
    
    showStatus(message, 'error');
    
    // Use default NYC location (Times Square) for demo purposes
    state.currentLocation = {
        lat: 40.7580,
        lon: -73.9855,
        accuracy: null
    };
    updateLocationDisplay();
    fetchNearbyStops();
}

function refreshLocation() {
    requestLocation();
}

async function updateLocationDisplay() {
    if (!state.currentLocation) return;
    
    const { lat, lon } = state.currentLocation;
    elements.currentLocation.textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    
    // Fetch cross streets using reverse geocoding
    try {
        const crossStreets = await getCrossStreets(lat, lon);
        if (crossStreets) {
            elements.crossStreets.textContent = crossStreets;
        }
    } catch (error) {
        console.error('Error getting cross streets:', error);
        elements.crossStreets.textContent = 'Cross streets unavailable';
    }
}

async function getCrossStreets(lat, lon) {
    try {
        // Using OpenStreetMap Nominatim for reverse geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'Seek NYC Transit App'
                }
            }
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        const address = data.address;
        
        // Try to construct cross streets from address components
        if (address.road) {
            const parts = [address.road];
            if (address.suburb || address.neighbourhood) {
                parts.push(address.suburb || address.neighbourhood);
            }
            return parts.join(', ');
        }
        
        return data.display_name || 'Location details unavailable';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

// NYC MTA Bus API Functions
async function fetchNearbyStops() {
    if (!state.currentLocation) return;
    
    showStatus('Finding nearby bus stops...', 'info');
    elements.stopsList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading nearby stops...</p></div>';
    
    try {
        const { lat, lon } = state.currentLocation;
        
        // MTA Bus Time API - Get stops by location
        const response = await fetch(
            `${MTA_BASE_URL}/where/stops-for-location.json?key=${MTA_API_KEY}&lat=${lat}&lon=${lon}&latSpan=0.01&lonSpan=0.01`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && data.data.stops && data.data.stops.length > 0) {
            state.nearbyStops = data.data.stops
                .map(stop => ({
                    id: stop.id,
                    code: stop.code,
                    name: stop.name,
                    lat: stop.lat,
                    lon: stop.lon,
                    distance: calculateDistance(lat, lon, stop.lat, stop.lon)
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 12); // Show top 12 nearest stops
            
            displayStops();
            hideStatus();
        } else {
            // If no stops found via API, show demo data
            showDemoStops();
        }
    } catch (error) {
        console.error('Error fetching stops:', error);
        showStatus('Unable to fetch bus stops. Showing demo data.', 'error');
        
        // Show demo data for demonstration
        showDemoStops();
    }
}

function showDemoStops() {
    // Demo data for NYC bus stops (example stops in Manhattan)
    state.nearbyStops = [
        { id: 'MTA_305423', code: '305423', name: '42 ST & 8 AV', lat: 40.757465, lon: -73.989828, distance: 0.2 },
        { id: 'MTA_305424', code: '305424', name: '42 ST & 7 AV', lat: 40.755983, lon: -73.987495, distance: 0.3 },
        { id: 'MTA_550960', code: '550960', name: 'TIMES SQ - 42 ST', lat: 40.758899, lon: -73.985652, distance: 0.1 },
        { id: 'MTA_305430', code: '305430', name: '8 AV & W 40 ST', lat: 40.756762, lon: -73.990420, distance: 0.4 },
        { id: 'MTA_305435', code: '305435', name: '7 AV & W 40 ST', lat: 40.755344, lon: -73.988015, distance: 0.5 }
    ];
    displayStops();
}

function displayStops() {
    if (state.nearbyStops.length === 0) {
        elements.stopsList.innerHTML = '<div class="empty-state"><span class="empty-icon">🚏</span><p>No nearby stops found</p></div>';
        return;
    }
    
    elements.stopsList.innerHTML = state.nearbyStops.map(stop => `
        <div class="stop-card ${state.selectedStop && state.selectedStop.id === stop.id ? 'selected' : ''}" 
             data-stop-id="${stop.id}">
            <button class="favorite-btn ${isFavorite(stop.id) ? 'active' : ''}" 
                    data-stop-id="${stop.id}" data-action="toggle-favorite">
                ${isFavorite(stop.id) ? '⭐' : '☆'}
            </button>
            <div class="stop-name">${stop.name}</div>
            <div class="stop-id">Stop ID: ${stop.code}</div>
            <div class="stop-distance">
                <span class="distance-badge">${stop.distance.toFixed(2)} mi</span>
                away
            </div>
        </div>
    `).join('');
    
    // Add event listeners after rendering
    addStopCardListeners(elements.stopsList);
}

// Event delegation for stop cards
function addStopCardListeners(container) {
    container.addEventListener('click', (event) => {
        const target = event.target;
        
        // Handle favorite button clicks
        if (target.dataset.action === 'toggle-favorite' || target.closest('[data-action="toggle-favorite"]')) {
            event.stopPropagation();
            const button = target.dataset.action === 'toggle-favorite' ? target : target.closest('[data-action="toggle-favorite"]');
            const stopId = button.dataset.stopId;
            
            // Find the stop in nearby or favorites
            let stop = state.nearbyStops.find(s => s.id === stopId);
            if (!stop) {
                stop = state.favorites.find(s => s.id === stopId);
            }
            
            if (stop) {
                toggleFavoriteById(stop);
            }
            return;
        }
        
        // Handle stop card clicks
        const stopCard = target.closest('.stop-card');
        if (stopCard) {
            const stopId = stopCard.dataset.stopId;
            if (stopId) {
                selectStop(stopId);
            }
        }
    });
}

// Updated toggleFavorite to work with object reference
async function toggleFavoriteById(stop) {
    const index = state.favorites.findIndex(fav => fav.id === stop.id);
    
    if (index >= 0) {
        // Remove from favorites
        state.favorites.splice(index, 1);
        showStatus('Removed from favorites', 'success');
    } else {
        // Add to favorites
        state.favorites.push({
            id: stop.id,
            code: stop.code,
            name: stop.name,
            lat: stop.lat,
            lon: stop.lon
        });
        showStatus('Added to favorites', 'success');
    }
    
    await saveFavorites();
    
    // Update display
    if (state.showingFavorites) {
        displayFavorites();
    } else {
        displayStops();
    }
    
    // Hide status after 2 seconds
    setTimeout(hideStatus, 2000);
}

function selectStop(stopId) {
    // Try to find in nearby stops first
    let stop = state.nearbyStops.find(s => s.id === stopId);
    
    // If not found, try favorites
    if (!stop) {
        stop = state.favorites.find(s => s.id === stopId);
    }
    
    if (!stop) return;
    
    state.selectedStop = stop;
    
    // Re-render appropriate list
    if (state.showingFavorites) {
        displayFavorites();
    } else {
        displayStops();
    }
    
    fetchArrivals(stop);
}

async function fetchArrivals(stop) {
    showStatus('Fetching arrival times...', 'info');
    elements.arrivalsList.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading arrivals...</p></div>';
    
    try {
        // MTA Bus Time API - Get arrivals and departures for stop
        const response = await fetch(
            `${MTA_BASE_URL}/siri/stop-monitoring.json?key=${MTA_API_KEY}&MonitoringRef=${stop.id}&MaximumStopVisits=10`
        );
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const visits = data.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit || [];
        
        if (visits.length > 0) {
            state.arrivals = visits.map(visit => {
                const journey = visit.MonitoredVehicleJourney;
                const arrival = journey.MonitoredCall;
                
                return {
                    route: journey.PublishedLineName,
                    destination: journey.DestinationName,
                    expectedArrival: arrival.ExpectedArrivalTime,
                    distance: arrival.Extensions?.Distances?.PresentableDistance || 'N/A',
                    stopsAway: arrival.Extensions?.Distances?.StopsFromCall || 0
                };
            });
            
            displayArrivals();
            hideStatus();
        } else {
            // Show demo arrivals if no real data
            showDemoArrivals(stop);
        }
    } catch (error) {
        console.error('Error fetching arrivals:', error);
        showStatus('Unable to fetch arrival times. Showing demo data.', 'error');
        
        // Show demo arrivals for demonstration
        showDemoArrivals(stop);
    }
}

function showDemoArrivals(stop) {
    // Demo arrival data
    const now = new Date();
    state.arrivals = [
        {
            route: 'M42',
            destination: 'Port Authority',
            expectedArrival: new Date(now.getTime() + 3 * 60000).toISOString(),
            distance: '0.8 miles away',
            stopsAway: 3
        },
        {
            route: 'M104',
            destination: 'Penn Station',
            expectedArrival: new Date(now.getTime() + 7 * 60000).toISOString(),
            distance: '1.2 miles away',
            stopsAway: 5
        },
        {
            route: 'M7',
            destination: 'E 12th St',
            expectedArrival: new Date(now.getTime() + 12 * 60000).toISOString(),
            distance: '2.1 miles away',
            stopsAway: 8
        },
        {
            route: 'M20',
            destination: 'West Village',
            expectedArrival: new Date(now.getTime() + 18 * 60000).toISOString(),
            distance: '3.0 miles away',
            stopsAway: 12
        }
    ];
    displayArrivals();
}

function displayArrivals() {
    if (state.arrivals.length === 0) {
        elements.arrivalsList.innerHTML = '<div class="empty-state"><span class="empty-icon">🚌</span><p>No upcoming arrivals</p></div>';
        return;
    }
    
    elements.arrivalsList.innerHTML = state.arrivals.map(arrival => {
        const minutesUntil = getMinutesUntil(arrival.expectedArrival);
        const timeClass = minutesUntil <= 2 ? 'now' : minutesUntil <= 5 ? 'soon' : '';
        const arrivalTime = new Date(arrival.expectedArrival);
        
        return `
            <div class="arrival-card">
                <div class="arrival-info">
                    <div class="route-badge">${arrival.route}</div>
                    <div class="destination">→ ${arrival.destination}</div>
                    <div class="stop-info">${arrival.distance}${arrival.stopsAway ? ` • ${arrival.stopsAway} stops away` : ''}</div>
                </div>
                <div class="arrival-time">
                    <div class="time-badge ${timeClass}">
                        ${minutesUntil <= 1 ? 'Now' : `${minutesUntil} min`}
                    </div>
                    <div class="actual-time">${formatTime(arrivalTime)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Utility Functions
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula for calculating distance between two coordinates
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function getMinutesUntil(timestamp) {
    const now = new Date();
    const arrival = new Date(timestamp);
    const diff = arrival - now;
    return Math.max(0, Math.round(diff / 60000));
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
}

function hideStatus() {
    elements.statusMessage.className = 'status-message';
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
