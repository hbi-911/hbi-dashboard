function getRisk(heatIndex) {

    if (heatIndex >= 54)
        return "Extreme Danger";

    if (heatIndex >= 41)
        return "Danger";

    if (heatIndex >= 32)
        return "Extreme Caution";

    return "Caution";
}

async function loadHeatData() {

    const response = await fetch("heat_data.json");

    const data = await response.json();

    const tableBody =
        document.getElementById("heat-table-body");

    const topCity =
        document.getElementById("top-city");

    tableBody.innerHTML = "";

    const sorted =
        data.sort((a, b) =>
            b.heat_index - a.heat_index);

    const highest = sorted[0];

    topCity.innerHTML =
        `
        ${highest.city}<br>
        ${highest.heat_index}°C<br>
        ${getRisk(highest.heat_index)}
        `;

    sorted.forEach((city, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML =
            `
            <td>${index + 1}</td>
            <td>${city.city}</td>
            <td>${city.heat_index}°C</td>
            <td>${getRisk(city.heat_index)}</td>
            `;

        tableBody.appendChild(row);

    });

}

loadHeatData();