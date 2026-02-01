document.addEventListener("DOMContentLoaded", () => {

  const map = L.map("map").setView([20, 0], 2);
  const defaultIcon = L.icon({
    iconUrl: 'assets/leaflet/images/marker-icon.png',
    shadowUrl: 'assets/leaflet/images/marker-shadow.png',
    iconSize: [25,41],
    iconAnchor: [12,41],
    popupAnchor: [1,-34],
    shadowSize: [41,41]
  });
  L.Marker.prototype.options.icon = defaultIcon;

  const baseStreet = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "&copy; OpenStreetMap contributors" }
  ).addTo(map);

  const baseTopo = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    { attribution: "&copy; OpenTopoMap contributors" }
  );

  const baseSatellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles &copy; Esri" }
  );

  const baseLayers = {
    Street: baseStreet,
    Topographic: baseTopo,
    Satellite: baseSatellite
  };
  const overlayLayers = {};
  const controlLayers = L.control
    .layers(baseLayers, overlayLayers, { position: "topright", collapsed: true })
    .addTo(map);

  // ───────────────────────────────────────────────────────────────
  // Global state
  // ───────────────────────────────────────────────────────────────
  let selectedCountryCode    = null;
  let initialIPCountryCode   = null;
  let borderLayer            = null;
  let cityMarkers            = null;
  let clusterGroup           = null;
  let currencyRates          = {};
  let currencyNames          = {};
  let isoToCurrency          = {};
  let currencyDataReady = false;
  let lastSelectedCountry    = null;

  // ───────────────────────────────────────────────────────────────
  // Load currency names & rates
  // ───────────────────────────────────────────────────────────────
