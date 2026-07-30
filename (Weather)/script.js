const apiKey = "APIKEY";

const zipInput = document.getElementById("zipInput");
const searchBtn = document.getElementById("searchBtn");
const errorMsg = document.getElementById("errorMsg");

const weatherCard = document.getElementById("weatherCard");
const locationName = document.getElementById("locationName");
const currentTemp = document.getElementById("currentTemp");
const weatherDesc = document.getElementById("weatherDesc");
const weatherIcon = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecastContainer");

searchBtn.addEventListener("click", () => {
    const zip = zipInput.value.trim();

    if (zip.length !== 5 || isNaN(zip)) {
        errorMsg.textContent = "Please enter a valid 5-digit ZIP code.";
        return;
    }

    errorMsg.textContent = "";
    getLatLon(zip);
});

async function getLatLon(zip) {
    try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${apiKey}`;

        const response = await fetch(geoUrl);

        if (!response.ok) {
            throw new Error("ZIP code not found. Try again.");
        }

        const data = await response.json();

        const lat = data.lat;
        const lon = data.lon;
        const city = data.name;

        getWeather(lat, lon, city);

    } catch (error) {
        weatherCard.classList.add("hidden");
        errorMsg.textContent = error.message;
    }
}

async function getWeather(lat, lon, city) {
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

        const response = await fetch(weatherUrl);

        if (!response.ok) {
            throw new Error("Weather data could not be retrieved.");
        }

        const data = await response.json();

        displayWeather(data, city);

    } catch (error) {
        weatherCard.classList.add("hidden");
        errorMsg.textContent = error.message;
    }
}

function displayWeather(data, city) {
    weatherCard.classList.remove("hidden");

    // current weather is first item in list
    const current = data.list[0];

    const temp = current.main.temp;
    const description = current.weather[0].description;
    const iconCode = current.weather[0].icon;

    locationName.textContent = `Weather in ${city}`;
    currentTemp.textContent = `Current Temp: ${temp.toFixed(1)}°F`;
    weatherDesc.textContent = `Condition: ${description}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    forecastContainer.innerHTML = "";

    // Forecast API gives weather every 3 hours
    // We will pick one forecast per day (every 8 entries = 24 hours)
    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i];

        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        const minTemp = day.main.temp_min;
        const maxTemp = day.main.temp_max;
        const icon = day.weather[0].icon;

        const dayCard = document.createElement("div");
        dayCard.classList.add("day-card");

        dayCard.innerHTML = `
      <h4>${dayName}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
      <p>High: ${maxTemp.toFixed(0)}°F</p>
      <p>Low: ${minTemp.toFixed(0)}°F</p>
    `;

        forecastContainer.appendChild(dayCard);
    }
}
