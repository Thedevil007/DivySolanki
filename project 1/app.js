// app.js
document.addEventListener("DOMContentLoaded", () => {
  // Initialize map
  const map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let borderLayer = null;
  let cityMarkers = null;

  //  Populate the country dropdown
  fetch("./php/getCountryList.php")
    .then(res => {
      if (!res.ok) throw new Error(`CountryList HTTP ${res.status}`);
      return res.json();
    })
    .then(list => {
      const sel = document.getElementById("countrySelect");
      list.forEach(country => {
        const opt = document.createElement("option");
        opt.value = country.iso;    // use correct key
        opt.textContent = country.name;
        sel.appendChild(opt);
      });
      // auto‐select first real country
      if (sel.options.length > 1) {
        sel.selectedIndex = 1;
        sel.dispatchEvent(new Event("change"));
      }
    })
    .catch(err => console.error("Country list load failed:", err));

  // On country change
  document.getElementById("countrySelect").addEventListener("change", function() {
    const code = this.value;
    if (!code) return;

    // Clear all modal bodies that do exist
    ["wikiContent", "currencyContent", "weatherContent", "newsContent"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });

    fetchBorder(code);
    fetchCurrency(code);
    fetchNews(code);
    fetchCities(code);
  });

  // Fetch + draw border → then weather & wiki
  function fetchBorder(code) {
    fetch(`./php/getCountryBorder.php?code=${code}`)
      .then(res => {
        if (!res.ok) throw new Error(`Border HTTP ${res.status}`);
        return res.json();
      })
      .then(feature => {
        if (borderLayer) map.removeLayer(borderLayer);
        borderLayer = L.geoJSON(feature).addTo(map);
        map.fitBounds(borderLayer.getBounds());

        const ctr = borderLayer.getBounds().getCenter();
        fetchWeather(ctr.lat, ctr.lng);
        fetchWikipedia(ctr.lat, ctr.lng);
      })
      .catch(err => console.error("Border load failed:", err));
  }

  //  Weather
  function fetchWeather(lat, lon) {
    fetch(`./php/getWeather.php?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(d => {
        const out = d.error
          ? `<p>${d.error}</p>`
          : `
            <p><strong>${d.name}</strong></p>
            <p>Temp: ${d.main.temp}°C</p>
            <p>Humidity: ${d.main.humidity}%</p>
            <p>Conditions: ${d.weather[0].description}</p>
          `;
        const el = document.getElementById("weatherContent");
        if (el) el.innerHTML = out;
      })
      .catch(err => {
        console.error("Weather load failed:", err);
        const el = document.getElementById("weatherContent");
        if (el) el.innerText = "Error loading weather.";
      });
  }

  //  Wikipedia
  function fetchWikipedia(lat, lon) {
    fetch(`./php/getWikipedia.php?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(d => {
        const el = document.getElementById("wikiContent");
        if (!el) return;
        if (!d.geonames?.length) {
          el.innerHTML = "<p>No nearby Wikipedia entries.</p>";
        } else {
          el.innerHTML = d.geonames
            .map(e => `
              <p>
                <a href="https://${e.wikipediaUrl}" target="_blank"><strong>${e.title}</strong></a><br>
                ${e.summary}
              </p>
            `)
            .join("");
        }
      })
      .catch(err => {
        console.error("Wikipedia load failed:", err);
        const el = document.getElementById("wikiContent");
        if (el) el.innerText = "Error loading Wikipedia.";
      });
  }

  // Currency
  function fetchCurrency(code) {
    const sym = code === "GB" ? "GBP" : code;
    fetch(`./php/getExchangeRate.php?symbols=${sym}`)
      .then(res => res.json())
      .then(d => {
        const el = document.getElementById("currencyContent");
        if (!el) return;
        const rate = d.rates?.[sym];
        el.innerHTML = rate
          ? `<p>1 USD = ${rate} ${sym}</p>`
          : `<p>No rate available for ${sym}</p>`;
      })
      .catch(err => {
        console.error("Currency load failed:", err);
        const el = document.getElementById("currencyContent");
        if (el) el.innerText = "Error loading currency.";
      });
  }

  //  News
  function fetchNews(code) {
    fetch(`./php/getNews.php?country=${code.toLowerCase()}`)
      .then(res => {
        if (!res.ok) throw new Error(`News HTTP ${res.status}`);
        return res.json();
      })
      .then(d => {
        const el = document.getElementById("newsContent");
        if (!el) return;
        const list = d.results || d.articles || [];
        el.innerHTML = list.length
          ? list
              .map(n => `
                <div class="mb-2">
                  <a href="${n.link||n.url}" target="_blank"><strong>${n.title}</strong></a>
                  <p>${n.description||n.summary||""}</p>
                </div>
              `)
              .join("")
          : "<p>No news found.</p>";
      })
      .catch(err => {
        console.error("News load failed:", err);
        const el = document.getElementById("newsContent");
        if (el) el.innerText = "Error loading news.";
      });
  }

  //  Cities (optional)
  function fetchCities(code) {
    fetch(`./php/getCities.php?code=${code}`)
      .then(res => res.json())
      .then(d => {
        if (cityMarkers) map.removeLayer(cityMarkers);
        cityMarkers = L.layerGroup();
        (d.geonames || []).forEach(c => {
          L.circleMarker([c.lat, c.lng], { radius: 3, color: "#007bff" })
            .bindPopup(`<strong>${c.name}</strong><br>Pop: ${c.population}`)
            .addTo(cityMarkers);
        });
        cityMarkers.addTo(map);
      })
      .catch(err => console.error("Cities load failed:", err));
  }
});
