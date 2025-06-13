let map = L.map('map').setView([20, 0], 2);
let borderLayer;

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load countries into dropdown from PHP backend
fetch('php/getCountryList.php')
  .then(response => response.json())
  .then(list => {
    // Check if list is a valid array
    if (!Array.isArray(list)) {
      console.error("getCountryList.php did not return a valid array:", list);
      return;
    }

    list.forEach(country => {
      $('#countrySelect').append(
        $('<option>').val(country.iso).text(country.name)
      );
    });
  })
  .catch(error => console.error("Error loading country list:", error));

// When user selects a country
$('#countrySelect').on('change', function () {
  const code = this.value;
  if (!code) return;

  fetch(`php/getCountryBorder.php?code=${code}`)
    .then(response => response.json())
    .then(data => {
      // Remove previous border layer if any
      if (borderLayer) map.removeLayer(borderLayer);

      // Add new GeoJSON border
      borderLayer = L.geoJSON(data).addTo(map);
      map.fitBounds(borderLayer.getBounds());

      // Update modal with country name
      $('#demographicsContent').html(`<p><strong>Country:</strong> ${data.properties.name}</p>`);
    })
    .catch(error => console.error("Error loading country border:", error));
});

// Attempt to locate user via browser
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    map.setView([lat, lng], 5);

    // Send lat/lng to backend to get country code
    fetch(`php/getGeocode.php?lat=${lat}&lng=${lng}`)
      .then(response => response.json())
      .then(data => {
        if (
          data &&
          data.results &&
          data.results[0] &&
          data.results[0].components &&
          data.results[0].components['ISO_3166-1_alpha-2']
        ) {
          const countryCode = data.results[0].components['ISO_3166-1_alpha-2'];
          $('#countrySelect').val(countryCode).trigger('change');
        } else {
          console.warn("Geocode API returned unexpected structure:", data);
        }
      })
      .catch(error => console.error("Reverse geocoding failed:", error));
  }, err => {
    console.warn("Geolocation failed or permission denied:", err);
  });
} else {
  console.warn("Geolocation not supported in this browser.");
}
