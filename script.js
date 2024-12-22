const apiKey = "61f72c1c4b230f379aaec475997ca00c";

const weatherIcons = {
    Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/1163/1163657.png",
    Drizzle: "https://cdn-icons-png.flaticon.com/512/3075/3075858.png",
    Thunderstorm: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
    Mist: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Smoke: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Haze: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Dust: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Fog: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Sand: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Ash: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Squall: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Tornado: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png"
};

function updateClockAndDate(timezoneOffset) {
    const localTime = new Date(new Date().getTime() + timezoneOffset * 1000);
    const hours = localTime.getHours().toString().padStart(2, "0");
    const minutes = localTime.getMinutes().toString().padStart(2, "0");
    const day = localTime.getDate().toString().padStart(2, "0");
    const month = (localTime.getMonth() + 1).toString().padStart(2, "0"); // Os meses são de 0 a 11
    const year = localTime.getFullYear();

    document.getElementById("time").innerHTML = `${hours}:${minutes}`;
    document.getElementById("date").innerHTML = `${day}/${month}/${year}`;
}

async function getCitySuggestions() {
    const query = document.getElementById("city").value;
    const suggestionsList = document.getElementById("suggestions");
    suggestionsList.innerHTML = "";

    if (!query) {
        return;
    }

    try {
        const response = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.length === 0) {
            suggestionsList.innerHTML = "<li>Nenhuma cidade encontrada</li>";
            return;
        }

        data.forEach((city) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${city.name}, ${city.country}`;
            listItem.onclick = () => {
                document.getElementById("city").value = city.name;
                suggestionsList.innerHTML = ""; // Limpa as sugestões após a seleção
                getWeather(); // Carrega o clima automaticamente após a seleção
            };
            suggestionsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
    }
}

async function getWeather() {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Por favor, insira o nome de uma cidade.");
        return;
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`
        );
        if (!response.ok) {
            throw new Error("Cidade não encontrada!");
        }

        const data = await response.json();

        const weatherMain = data.weather[0].main;
        const iconUrl = weatherIcons[weatherMain] || "https://cdn-icons-png.flaticon.com/512/869/869869.png";
        document.getElementById("weather-icon").innerHTML = `
            <img src="${iconUrl}" alt="Weather Icon" style="width: 200px; height: 200px;" />
        `;
        document.getElementById("weather-icon").style.display = "block";

        document.getElementById("temp-div").innerHTML = `${Math.round(data.main.temp)}°C`;
        document.getElementById("weather-info").innerHTML = data.weather[0].description;

        const windSpeed = `${Math.round(data.wind.speed * 3.6)} Km/h`;
        const humidity = `${data.main.humidity}%`;

        document.querySelector(".meu-card:nth-child(1) p").innerHTML = windSpeed;
        document.querySelector(".meu-card:nth-child(2) p").innerHTML = humidity;

        const timezoneOffset = data.timezone;
        updateClockAndDate(timezoneOffset);
        setInterval(() => updateClockAndDate(timezoneOffset), 60000); // Atualiza a cada minuto

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`
        );
        const forecastData = await forecastResponse.json();

        const hourlyForecastDiv = document.getElementById("hourly-forecast");
        hourlyForecastDiv.innerHTML = "";

        forecastData.list.slice(0, 10).forEach((forecast) => {
            const forecastTime = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const forecastTemp = `${Math.round(forecast.main.temp)}°C`;
            const forecastHumidity = `${forecast.main.humidity}%`;
            const forecastDescription = forecast.weather[0].description;
            const forecastIcon = weatherIcons[forecast.weather[0].main] || "https://cdn-icons-png.flaticon.com/512/869/869869.png";

            const forecastItem = document.createElement("div");
            forecastItem.classList.add("hourly-item");
            forecastItem.innerHTML = `
                <span>${forecastTime}</span>
                <img src="${forecastIcon}" alt="Forecast Icon" class="forecast-icon" />
                <span>${forecastTemp}</span>
            `;
            hourlyForecastDiv.appendChild(forecastItem);
        });
    } catch (error) {
        alert(error.message);
    }
}

// Limpa o campo de entrada ao carregar a página
window.addEventListener("load", () => {
    document.getElementById("city").value = "";
});
