let map;
let borderLayer;

window.onload = function () {
  // Initialize Leaflet map
  map = L.map('map').setView([20, 0], 2);

  // Add OpenStreetMap base layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Load countries into dropdown
  fetch('php/getCountryList.php')
    .then(res => res.json())
    .then(list => {
      if (!Array.isArray(list)) return console.error('Invalid response from getCountryList.php');
      list.forEach(country => {
        $('#countrySelect').append($('<option>').val(country.iso).text(country.name));
      });
    }).catch(err => console.error("Country list fetch failed:", err));

  // When a country is selected
  $('#countrySelect').on('change', function () {
    const code = this.value;
    if (!code) return;

    fetch(`php/getCountryBorder.php?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (borderLayer) map.removeLayer(borderLayer);
        borderLayer = L.geoJSON(data).addTo(map);
        map.fitBounds(borderLayer.getBounds());
        $('#demographicsContent').html(`<p><strong>Country:</strong> ${data.properties.name}</p>`);
      });
  });

  // Use browser's geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude: lat, longitude: lng } = position.coords;
      map.setView([lat, lng], 5);

      fetch(`php/getGeocode.php?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(data => {
          const code = data.results[0].components['ISO_3166-1_alpha-2'];
          $('#countrySelect').val(code).trigger('change');
        });
    });
  }

  // Wikipedia Modal
  $('#modalWiki').on('show.bs.modal', () => {
    const { lat, lng } = map.getCenter();
    fetch(`php/getWikipedia.php?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        const articles = data.geonames || [];
        if (!articles.length) return $('#wikiContent').html('<p>No nearby Wikipedia entries found.</p>');
        const html = '<ul>' + articles.map(a =>
          `<li><a href="https://${a.wikipediaUrl}" target="_blank">${a.title}</a><br><small>${a.summary}</small></li>`
        ).join('') + '</ul>';
        $('#wikiContent').html(html);
      });
  });

  // Weather Modal
  $('#modalWeather').on('show.bs.modal', () => {
    const { lat, lng } = map.getCenter();
    fetch(`php/getWeather.php?lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const html = `
          <p><strong>${data.name}</strong></p>
          <p>${data.weather[0].description}</p>
          <p>🌡️ ${data.main.temp}°C (feels like ${data.main.feels_like}°C)</p>
          <p>💧 Humidity: ${data.main.humidity}%</p>`;
        $('#weatherContent').html(html);
      });
  });

  // Currency Modal
  $('#modalCurrency').on('show.bs.modal', () => {
    fetch('php/getExchangeRate.php?symbols=EUR,GBP')
      .then(res => res.json())
      .then(data => {
        const html = `
          <p>💵 1 USD = ${data.rates.EUR} EUR</p>
          <p>💷 1 USD = ${data.rates.GBP} GBP</p>`;
        $('#currencyContent').html(html);
      });
  });

  // News Modal (placeholder)
  $('#modalNews').on('show.bs.modal', () => {
    $('#newsContent').html('<p>This is a placeholder. News API integration coming soon.</p>');
  });

  // Add Leaflet EasyButtons
  L.easyButton('fa-users', () => $('#modalDemographics').modal('show'), 'Demographics').addTo(map);
  L.easyButton('fa-globe', () => $('#modalWiki').modal('show'), 'Wikipedia').addTo(map);
  L.easyButton('fa-money-bill-wave', () => $('#modalCurrency').modal('show'), 'Currency').addTo(map);
  L.easyButton('fa-cloud-sun', () => $('#modalWeather').modal('show'), 'Weather').addTo(map);
  L.easyButton('fa-newspaper', () => $('#modalNews').modal('show'), 'News').addTo(map);
};
