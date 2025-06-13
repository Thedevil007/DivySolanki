let map = L.map('map').setView([20, 0], 2);
let borderLayer;
let cityMarkers;

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load country list from PHP backend
fetch('php/getCountryList.php')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return response.json();
  })
  .then(list => {
    if (!Array.isArray(list)) {
      throw new Error("Country list is not an array.");
    }

    list.forEach(country => {
      $('#countrySelect').append(
        $('<option>').val(country.iso_a2).text(country.name)
      );
    });
  })
  .catch(error => {
    console.error("Error loading country list:", error.message || error);
  });

// Handle country selection
$('#countrySelect').on('change', function () {
  const code = this.value;
  if (!code) return;

  // Load country border
  fetch(`php/getCountryBorder.php?code=${code}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (borderLayer) map.removeLayer(borderLayer);

      borderLayer = L.geoJSON(data).addTo(map);
      map.fitBounds(borderLayer.getBounds());

      const countryName = data.properties?.name || 'Unknown';
      $('#demographicsContent').html(`<p><strong>Country:</strong> ${countryName}</p>`);
    })
    .catch(error => {
      console.error("Error loading country border:", error.message || error);
    });

  // Load cities
  loadCityMarkers(code);
});

// Auto-select country based on geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude: lat, longitude: lng } = position.coords;
    map.setView([lat, lng], 5);

    fetch(`php/getGeocode.php?lat=${lat}&lng=${lng}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.json();
      })
      .then(data => {
        const code = data?.results?.[0]?.components?.['ISO_3166-1_alpha-2'];
        if (code) {
          $('#countrySelect').val(code).trigger('change');
        } else {
          console.warn("Geocode did not return a country code.", data);
        }
      })
      .catch(error => {
        console.error("Reverse geocoding failed:", error.message || error);
      });
  }, err => {
    console.warn("Geolocation denied or failed:", err.message || err);
  });
} else {
  console.warn("Geolocation not supported by this browser.");
}

// Load city markers (invisible or circle style)
function loadCityMarkers(countryCode) {
  fetch(`php/getCities.php?code=${countryCode}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (cityMarkers) map.removeLayer(cityMarkers);
      cityMarkers = L.layerGroup();

      const cities = data.geonames || [];

      const invisibleIcon = L.icon({
        iconUrl: '',
        iconSize: [0, 0],
        shadowSize: [0, 0]
      });

      cities.forEach(city => {
        const marker = L.marker([city.lat, city.lng], { icon: invisibleIcon })
          .bindPopup(`<strong>${city.name}</strong><br>Population: ${city.population}`);
        cityMarkers.addLayer(marker);

        // Optional: visible circle markers (uncomment if needed)
        /*
        const circle = L.circleMarker([city.lat, city.lng], {
          radius: 4,
          color: '#007bff',
          fillColor: '#007bff',
          fillOpacity: 0.7
        }).bindPopup(`<strong>${city.name}</strong><br>Population: ${city.population}`);
        cityMarkers.addLayer(circle);
        */
      });

      map.addLayer(cityMarkers);
    })
    .catch(error => {
      console.error("Error loading city markers:", error.message || error);
    });
}
