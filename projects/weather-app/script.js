// Weather App Demo Script
class WeatherApp {
    constructor() {
        this.currentUnit = 'metric';
        this.sampleCities = [
            { name: 'Lagos', temp: 28, condition: 'Sunny', humidity: 65, wind: 12 },
            { name: 'London', temp: 12, condition: 'Cloudy', humidity: 78, wind: 18 },
            { name: 'New York', temp: 18, condition: 'Partly Cloudy', humidity: 65, wind: 14 },
            { name: 'Tokyo', temp: 22, condition: 'Clear', humidity: 60, wind: 10 },
            { name: 'Dubai', temp: 35, condition: 'Sunny', humidity: 40, wind: 8 },
            { name: 'Sydney', temp: 20, condition: 'Rainy', humidity: 75, wind: 20 }
        ];
        
        this.weatherIcons = {
            'Sunny': 'wi-day-sunny',
            'Cloudy': 'wi-cloudy',
            'Partly Cloudy': 'wi-day-cloudy',
            'Clear': 'wi-day-sunny',
            'Rainy': 'wi-rain',
            'Snow': 'wi-snow',
            'Thunderstorm': 'wi-thunderstorm',
            'Fog': 'wi-fog'
        };
        
        this.init();
    }
    
    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadSampleData();
        this.updateDateTime();
        this.generateHourlyForecast();
        this.generateWeeklyForecast();
        
        // Start auto-refresh for demo
        this.startAutoRefresh();
        