Promise.all([
  fetch("https://openexchangerates.org/api/currencies.json").then(r => r.json()),
  fetch("./php/getExchangeRate.php").then(res => res.json())
])
.then(([names, ratesData]) => {
  if (ratesData.error) {
    console.error("Currency API error:", ratesData);
    return;
  }
  currencyNames = names;
  currencyRates = ratesData.rates;
  currencyDataReady = true;  //  Set flag
})
.catch(err => console.error("Failed to load currency data:", err));


  // ───────────────────────────────────────────────────────────────
  // Load country list & auto‐select by IP
  // ───────────────────────────────────────────────────────────────
  fetch("./php/getCountryList.php")
    .then(r => r.json())
    .then(list => {
      list.sort((a, b) => a.name.localeCompare(b.name));
      const sel = document.getElementById("countrySelect");
      sel.innerHTML = '<option value="">Select a country</option>';
      list.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.iso;
        opt.textContent = c.name;
        sel.appendChild(opt);
        if (c.currency) isoToCurrency[c.iso] = c.currency;
      });

      // Auto‐select via IP
      fetch("https://ipapi.co/json/")
        .then(r => r.json())
        .then(data => {
          initialIPCountryCode = data.country;
          selectedCountryCode  = data.country;
          const idx = Array.from(sel.options).findIndex(o => o.value === data.country);
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

  // ───────────────────────────────────────────────────────────────
  // Country change handler
  // ───────────────────────────────────────────────────────────────
  document.getElementById("countrySelect").addEventListener("change", function(){
    const code = this.value;
    if (!code) return;
    selectedCountryCode = lastSelectedCountry = code;

    // Clear panels
    ["wikiContent","weatherContent","newsContent","holidaysContent"].forEach(id=>{
      document.getElementById(id).innerHTML = "";
    });

    fetchBorder(code).then(() => {
      fetchWeatherWiki(code);
      fetchNews(code);
      fetchHolidays(code);
      fetchCities(code);
      fetchPOIs();
      setTimeout(() => {
  document.getElementById("preloader")?.classList.add("hidden");
}, 500); // give it a moment to paint

    });

    fetch(`./php/getGeocode.php?code=${code}`)
      .then(r => r.json())
      .then(data => {
        const d = data.geonames?.[0] || {};
       document.getElementById("summaryCapital").innerText    = d.capital || "N/A";
document.getElementById("summaryContinent").innerText  = d.continentName || "N/A";
document.getElementById("summaryLanguages").innerText  = d.languages || "N/A";
document.getElementById("summaryCurrency").innerText   = d.currencyCode || "N/A";
document.getElementById("summaryISO2").innerText       = d.countryCode || "N/A";
document.getElementById("summaryISO3").innerText       = d.isoAlpha3 || "N/A";
document.getElementById("summaryPopulation").innerText = numeral(d.population).format("0,0");
document.getElementById("summaryArea").innerText       = `${numeral(d.areaInSqKm).format("0,0")} km²`;

      });
  });

  // ───────────────────────────────────────────────────────────────
  // Fetch helper functions
  // ───────────────────────────────────────────────────────────────
  function fetchBorder(code){
    return fetch(`./php/getCountryBorder.php?code=${code}`)
      .then(r => r.json())
      .then(feature => {
        if (borderLayer) map.removeLayer(borderLayer);
        borderLayer = L.geoJSON(feature, {
          style: { color:"#007bff", weight:3, opacity:1, fillOpacity:0.1, fillColor:"#cfe2ff" }
        }).addTo(map);
        map.fitBounds(borderLayer.getBounds());
      });
  }

// ─────────────────────────────────────────────────────────────
// Fetch Wikipedia + Weather for selected country’s CAPITAL
// ─────────────────────────────────────────────────────────────
function fetchWeatherWiki(code) {
  fetch(`./php/getGeocode.php?code=${code}`)
    .then(res => res.json())
    .then(data => {
      const capitalData = data.geonames?.[0];
      if (capitalData && capitalData.capital && capitalData.lat && capitalData.lng) {
        const capital = capitalData.capital;
        const lat = parseFloat(capitalData.lat);
        const lon = parseFloat(capitalData.lng);
        const country = capitalData.countryName || code;
        fetchWeather(lat, lon, capital, country);
        fetchWikipedia(lat, lon);
      } else {
        console.warn("Capital not found, using country center");
        const ctr = borderLayer.getBounds().getCenter();
        fetchWeather(ctr.lat, ctr.lng, "Center", code);
        fetchWikipedia(ctr.lat, ctr.lng);
      }
    })
    .catch(() => {
      const ctr = borderLayer.getBounds().getCenter();
      fetchWeather(ctr.lat, ctr.lng, "Center", code);
      fetchWikipedia(ctr.lat, ctr.lng);
    });
}


function fetchWeather(lat, lon) {
  fetch(`./php/getWeather.php?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      const el      = document.getElementById("weatherContent");
      const title   = document.getElementById("weatherTitle");
      const updated = document.getElementById("weatherUpdated");

      if (data.cod !== "200" || !data.city) {
        el.innerHTML = `<p class="text-danger">Unable to retrieve forecast.</p>`;
        return;
      }

      // Set location title and update time
      title.textContent = `${data.city.name}, ${data.city.country}`;
      updated.textContent = `Last updated: ${new Date().toLocaleString()}`;

      // Today’s forecast
      const today = data.list[0];
      const icon = today.weather[0].icon;
      const desc = today.weather[0].description;
      const min  = `${Math.round(today.main.temp_min)}°C`;
      const max  = `${Math.round(today.main.temp_max)}°C`;

      let html = `
        <h5 class="text-center">TODAY</h5>
        <div class="text-center mb-4">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" style="width:70px; height:70px;" />
          <div class="fw-bold text-capitalize mt-2">${desc}</div>
          <div class="fs-5"><strong>Min:</strong> ${min}, <strong>Max:</strong> ${max}</div>
        </div>
        <h6 class="text-muted mb-2">Next 3 Days</h6>
        <div class="d-flex justify-content-around text-center">`;

      // Next 3-day forecast
      const days = {};
      data.list.forEach(entry => {
        const d = new Date(entry.dt * 1000).toDateString();
        if (!days[d] && Object.keys(days).length < 3) {
          days[d] = entry;
        }
      });

      Object.entries(days).forEach(([_, info]) => {
        const ic = info.weather[0].icon;
        const min = `${Math.round(info.main.temp_min)}°C`;
        const max = `${Math.round(info.main.temp_max)}°C`;
        const label = new Date(info.dt * 1000).toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric'
        });

        html += `
          <div class="card shadow-sm p-2" style="width:100px">
            <small class="text-muted">${label}</small>
            <img src="https://openweathermap.org/img/wn/${ic}.png" alt="" class="my-1" style="width:48px;" />
            <div class="fw-bold">Min: ${min}</div>
            <div class="fw-bold">Max: ${max}</div>
          </div>`;
      });

      html += `</div>`;
      el.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("weatherContent").innerHTML =
        `<p class="text-danger">Error loading weather data.</p>`;
    });
}


  function fetchWikipedia(lat, lon){
    fetch(`./php/getWikipedia.php?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(d => {
        document.getElementById("wikiContent").innerHTML = d.geonames?.length
          ? d.geonames.map(e =>
              `<p><a href="https://${e.wikipediaUrl}" target="_blank"><strong>${e.title}</strong></a><br>${e.summary}</p>`
            ).join("")
          : "<p>No nearby Wikipedia entries.</p>";
      });
  }


function fetchNews(code) {
  fetch(`./php/getNews.php?country=${code.toLowerCase()}`)
    .then(res => res.json())
    .then(d => {
      const container = document.getElementById("newsContent");
      const articles = d.articles || [];
      if (articles.length === 0) {
        container.innerHTML = `<p>No news found for <strong>${code.toUpperCase()}</strong>.</p>`;
        return;
      }
      container.innerHTML = articles.map(n => `
  <div class="card mb-3 shadow-sm" style="border-radius: 0.5rem; overflow: hidden; border-left: 4px solid #0d6efd;">
    <div class="row g-0 align-items-center">
      <div class="col-auto">
       <img src="${n.image || 'assets/favicon/news.png'}"
     class="img-fluid"
     style="width: 100px; height: 100px; object-fit: cover;"
     alt="news image"
     onerror="this.onerror=null; this.src='assets/favicon/news.png';">
      </div>
      <div class="col">
        <div class="card-body py-2">
          <a href="${n.url}" target="_blank"
             class="card-title h6 fw-bold mb-1 text-primary d-block">
            ${n.title}
          </a>
          <p class="card-text mb-0">
            <small class="text-primary">${n.source?.name || 'Unknown'}</small>
          </p>
        </div>
      </div>
    </div>
  </div>
`).join("");

    })
    .catch(err => {
      console.error(err);
      document.getElementById("newsContent").innerHTML =
        `<p class="text-danger">Failed to load news articles.</p>`;
    });
}


  function fetchHolidays(code) {
  fetch(`./php/getHolidays.php?country=${code}`)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById("holidaysContent");
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p>No holiday data available.</p>";
        return;
      }

      const html = data.map(h => {
        const dateStr = new Date(h.date).toLocaleDateString("en-GB", {
          weekday: "short", day: "numeric", month: "short", year: "numeric"
        });
        return `
          <div class="d-flex justify-content-between border-bottom py-2">
            <strong class="me-2">${h.localName}</strong>
            <span class="text-muted small">${dateStr}</span>
          </div>`;
      }).join("");

      container.innerHTML = html;
    })
    .catch(() => {
      document.getElementById("holidaysContent").innerHTML =
        "<p class='text-danger'>Failed to load holiday data.</p>";
    });
}


  function fetchCities(code){
    fetch(`./php/getCities.php?code=${code}`)
      .then(r => r.json())
      .then(d => {
        cityMarkers && map.removeLayer(cityMarkers);
        cityMarkers = L.layerGroup();
        (d.geonames||[]).forEach(c =>
          L.circleMarker([c.lat,c.lng],{radius:3,color:"#007bff"})
            .bindPopup(`<strong>${c.name}</strong><br>Pop: ${numeral(c.population).format("0,0")}`)
            .addTo(cityMarkers)
        );
        cityMarkers.addTo(map);
        overlayLayers.Cities = cityMarkers;
        controlLayers.addOverlay(cityMarkers, "Cities");
      });
  }

  function fetchPOIs(){
    fetch(`./php/getGeoPOIs.php?country=${lastSelectedCountry}`)
      .then(r => r.json())
      .then(data => {
        if (clusterGroup) map.removeLayer(clusterGroup);
        clusterGroup = L.markerClusterGroup();
        const categories = [
          { icon:'fa-hospital',      color:'red'      },
          { icon:'fa-shield-alt',    color:'blue'     },
          { icon:'fa-utensils',      color:'orange'   },
          { icon:'fa-landmark',      color:'purple'   },
          { icon:'fa-city',          color:'darkblue' },
          { icon:'fa-shopping-cart', color:'green'    },
          { icon:'fa-tree',          color:'green'    },
          { icon:'fa-hotel',         color:'blue-dark'},
          { icon:'fa-university',    color:'cadetblue'},
          { icon:'fa-bus',           color:'yellow'   }
        ];
        (data.geonames||[]).forEach((poi,idx)=>{
          const cat = categories[idx%categories.length];
          const marker = L.marker([poi.lat,poi.lng],{
            icon: L.ExtraMarkers.icon({
              icon: cat.icon,
              markerColor: cat.color,
              shape: 'circle',
              prefix: 'fa'
            })
          }).bindPopup(`<strong>${poi.name}</strong><br>${poi.fcodeName}`);
          clusterGroup.addLayer(marker);
        });
        clusterGroup.addTo(map);
        overlayLayers["Points of Interest"] = clusterGroup;
        controlLayers.addOverlay(clusterGroup, "Points of Interest");
      });
  }

  // ───────────────────────────────────────────────────────────────
  // CURRENCY CONVERTER
  // ───────────────────────────────────────────────────────────────
  function getBaseCurrencyCode(){
    return (
      isoToCurrency[selectedCountryCode] ||
      isoToCurrency[initialIPCountryCode] ||
      "USD"
    );
  }

 // ───────────────────────────────────────────────────────────────
