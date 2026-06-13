function getRisk(heatIndex) {

if (heatIndex >= 54)
    return "Extreme Danger";

if (heatIndex >= 41)
    return "Danger";

if (heatIndex >= 32)
    return "Extreme Caution";

return "Caution";

}

function getNightRecoveryStatus(data) {

const stationsAbove32 =
    data.filter(x => x.heat_index >= 32).length;

if (stationsAbove32 >= 8)
    return `
Critical Recovery Failure<br>
${stationsAbove32}/${data.length} stations above 32°C HI
`;

if (stationsAbove32 >= 5)
    return `
Limited Recovery<br>
${stationsAbove32}/${data.length} stations above 32°C HI
`;

return `
Good Recovery<br>
${stationsAbove32}/${data.length} stations above 32°C HI
`;

}

function getBurdenScore(data) {

const scores =
    data.map(
        x => x.heat_index + (x.humidity / 10)
    );

const avg =
    scores.reduce((a, b) => a + b, 0) /
    scores.length;

return avg.toFixed(1);

}

async function loadHeatData() {

const response =
    await fetch("heat_data.json");

const data =
    await response.json();

const tableBody =
    document.getElementById("heat-table-body");

const topCity =
    document.getElementById("top-city");

const recoveryStatus =
    document.getElementById("recovery-status");

const burdenScore =
    document.getElementById("burden-score");

tableBody.innerHTML = "";

const sorted =
    data.sort(
        (a, b) => b.heat_index - a.heat_index
    );

const hottest =
    sorted[0];

// Highest Heat Burden Card

topCity.innerHTML = `
    <strong>${hottest.area}</strong><br>
    ${hottest.heat_index}°C Heat Index<br>
    ${hottest.humidity}% Humidity
`;

// Night Recovery Card

recoveryStatus.innerHTML =
    getNightRecoveryStatus(sorted);

// Burden Score Card

burdenScore.innerHTML =
    getBurdenScore(sorted);

// Leaderboard

sorted.forEach((city, index) => {

    const row =
        document.createElement("tr");

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${city.area}</td>
        <td>${city.heat_index}°C</td>
        <td>${city.temperature}°C</td>
        <td>${city.humidity}%</td>
        <td>${city.risk}</td>
    `;

    tableBody.appendChild(row);

});

}

loadHeatData();