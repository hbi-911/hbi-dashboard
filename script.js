async function loadHeatData() {

    const response = await fetch("heat_data.json");

    const data = await response.json();

    const tableBody = document.getElementById("heat-table-body");

    tableBody.innerHTML = "";

    data.forEach((city, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${city.city}</td>
            <td>${city.heat_index}°C</td>
        `;

        tableBody.appendChild(row);

    });

}

loadHeatData();