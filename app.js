import { fetchWeatherData } from "./api.js";
import {
    savePreferences,
    loadPreferences
} from "./storage.js";

/* ================================
   DOM ELEMENTS
================================ */

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const unitSelect = document.getElementById("unitSelect");

const themeToggle = document.getElementById("themeToggle");

const loading = document.getElementById("loading");
const statusMessage = document.getElementById("statusMessage");

const weatherSection = document.getElementById("weatherSection");
const forecastSection = document.getElementById("forecastSection");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");

const temperature = document.getElementById("temperature");
const temperatureUnit = document.getElementById("temperatureUnit");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const cloudiness = document.getElementById("cloudiness");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const forecastGrid = document.getElementById("forecastGrid");
const lastUpdated = document.getElementById("lastUpdated");

const cityButtons = document.querySelectorAll(".city-button");

/* ================================
   STATE
================================ */

let preferences = loadPreferences();

/* ================================
   INITIALIZE
================================ */

initializeApp();

/**
 * Start application.
 */
async function initializeApp() {

    cityInput.value = preferences.defaultCity;
    unitSelect.value = preferences.units;

    applyTheme(preferences.theme);

    await loadWeather(preferences.defaultCity);
}

/* ================================
   SEARCH FORM
================================ */

searchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showStatus("Please enter a city name.", "error");
        return;
    }

    await loadWeather(city);
});

/* ================================
   QUICK CITY BUTTONS
================================ */

cityButtons.forEach(button => {

    button.addEventListener("click", async function () {

        const city = button.dataset.city;

        cityInput.value = city;

        await loadWeather(city);

    });

});

/* ================================
   UNIT CHANGE
================================ */

unitSelect.addEventListener("change", async function () {

    const city = cityInput.value.trim() || preferences.defaultCity;

    preferences.units = unitSelect.value;

    savePreferences(preferences);

    await loadWeather(city);

});

/* ================================
   WEATHER LOADING
================================ */

async function loadWeather(city) {

    showLoading(true);

    clearStatus();

    try {

        const data = await fetchWeatherData(
            city,
            preferences.units
        );

        displayCurrentWeather(data.current);

        displayForecast(data.forecast);

        preferences.defaultCity = data.current.name;

        preferences.units = unitSelect.value;

        savePreferences(preferences);

        weatherSection.classList.remove("hidden");
        forecastSection.classList.remove("hidden");

        showStatus(
            `Weather loaded for ${data.current.name}.`,
            "success"
        );

    } catch (error) {

        console.error("Weather Error:", error);

        weatherSection.classList.add("hidden");
        forecastSection.classList.add("hidden");

        showStatus(
            error.message || "Something went wrong.",
            "error"
        );

    } finally {

        showLoading(false);

    }

}

/* ================================
   DISPLAY CURRENT WEATHER
================================ */

function displayCurrentWeather(data) {

    const unitSymbol =
        preferences.units === "metric"
            ? "°C"
            : "°F";

    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    weatherDescription.textContent =
        data.weather[0].description;

    temperature.textContent =
        Math.round(data.main.temp);

    temperatureUnit.textContent =
        unitSymbol;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}${unitSymbol}`;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        preferences.units === "metric"
            ? `${data.wind.speed} m/s`
            : `${data.wind.speed} mph`;

    cloudiness.textContent =
        `${data.clouds.all}%`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    visibility.textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        `${data.weather[0].description} icon`;

    const updatedTime =
        new Date(data.dt * 1000);

    lastUpdated.textContent =
        `Updated: ${updatedTime.toLocaleTimeString()}`;
}

/* ================================
   DISPLAY FORECAST
================================ */

function displayForecast(forecast) {

    forecastGrid.innerHTML = "";

    const unitSymbol =
        preferences.units === "metric"
            ? "°C"
            : "°F";

    forecast.forEach(day => {

        const dateObject =
            new Date(`${day.date}T12:00:00`);

        const dayName =
            dateObject.toLocaleDateString(
                undefined,
                { weekday: "short" }
            );

        const formattedDate =
            dateObject.toLocaleDateString(
                undefined,
                {
                    day: "numeric",
                    month: "short"
                }
            );

        const card =
            document.createElement("article");

        card.className = "forecast-card";

        card.innerHTML = `
            <p class="forecast-card__day">
                ${dayName}
            </p>

            <p class="forecast-card__date">
                ${formattedDate}
            </p>

            <img
                src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                alt="${day.description}"
            >

            <p class="forecast-card__temp">
                ${Math.round(day.temperature)}${unitSymbol}
            </p>

            <p class="forecast-card__description">
                ${day.description}
            </p>
        `;

        forecastGrid.appendChild(card);

    });

}

/* ================================
   LOADING STATE
================================ */

function showLoading(show) {

    if (show) {

        loading.classList.remove("hidden");

    } else {

        loading.classList.add("hidden");

    }

}

/* ================================
   STATUS MESSAGE
================================ */

function showStatus(message, type) {

    statusMessage.textContent = message;

    statusMessage.className =
        `status-message ${type}`;

}

function clearStatus() {

    statusMessage.textContent = "";
    statusMessage.className = "status-message";

}

/* ================================
   THEME
================================ */

themeToggle.addEventListener("click", function () {

    const darkMode =
        !document.body.classList.contains("dark-theme");

    preferences.theme =
        darkMode ? "dark" : "light";

    savePreferences(preferences);

    applyTheme(preferences.theme);

});

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark-theme");
        themeToggle.textContent = "☀️";

    } else {

        document.body.classList.remove("dark-theme");
        themeToggle.textContent = "🌙";

    }

}