        console.log('🌤️ Weather App Demo Initialized');
        console.log('📍 Sample cities loaded:', this.sampleCities.length);
    }
    
    initializeElements() {
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            currentLocationBtn: document.getElementById('currentLocationBtn'),
            temperature: document.getElementById('temperature'),
            weatherDescription: document.getElementById('weatherDescription'),
            location: document.getElementById('location'),
            dateTime: document.getElementById('dateTime'),
            windSpeed: document.getElementById('windSpeed'),
            humidity: document.getElementById('humidity'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            weatherIcon: document.getElementById('weatherIcon'),
            weatherTable: document.getElementById('weatherTable'),
            refreshData: document.getElementById('refreshData'),
            addCity: document.getElementById('addCity'),
            unitButtons: document.querySelectorAll('.unit-btn'),
            hourlyForecast: document.getElementById('hourlyForecast'),
            weeklyForecast: document.getElementById('weeklyForecast')
        };
    }
    
    setupEventListeners() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.searchWeather());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        // Current location (demo)
        this.elements.currentLocationBtn.addEventListener('click', () => {
            this.showNotification('📍 Location access would be requested in a real app');
            this.updateWeather('Lagos'); // Default to Lagos for demo
        });
        
        // Unit toggle
        this.elements.unitButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleUnit(e));
        });
        
        // Table controls
        this.elements.refreshData.addEventListener('click', () => this.refreshWeatherData());
        this.elements.addCity.addEventListener('click', () => this.addCityToTable());
    }
    
    searchWeather() {
        const city = this.elements.cityInput.value.trim();
        if (!city) {
            this.showNotification('Please enter a city name', 'warning');
            return;
        }
        
        // For demo, check if city exists in sample data
        const foundCity = this.sampleCities.find(c => 
            c.name.toLowerCase() === city.toLowerCase()
        );
        
        if (foundCity) {
            this.updateWeather(foundCity.name);
            this.showNotification(`Weather updated for ${foundCity.name}`, 'success');
        } else {
            // Add new city for demo
            this.addNewCity(city);
            this.showNotification(`Added ${city} to demo data`, 'info');
        }
    }
    
    updateWeather(cityName) {
        const city = this.sampleCities.find(c => c.name === cityName) || this.sampleCities[0];
        
        // Update main weather display
        this.elements.temperature.textContent = `${city.temp}°${this.currentUnit === 'metric' ? 'C' : 'F'}`;
        this.elements.weatherDescription.textContent = city.condition;
        this.elements.location.textContent = `${city.name}`;
        this.elements.windSpeed.textContent = `${city.wind} ${this.currentUnit === 'metric' ? 'km/h' : 'mph'}`;
        this.elements.humidity.textContent = `${city.humidity}%`;
        this.elements.pressure.textContent = '1013 hPa';
        this.elements.visibility.textContent = '10 km';
        
        // Update weather icon
        const iconClass = this.weatherIcons[city.condition] || 'wi-day-sunny';
        this.elements.weatherIcon.innerHTML = `<i class="wi ${iconClass}"></i>`;
        
        // Update input field
        this.elements.cityInput.value = city.name;
    }
    
    toggleUnit(event) {
        const unit = event.target.dataset.unit;
        this.currentUnit = unit;
        
        // Update active button
        this.elements.unitButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === unit);
        });
        
        // Convert temperatures
        this.convertTemperatures();
        this.showNotification(`Switched to ${unit === 'metric' ? 'Celsius' : 'Fahrenheit'}`, 'info');
    }
    
    convertTemperatures() {
        // Convert current temperature
        const currentTemp = parseInt(this.elements.temperature.textContent);
        const convertedTemp = this.currentUnit === 'metric' 
            ? Math.round((currentTemp - 32) * 5/9)
            : Math.round((currentTemp * 9/5) + 32);
        
        this.elements.temperature.textContent = `${convertedTemp}°${this.currentUnit === 'metric' ? 'C' : 'F'}`;
        
        // Convert wind speed
        const currentWind = parseInt(this.elements.windSpeed.textContent);
        const convertedWind = this.currentUnit === 'metric'
            ? Math.round(currentWind * 1.60934)
            : Math.round(currentWind / 1.60934);
        
        this.elements.windSpeed.textContent = `${convertedWind} ${this.currentUnit === 'metric' ? 'km/h' : 'mph'}`;
    }
    
    loadSampleData() {
        this.updateWeatherTable();
        this.updateWeather('Lagos'); // Default city
    }
    
    updateWeatherTable() {
        const tableBody = this.elements.weatherTable;
        tableBody.innerHTML = '';
        
        this.sampleCities.forEach(city => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-city"></i>
                        <span>${city.name}</span>
                    </div>
                </td>
                <td>
                    <span style="font-weight: 600; color: #3b82f6;">
                        ${city.temp}°${this.currentUnit === 'metric' ? 'C' : 'F'}
                    </span>
                </td>
                <td>
                    <div class="weather-condition">
                        <i class="wi ${this.weatherIcons[city.condition] || 'wi-day-sunny'}"></i>
                        <span>${city.condition}</span>
                    </div>
                </td>
                <td>${city.humidity}%</td>
                <td>${city.wind} ${this.currentUnit === 'metric' ? 'km/h' : 'mph'}</td>
            `;
            
            row.addEventListener('click', () => {
                this.updateWeather(city.name);
                this.showNotification(`Switched to ${city.name}`, 'success');
            });
            
            tableBody.appendChild(row);
        });
    }
    
    addNewCity(cityName) {
        const newCity = {
            name: cityName,
            temp: Math.floor(Math.random() * 30) + 10,
            condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 40) + 40,
            wind: Math.floor(Math.random() * 15) + 5
        };
        
        this.sampleCities.push(newCity);
        this.updateWeatherTable();
        this.updateWeather(cityName);
    }
    
    refreshWeatherData() {
        // Simulate data refresh
        this.sampleCities.forEach(city => {
            // Add small random variations for realism
            city.temp += Math.floor(Math.random() * 3) - 1;
            city.humidity += Math.floor(Math.random() * 5) - 2;
            city.wind += Math.floor(Math.random() * 3) - 1;
            
            // Ensure values stay within reasonable ranges
            city.temp = Math.max(0, Math.min(40, city.temp));
            city.humidity = Math.max(30, Math.min(90, city.humidity));
            city.wind = Math.max(5, Math.min(30, city.wind));
        });
        
        this.updateWeatherTable();
        this.updateWeather(this.elements.cityInput.value || 'Lagos');
        this.showNotification('Weather data refreshed', 'success');
    }
    
    addCityToTable() {
        const cityName = prompt('Enter a city name to add to the demo:');
        if (cityName && cityName.trim()) {
            this.addNewCity(cityName.trim());
            this.showNotification(`Added ${cityName} to demo data`, 'success');
        }
    }
    
    generateHourlyForecast() {
        const hours = ['Now', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'];
        const container = this.elements.hourlyForecast;
        container.innerHTML = '';
        
        hours.forEach((hour, index) => {
            const temp = 24 + Math.floor(Math.random() * 6) - 3;
            const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy'];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const icon = this.weatherIcons[condition];
            
            const hourElement = document.createElement('div');
            hourElement.className = 'hourly-item';
            hourElement.innerHTML = `
                <div class="hourly-time">${hour}</div>
                <div class="hourly-icon">
                    <i class="wi ${icon}"></i>
                </div>
                <div class="hourly-temp">${temp}°</div>
                <div class="hourly-condition" style="font-size: 0.8rem; color: #64748b; margin-top: 5px;">
                    ${condition}
                </div>
            `;
            
            container.appendChild(hourElement);
        });
    }
    
    generateWeeklyForecast() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const container = this.elements.weeklyForecast;
        container.innerHTML = '';
        
        days.forEach((day, index) => {
            const highTemp = 24 + Math.floor(Math.random() * 6);
            const lowTemp = highTemp - 5 - Math.floor(Math.random() * 3);
            const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const icon = this.weatherIcons[condition];
            
            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';
            dayElement.innerHTML = `
                <div class="day-name">${day}</div>
                <div class="day-date">Dec ${15 + index}</div>
                <div class="day-icon">
                    <i class="wi ${icon}"></i>
                </div>
                <div class="day-temp">${highTemp}° / ${lowTemp}°</div>
                <div class="day-description">${condition}</div>
            `;
            
            container.appendChild(dayElement);
        });
    }
    
    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        this.elements.dateTime.textContent = now.toLocaleDateString('en-US', options);
        
        // Update every minute
        setTimeout(() => this.updateDateTime(), 60000);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `weather-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Add CSS for animations
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    startAutoRefresh() {
        // Auto-refresh weather data every 30 seconds for demo
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshWeatherData();
            }
        }, 30000);
    }
}