// CURRENCY CONVERTER (From: USD → To: user-selected currency)
// ───────────────────────────────────────────────────────────────

function populateCurrencyDropdowns() {
  const fromSel = document.getElementById("fromCurrency");
  const toSel   = document.getElementById("exchangeRate");
  fromSel.innerHTML = toSel.innerHTML = "";

  // Add all currency options to both dropdowns
  Object.entries(currencyRates).forEach(([code, rate]) => {
    const label = currencyNames[code] || code;
    const optionHTML = `<option value="${rate}" data-code="${code}">${label} (${code})</option>`;
    fromSel.insertAdjacentHTML("beforeend", optionHTML);
    toSel.insertAdjacentHTML("beforeend", optionHTML);
  });

  // Detect IP-based currency and pre-select in "From"
  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {
      const userCurrency = data.currency || "USD";
      const fromOption = Array.from(fromSel.options).find(opt =>
        opt.dataset.code === userCurrency
      );
      if (fromOption) {
        fromSel.value = fromOption.value;
      } else {
        fromSel.selectedIndex = 0;
      }

      // Default "To" to USD or the next option
      const toDefault = Array.from(toSel.options).find(opt =>
        opt.dataset.code === "USD"
      );
      toSel.value = toDefault ? toDefault.value : toSel.options[1]?.value;

      calcCurrencyResult();
    })
    .catch(() => {
      fromSel.selectedIndex = 0;
      toSel.selectedIndex = 1;
      calcCurrencyResult();
    });
}

