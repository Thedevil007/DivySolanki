let map = L.map('map').setView([20, 0], 2);
let borderLayer;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load countries into dropdown
fetch('php/getCountryList.php')
  .then(res => res.json())
  .then(list => {
    if (!Array.isArray(list)) {
      console.error('Invalid response from getCountryList.php');
      return;
    }
    list.forEach(country => {
      $('#countrySelect').append(
        $('<option>').val(country.iso).text(country.name)
      );
    });
  })
  .catch(err => console.error("Country list fetch failed:", err));

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

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    map.setView([lat, lng], 5);

    fetch(`php/getGeocode.php?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        const code = data.results[0].components['ISO_3166-1_alpha-2'];
        $('#countrySelect').val(code).trigger('change');
      });
  });
}

// Wikipedia
$('#modalWiki').on('show.bs.modal', () => {
  const { lat, lng } = map.getCenter();
  fetch(`php/getWikipedia.php?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {
      const articles = data.geonames || [];
      if (articles.length === 0) {
        $('#wikiContent').html('<p>No nearby Wikipedia entries found.</p>');
        return;
      }
      const html = '<ul>' + articles.map(a =>
        `<li><a href="https://${a.wikipediaUrl}" target="_blank">${a.title}</a><br><small>${a.summary}</small></li>`
      ).join('') + '</ul>';
      $('#wikiContent').html(html);
    });
});

// Weather
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

// Currency
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

// News
$('#modalNews').on('show.bs.modal', () => {
  $('#newsContent').html('<p>This is a placeholder. News API integration coming soon.</p>');
});
