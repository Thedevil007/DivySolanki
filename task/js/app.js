function getCapitalCity() {
  const country = document.getElementById("capital-country").value;

  fetch(`php/getCapitalCity.php?country=${country}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        document.getElementById("output").innerText = `Capital City of ${country}: ${data.capital}`;
      } else {
        document.getElementById("output").innerText = `Error: ${data.message || "Unknown error"}`;
      }
    })
    .catch(() => {
      document.getElementById("output").innerText = "Fetch failed.";
    });
}

function getPostalCode() {
  const lat = document.getElementById("postal-lat").value;
  const lng = document.getElementById("postal-lng").value;

  fetch(`php/getPostalCode.php?lat=${lat}&lng=${lng}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        document.getElementById("output").innerText = `Postal codes nearby: ${data.postalCodes.join(", ")}`;
      } else {
        document.getElementById("output").innerText = `Error: ${data.message || "Unknown error"}`;
      }
    })
    .catch(() => {
      document.getElementById("output").innerText = "Fetch failed.";
    });
}

function getWeather() {
  const postal = document.getElementById("weather-postal").value;
  const country = document.getElementById("weather-country").value;

  fetch(`php/getWeather.php?postal=${postal}&country=${country}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        document.getElementById("output").innerText = `Weather in ${data.city}: ${data.weatherDesc}, Temperature: ${data.temp} °C`;
      } else {
        document.getElementById("output").innerText = `Error: ${data.message || "Unknown error"}`;
      }
    })
    .catch(() => {
      document.getElementById("output").innerText = "Fetch failed.";
    });
}

function getTimezone() {
  const lat = document.getElementById("timezone-lat").value;
  const lng = document.getElementById("timezone-lng").value;

  fetch(`php/getTimezone.php?lat=${lat}&lng=${lng}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.timezoneId) {
        document.getElementById("output").innerText = `Timezone: ${data.timezoneId}`;
      } else {
        document.getElementById("output").innerText = `Error: ${data.message || "Unknown error"}`;
      }
    })
    .catch(() => {
      document.getElementById("output").innerText = "Fetch failed.";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("capitalCityBtn").addEventListener("click", getCapitalCity);
  document.getElementById("postalCodeBtn").addEventListener("click", getPostalCode);
  document.getElementById("weatherBtn").addEventListener("click", getWeather);
  document.getElementById("timezoneBtn").addEventListener("click", getTimezone); // ✅ NEW
});
