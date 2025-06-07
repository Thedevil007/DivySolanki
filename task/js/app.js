function getCapitalCity() {
  const country = document.getElementById("capital-country").value;

  fetch(`php/getCapitalCity.php?country=${country}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        document.getElementById("output").innerText =
          `Capital City of ${country}: ${data.capital}`;
      } else {
        document.getElementById("output").innerText =
          `Error: ${data.message || "Unknown error"}`;
      }
    })
    .catch(() => {
      document.getElementById("output").innerText = "Fetch failed.";
    });
}
