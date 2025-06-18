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
        fetchPOIs(); // call POIs after border is added
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
        const out = d.error
          ? `<p>${d.error}</p>`
          : `
            <p><strong>${d.name}</strong></p>
            <p>Temp: ${d.main.temp}°C</p>
            <p>Humidity: ${d.main.humidity}%</p>
            <p>Conditions: ${d.weather[0].description}</p>
          `;
        document.getElementById("weatherContent").innerHTML = out;
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
    if (!borderLayer) return;

    const bounds = borderLayer.getBounds();
    const clusterGroup = L.markerClusterGroup();

    const categories = [
      { icon: 'fa-hospital', color: 'red', label: 'Hospital' },
      { icon: 'fa-utensils', color: 'orange', label: 'Restaurant' },
      { icon: 'fa-university', color: 'blue', label: 'University' },
      { icon: 'fa-landmark', color: 'purple', label: 'Museum' },
      { icon: 'fa-shopping-cart', color: 'green', label: 'Shop' },
      { icon: 'fa-tree', color: 'green-dark', label: 'Park' },
      { icon: 'fa-car', color: 'cyan', label: 'Taxi Stand' },
      { icon: 'fa-bus', color: 'yellow', label: 'Bus Station' },
      { icon: 'fa-hotel', color: 'blue-dark', label: 'Hotel' },
      { icon: 'fa-bolt', color: 'black', label: 'Power Station' }
    ];

    for (let i = 0; i < 10; i++) {
      const cat = categories[i % categories.length];
      const lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
      const lon = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());

      const marker = L.marker([lat, lon], {
        icon: L.ExtraMarkers.icon({
          icon: cat.icon,
          markerColor: cat.color,
          shape: 'circle',
          prefix: 'fa'
        })
      }).bindPopup(`<strong>${cat.label}</strong><br>POI ${i + 1}`);

      clusterGroup.addLayer(marker);
    }

    map.addLayer(clusterGroup);
  }
});
