// OpenWeather API configuration
// Replace the value below with your own API key.

const API_KEY = "YOUR_OPENWEATHER_API_KEY";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Fetch current weather and 5-day forecast.
 */
export async function fetchWeatherData(city, units = "metric") {

    if (!API_KEY || API_KEY === "YOUR_OPENWEATHER_API_KEY") {
        throw new Error(
            "Please add your OpenWeather API key inside js/api.js"
        );
    }

    const weatherUrl =
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}` +
        `&appid=${API_KEY}&units=${units}`;

    const forecastUrl =
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}` +
        `&appid=${API_KEY}&units=${units}`;

    const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
    ]);

    if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
            throw new Error("City not found. Please enter a valid city.");
        }

        if (weatherResponse.status === 401) {
            throw new Error("Invalid API key. Please check your OpenWeather API key.");
        }

        throw new Error("Unable to fetch current weather.");
    }

    if (!forecastResponse.ok) {
        throw new Error("Unable to fetch forecast data.");
    }

    const currentData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    return {
        current: currentData,
        forecast: processForecast(forecastData)
    };
}

/**
 * Convert the 3-hour forecast response
 * into one forecast item for each day.
 */
function processForecast(data) {

    const dailyData = {};

    data.list.forEach(item => {

        const date = new Date(item.dt * 1000)
            .toISOString()
            .split("T")[0];

        if (!dailyData[date]) {
            dailyData[date] = [];
        }

        dailyData[date].push(item);
    });

    return Object.entries(dailyData)
        .slice(0, 5)
        .map(([date, items]) => {

            const preferredItem =
                items.find(item =>
                    item.dt_txt.includes("12:00:00")
                ) || items[Math.floor(items.length / 2)];

            return {
                date,
                temperature: preferredItem.main.temp,
                description: preferredItem.weather[0].description,
                icon: preferredItem.weather[0].icon
            };

        });
}
