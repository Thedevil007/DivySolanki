document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([20, 0], 2);

  // ✅ Marker icon fix
  const defaultIcon = L.icon({
    iconUrl: 'assets/leaflet/images/marker-icon.png',
    shadowUrl: 'assets/leaflet/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  L.Marker.prototype.options.icon = defaultIcon;

  const baseStreet = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  });
  const baseTopo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenTopoMap contributors"
  });
  const baseSatellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri"
  });
  baseStreet.addTo(map);

  const baseLayers = { "Street": baseStreet, "Topographic": baseTopo, "Satellite": baseSatellite };
  const overlayLayers = {};
  const controlLayers = L.control.layers(baseLayers, overlayLayers, { position: 'topright', collapsed: true }).addTo(map);

  let borderLayer = null;
  let cityMarkers = null;
  let clusterGroup = null;
  let currencyRates = {};
  let currencyNames = {};
  let isoToCurrency = {};
  let lastSelectedCountry = null;

  fetch("https://openexchangerates.org/api/currencies.json")
    .then(res => res.json())
    .then(data => currencyNames = data);

  fetch("./php/getExchangeRate.php")
    .then(res => res.json())
    .then(data => {
      if (data && data.rates) currencyRates = data.rates;
    });

  function populateCurrencyDropdown(rates) {
    const select = $('#exchangeRate');
    select.empty();
    for (const [code, rate] of Object.entries(rates)) {
      const label = currencyNames[code] || code;
      select.append(`<option value="${rate}">${label}</option>`);
    }
  }

  function calcCurrencyResult() {
    const from = parseFloat($('#fromAmount').val()) || 0;
    const rate = parseFloat($('#exchangeRate').val()) || 0;
    const result = numeral(from * rate).format('0,0.00');
    $('#toAmount').val(result);
  }

  $('#fromAmount, #exchangeRate').on('input change', calcCurrencyResult);

  $('#currencyModal').on('show.bs.modal', function () {
    $('#fromAmount').val(1);
    $('#toAmount').val('');
    populateCurrencyDropdown(currencyRates);
    calcCurrencyResult();
  });

  $('#currencyModal').on('hidden.bs.modal', function () {
    $('#fromAmount').val(1);
  });

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
        .then(res => res.json())
        .then(ipData => {
          const userCode = ipData.country;
          const idx = Array.from(sel.options).findIndex(o => o.value === userCode);
          sel.selectedIndex = idx > 0 ? idx : 1;
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

    ["wikiContent", "weatherContent", "newsContent", "holidaysContent"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
    });

    fetchBorder(code).then(() => {
      fetchWeatherWiki(code);
      fetchNews(code);
      fetchHolidays(code);
      fetchCities(code);
      fetchPOIs();
      const preloader = document.getElementById("preloader");
      if (preloader) preloader.classList.add("hidden");
    });

    fetch(`./php/getGeocode.php?code=${code}`)
      .then(res => res.json())
      .then(data => {
        const d = data?.geonames?.[0] || {};
        const html = `
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><i class="fa-solid fa-landmark me-2 text-success"></i><strong>Capital city:</strong> ${d.capital || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-globe-asia me-2 text-success"></i><strong>Continent:</strong> ${d.continentName || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-language me-2 text-success"></i><strong>Languages:</strong> ${d.languages || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-money-bill me-2 text-success"></i><strong>Currency:</strong> ${d.currencyCode || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-code me-2 text-success"></i><strong>ISO alpha 2:</strong> ${d.countryCode || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-code-branch me-2 text-success"></i><strong>ISO alpha 3:</strong> ${d.isoAlpha3 || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-users me-2 text-success"></i><strong>Population:</strong> ${numeral(d.population).format('0,0') || 'N/A'}</li>
            <li class="list-group-item"><i class="fa-solid fa-chart-area me-2 text-success"></i><strong>Area (km²):</strong> ${numeral(d.areaInSqKm).format('0,0') || 'N/A'}</li>
          </ul>`;
        document.getElementById("summaryContent").innerHTML = html;
      });
  });

  function fetchBorder(code) {
    return fetch(`./php/getCountryBorder.php?code=${code}`)
      .then(res => res.json())
      .then(feature => {
        if (borderLayer) map.removeLayer(borderLayer);
        borderLayer = L.geoJSON(feature, {
          style: {
            color: "#007bff",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.1,
            fillColor: "#cfe2ff"
          }
        }).addTo(map);
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
    .then(data => {
      const el = document.getElementById("weatherContent");
      const title = document.getElementById("weatherTitle");
      const updated = document.getElementById("weatherUpdated");

      if (data.cod !== "200" || !data.city) {
        el.innerHTML = `<p class="text-danger">Unable to retrieve forecast.</p>`;
        return;
      }

      title.textContent = `${data.city.name}, ${data.city.country}`;
      updated.textContent = `Last updated: ${new Date().toLocaleString()}`;

      const today = data.list[0];
      const icon = today.weather[0].icon;
      const desc = today.weather[0].description;
      const temp = `${Math.round(today.main.temp)}°C`;
      const min = `${Math.round(today.main.temp_min)}°C`;
      const max = `${Math.round(today.main.temp_max)}°C`;
      const humidity = `${today.main.humidity}%`;

      let html = `
        <div class="row text-center mb-4">
          <h5 class="mb-3">Today</h5>
          <div class="col-4">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" class="mb-2" />
            <div class="fw-bold text-capitalize">${desc}</div>
          </div>
          <div class="col-8 d-flex flex-column justify-content-center align-items-start">
            <p class="mb-1">🌡️ Temp: <strong>${temp}</strong></p>
            <p class="mb-1">⬇️ Min: <strong>${min}</strong>, ⬆️ Max: <strong>${max}</strong></p>
            <p class="mb-1">💧 Humidity: <strong>${humidity}</strong></p>
          </div>
        </div>
        <h6 class="text-muted mb-2">Next 3 Days</h6>
        <div class="d-flex justify-content-around text-center">`;

      const days = {};
      data.list.forEach(entry => {
        const date = new Date(entry.dt * 1000);
        const day = date.toDateString();
        if (!days[day] && Object.keys(days).length < 3) {
          days[day] = entry;
        }
      });

      Object.entries(days).forEach(([day, info]) => {
        const icon = info.weather[0].icon;
        const temp = `${Math.round(info.main.temp)}°C`;
        const label = new Date(info.dt * 1000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });

        html += `
          <div class="card shadow-sm p-2" style="width: 100px;">
            <small class="text-muted">${label}</small>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" class="my-1" style="width: 48px;" />
            <div class="fw-bold">${temp}</div>
          </div>`;
      });

      html += `</div>`;
      el.innerHTML = html;
    });
}



  function fetchWikipedia(lat, lon) {
    fetch(`./php/getWikipedia.php?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(d => {
        const el = document.getElementById("wikiContent");
        el.innerHTML = d.geonames?.length
          ? d.geonames.map(e => `
            <p><a href="https://${e.wikipediaUrl}" target="_blank"><strong>${e.title}</strong></a><br>${e.summary}</p>`).join("")
          : "<p>No nearby Wikipedia entries.</p>";
      });
  }

  function fetchNews(code) {
  fetch(`./php/getNews.php?country=${code.toLowerCase()}`)
    .then(res => res.json())
    .then(d => {
      const el = document.getElementById("newsContent");
      const list = d.articles || [];
      el.innerHTML = list.length
        ? list.map(n => `
            <div class="d-flex align-items-start gap-2 mb-3 border-bottom pb-2">
              <img src="${n.urlToImage || 'assets/favicon/news.png'}" class="rounded" style="width: 100px; height: auto; object-fit: cover;">
              <div>
                <a href="${n.url}" target="_blank" class="fw-bold text-dark d-block">${n.title}</a>
                <small class="text-muted">${n.source?.name || 'Unknown'}</small>
              </div>
            </div>
          `).join("")
        : `<p>No news found for <strong>${code.toUpperCase()}</strong>.</p>`;
    });
}


  function fetchHolidays(code) {
    fetch(`./php/getHolidays.php?country=${code}`)
      .then(res => res.json())
      .then(data => {
        const el = document.getElementById("holidaysContent");
        el.innerHTML = Array.isArray(data)
          ? data.map(holiday => {
              const formattedDate = new Date(holiday.date).toString("dddd, dd MMMM yyyy");
              return `<div class="mb-2"><strong>${holiday.localName}</strong> (${formattedDate})<br>${holiday.name}</div>`;
            }).join("")
          : "<p>No holiday data available.</p>";
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
            .bindPopup(`<strong>${c.name}</strong><br>Pop: ${numeral(c.population).format("0,0")}`)
            .addTo(cityMarkers);
        });
        cityMarkers.addTo(map);
        overlayLayers["Cities"] = cityMarkers;
        controlLayers.addOverlay(cityMarkers, "Cities");
      });
  }

  function fetchPOIs() {
    fetch(`./php/getGeoPOIs.php?country=${lastSelectedCountry}`)
      .then(res => res.json())
      .then(data => {
        if (clusterGroup) map.removeLayer(clusterGroup);
        clusterGroup = L.markerClusterGroup();
        const categories = [
          { icon: 'fa-hospital', color: 'red' },
          { icon: 'fa-shield-alt', color: 'blue' },
          { icon: 'fa-utensils', color: 'orange' },
          { icon: 'fa-landmark', color: 'purple' },
          { icon: 'fa-city', color: 'darkblue' },
          { icon: 'fa-shopping-cart', color: 'green' },
          { icon: 'fa-tree', color: 'green' },
          { icon: 'fa-hotel', color: 'blue-dark' },
          { icon: 'fa-university', color: 'cadetblue' },
          { icon: 'fa-bus', color: 'yellow' }
        ];
        (data.geonames || []).forEach((poi, idx) => {
          const cat = categories[idx % categories.length];
          const marker = L.marker([poi.lat, poi.lng], {
            icon: L.ExtraMarkers.icon({
              icon: cat.icon,
              markerColor: cat.color,
              shape: 'circle',
              prefix: 'fa'
            })
          }).bindPopup(`<strong>${poi.name}</strong><br>${poi.fcodeName}<br>Lat: ${poi.lat}, Lon: ${poi.lng}`);
          clusterGroup.addLayer(marker);
        });
        clusterGroup.addTo(map);
        overlayLayers["Points of Interest"] = clusterGroup;
        controlLayers.addOverlay(clusterGroup, "Points of Interest");
      });
  }

  // EasyButtons
  L.easyButton('fa-brands fa-wikipedia-w', () => $('#modalWiki').modal('show'), 'Wikipedia').addTo(map);
  L.easyButton('fa-solid fa-money-bill', () => $('#currencyModal').modal('show'), 'Currency Converter').addTo(map);
  L.easyButton('fa-solid fa-cloud-sun', () => $('#modalWeather').modal('show'), 'Weather').addTo(map);
  L.easyButton('fa-solid fa-newspaper', () => $('#modalNews').modal('show'), 'News').addTo(map);
  L.easyButton('fa-solid fa-calendar-day', () => $('#modalHolidays').modal('show'), 'Holidays').addTo(map);
  L.easyButton('fa-solid fa-circle-info', () => $('#modalSummary').modal('show'), 'Country Summary').addTo(map);
});
