document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  let borderLayer = null;
  let cityMarkers = null;
  let currencyList = [];
  let isoToCurrency = {};
  let lastSelectedCountry = null;
  let clusterGroup = null;

  fetch("./php/getCurrencyList.php")
    .then(res => res.json())
    .then(data => { currencyList = data; });

  fetch("./php/getCountryList.php")
    .then(res => res.json())
    .then(list => {
      list.sort((a, b) => a.name.localeCompare(b.name));
      const sel = document.getElementById("countrySelect");
      sel.innerHTML = '<option value="">Select a country</option>';
      list.forEach(country => {
        const opt = document.createElement("option");
        opt.value = country.iso;
        opt.textContent = country.name;
        sel.appendChild(opt);
        if (country.currency) isoToCurrency[country.iso] = country.currency;
      });

      fetch("https://ipapi.co/json/")
        .then(ipRes => ipRes.json())
        .then(ipData => {
          const userCode = ipData.country;
          const idx = Array.from(sel.options).findIndex(o => o.value === userCode);
          if (idx > 0) {
            sel.selectedIndex = idx;
          } else if (sel.options.length > 1) {
            sel.selectedIndex = 1;
          }
          sel.dispatchEvent(new Event("change"));
        })
        .catch(() => {
          if (sel.options.length > 1) {
            sel.selectedIndex = 1;
            sel.dispatchEvent(new Event("change"));
          }
        });
    });

  document.getElementById("countrySelect").addEventListener("change", function () {
    const code = this.value;
    if (!code) return;
    lastSelectedCountry = code;

    ["wikiContent", "currencyContent", "weatherContent", "newsContent"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });

    fetchBorder(code)
      .then(() => {
        fetchWeatherWiki(code);
        fetchNews(code);
        fetchCities(code);
        fetchPOIs();
      });
  });

  $('#modalCurrency').on('show.bs.modal', function () {
    const countryCode = lastSelectedCountry;
    const countryCurrency = isoToCurrency[countryCode] || "USD";
    const fromSel = document.getElementById("fromCurrency");
    const toSel = document.getElementById("toCurrency");
    fromSel.innerHTML = "";
    toSel.innerHTML = "";
    currencyList.forEach(cur => {
      fromSel.innerHTML += `<option value="${cur.code}">${cur.code} - ${cur.name}</option>`;
      toSel.innerHTML += `<option value="${cur.code}">${cur.code} - ${cur.name}</option>`;
    });
    fromSel.value = "USD";
    toSel.value = countryCurrency === "USD" ? "EUR" : countryCurrency;
    document.getElementById("conversionResult").innerHTML = "";
  });

  document.getElementById("currencyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value) || 1;
    const from = document.getElementById("fromCurrency").value;
    const to = document.getElementById("toCurrency").value;

    $.ajax({
      url: "./php/convertCurrency.php",
      method: "POST",
      data: { amount, from, to },
      success: function (resp) {
        try {
          const data = typeof resp === "string" ? JSON.parse(resp) : resp;
          if (data && typeof data.result !== "undefined") {
            document.getElementById("conversionResult").innerHTML =
              `<p><strong>${amount} ${from} = ${data.result} ${to}</strong></p>`;
          } else {
            document.getElementById("conversionResult").innerHTML =
              "<p class='text-danger'>Conversion failed.</p>";
          }
        } catch (e) {
          document.getElementById("conversionResult").innerHTML =
            "<p class='text-danger'>Error parsing conversion result.</p>";
        }
      },
      error: function () {
        document.getElementById("conversionResult").innerHTML =
          "<p class='text-danger'>Error performing conversion.</p>";
      }
    });
  });

  function fetchBorder(code) {
    return fetch(`./php/getCountryBorder.php?code=${code}`)
      .then(res => res.json())
      .then(feature => {
        if (borderLayer) map.removeLayer(borderLayer);
        borderLayer = L.geoJSON(feature).addTo(map);
        map.fitBounds(borderLayer.getBounds());
      });
  }

  function fetchWeatherWiki(code) {
    if (!borderLayer) return;
    const ctr = borderLayer.getBounds().getCenter();
    fetchWeather(ctr.lat, ctr.lng);
    fetchWikipedia(ctr.lat, ctr.lng);
  }