function calcCurrencyResult() {
  const amt    = parseFloat(document.getElementById("fromAmount").value) || 0;
  const fromR  = parseFloat(document.getElementById("fromCurrency").value) || 1;
  const toR    = parseFloat(document.getElementById("exchangeRate").value) || 1;
  const result = amt * (toR / fromR);
  document.getElementById("toAmount").value = numeral(result).format("0,0.00");
}

$('#currencyModal').on("show.bs.modal", () => {
  document.getElementById("fromAmount").value = 1;
  document.getElementById("toAmount").value   = "";
  populateCurrencyDropdowns();
});

["fromAmount", "fromCurrency", "exchangeRate"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("input",  calcCurrencyResult);
  el.addEventListener("change", calcCurrencyResult);
});

  // ───────────────────────────────────────────────────────────────
  // EasyButtons for modals
  // ───────────────────────────────────────────────────────────────
  [
    { icon:"fa-book",   modal:"modalWiki",     title:"Wikipedia"    },
    { icon:"fa-money-bill",    modal:"currencyModal", title:"Currency"     },
    { icon:"fa-cloud-sun",     modal:"modalWeather",  title:"Weather"      },
    { icon:"fa-newspaper",     modal:"modalNews",     title:"News"         },
    { icon:"fa-calendar-day",  modal:"modalHolidays", title:"Holidays"     },
    { icon:"fa-circle-info",   modal:"modalSummary",  title:"Country Info" }
  ].forEach(btn=>{
    L.easyButton(`fa-solid ${btn.icon}`,
      ()=>$(`#${btn.modal}`).modal("show"),
      btn.title
    ).addTo(map);
  });

}); 