// Initialize Weather App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const weatherApp = new WeatherApp();
    
    // Make app globally available for debugging
    window.weatherApp = weatherApp;
    
    console.log(`
    🌤️ WEATHER APP DEMO
    ====================
    Features Available:
    1. Search for cities
    2. Toggle between °C and °F
    3. View hourly forecast
    4. View 5-day forecast
    5. Interactive data table
    6. Auto-refresh every 30 seconds
    ====================
    Note: This is a demo with simulated data.
    Real API integration would require an API key.
    `);
});

// Utility functions for weather data simulation
const WeatherUtils = {
    // Convert temperature between units
    convertTemperature(temp, fromUnit, toUnit) {
        if (fromUnit === toUnit) return temp;
        
        if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
            return (temp * 9/5) + 32;
        } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
            return (temp - 32) * 5/9;
        }
        return temp;
    },
    
    // Get weather icon based on condition
    getWeatherIcon(condition) {
        const icons = {
            'clear': 'wi-day-sunny',
            'clouds': 'wi-cloudy',
            'rain': 'wi-rain',
            'snow': 'wi-snow',
            'thunderstorm': 'wi-thunderstorm',
            'drizzle': 'wi-rain',
            'mist': 'wi-fog',
            'smoke': 'wi-smoke',
            'haze': 'wi-day-haze',
            'dust': 'wi-dust',
            'fog': 'wi-fog',
            'sand': 'wi-sandstorm',
            'ash': 'wi-volcano',
            'squall': 'wi-strong-wind',
            'tornado': 'wi-tornado'
        };
        
        return icons[condition.toLowerCase()] || 'wi-day-sunny';
    },
    
    // Simulate realistic weather data
    simulateWeatherData(city) {
        const baseTemp = {
            'Lagos': 28, 'London': 12, 'New York': 18, 
            'Tokyo': 22, 'Dubai': 35, 'Sydney': 20
        }[city] || 20;
        
        const hour = new Date().getHours();
        const tempVariation = Math.sin((hour - 14) * Math.PI / 12) * 5;
        
        return {
            temp: Math.round(baseTemp + tempVariation),
            humidity: Math.floor(Math.random() * 30) + 50,
            wind: Math.floor(Math.random() * 10) + 5,
            condition: ['Sunny', 'Cloudy', 'Partly Cloudy'][Math.floor(Math.random() * 3)]
        };
    }
};