function fetchWeather(lat, lon) {
  fetch(`./php/getWeather.php?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(d => {
      const el = document.getElementById("weatherContent");

      if (d.error) {
        el.innerHTML = `<p class="text-danger">${d.error}</p>`;
        return;
      }

      const iconCode = d.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      el.innerHTML = `
        <div class="text-center">
          <h5 class="mb-1">${d.name}</h5>
          <img src="${iconUrl}" alt="Weather icon" class="mb-2" style="width: 80px; height: 80px;" />
          <p class="mb-1"><strong>${d.weather[0].description.toUpperCase()}</strong></p>
          <p class="mb-0">🌡️ Temp: <strong>${d.main.temp}°C</strong></p>
          <p class="mb-0">💧 Humidity: <strong>${d.main.humidity}%</strong></p>
        </div>
      `;
    })
    .catch(err => {
      document.getElementById("weatherContent").innerHTML =
        "<p class='text-danger'>Unable to fetch weather data.</p>";
    });
}


  function fetchWikipedia(lat, lon) {
    fetch(`./php/getWikipedia.php?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(d => {
        const el = document.getElementById("wikiContent");
        if (!el) return;
        if (!d.geonames?.length) {
          el.innerHTML = "<p>No nearby Wikipedia entries.</p>";
        } else {
          el.innerHTML = d.geonames.map(e => `
              <p>
                <a href="https://${e.wikipediaUrl}" target="_blank"><strong>${e.title}</strong></a><br>
                ${e.summary}
              </p>
          `).join("");
        }
      });
  }

  function fetchNews(code) {
    const country = code.toLowerCase();
    fetch(`./php/getNews.php?country=${country}`)
      .then(res => res.json())
      .then(d => {
        const el = document.getElementById("newsContent");
        if (!el) return;
        const list = d.articles || [];
        el.innerHTML = list.length
          ? list.map(n => `
              <div class="mb-2">
                <a href="${n.url}" target="_blank"><strong>${n.title}</strong></a>
                <p>${n.description || ""}</p>
              </div>
            `).join("")
          : `<p>No news found for <strong>${code.toUpperCase()}</strong>.</p>`;
      });
  }

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
      });
  }

function fetchPOIs() {
  if (!lastSelectedCountry) return;

  const url = `./php/getGeoPOIs.php?country=${lastSelectedCountry}`;
  if (clusterGroup) map.removeLayer(clusterGroup);
  clusterGroup = L.markerClusterGroup();

  // Predefined categories for visual variety
  const categories = [
    { icon: 'fa-hospital', color: 'red', label: 'Hospital' },
    { icon: 'fa-shield-alt', color: 'blue', label: 'Police Station' },
    { icon: 'fa-utensils', color: 'orange', label: 'Restaurant' },
    { icon: 'fa-landmark', color: 'purple', label: 'Museum' },
    { icon: 'fa-city', color: 'darkblue', label: 'City' },
    { icon: 'fa-shopping-cart', color: 'green', label: 'Shop' },
    { icon: 'fa-tree', color: 'green', label: 'Park' },
    { icon: 'fa-hotel', color: 'blue-dark', label: 'Hotel' },
    { icon: 'fa-university', color: 'cadetblue', label: 'University' },
    { icon: 'fa-bus', color: 'yellow', label: 'Bus Station' }
  ];

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const places = data.geonames || [];
      places.forEach((poi, idx) => {
        const cat = categories[idx % categories.length]; // Rotate category

        const marker = L.marker([poi.lat, poi.lng], {
          icon: L.ExtraMarkers.icon({
            icon: cat.icon,
            markerColor: cat.color,
            shape: 'circle',
            prefix: 'fa'
          })
        }).bindPopup(`
          <strong>${poi.name || cat.label}</strong><br>
          ${poi.fcodeName || 'Point of Interest'}<br>
          Lat: ${poi.lat}, Lon: ${poi.lng}
        `);

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
    })
    .catch(err => console.error("POI fetch error:", err));
}


  // === EasyButtons Setup ===
  L.easyButton('fa-home', function(btn, map){
    map.setView([20, 0], 2);
  }, 'Reset Map View').addTo(map);

  let poisVisible = true;
  L.easyButton('fa-eye', function(btn, map){
    if (clusterGroup) {
      if (poisVisible) {
        map.removeLayer(clusterGroup);
        btn.button.style.backgroundColor = '#ccc';
      } else {
        map.addLayer(clusterGroup);
        btn.button.style.backgroundColor = '';
      }
      poisVisible = !poisVisible;
    }
  }, 'Toggle POI Markers').addTo(map);

  L.easyButton('fa-flag', function(){
    if (lastSelectedCountry) {
      alert("Selected Country: " + lastSelectedCountry);
    } else {
      alert("No country selected yet.");
    }
  }, 'Show Selected Country').addTo(map);
});
