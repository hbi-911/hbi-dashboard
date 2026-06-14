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
    data.filter(
        x => x.heat_index >= 32
    ).length;

if (stationsAbove32 >= 8)
    return `
    Recovery Failure<br>
    ${stationsAbove32}/11 stations
    above 32°C HI
    `;

if (stationsAbove32 >= 5)
    return `
    Poor Recovery<br>
    ${stationsAbove32}/11 stations
    above 32°C HI
    `;

return `
Good Recovery<br>
${stationsAbove32}/11 stations
above 32°C HI
`;

}

function getBurdenScore(data) {

const scores =
    data.map(
        x => x.heat_index + (x.humidity / 10)
    );

const avg =
    scores.reduce((a,b)=>a+b,0) /
    scores.length;

return avg.toFixed(1);

}

function getBurdenCategory(score){

if(score >= 50)
    return "SEVERE";

if(score >= 40)
    return "HIGH";

if(score >= 30)
    return "MODERATE";

return "LOW";

}

function getCityStatus(data) {

const dangerStations =
    data.filter(
        x => x.heat_index >= 41
    ).length;

if (dangerStations >= 8)
    return `
    <span class="status-danger">
    DANGER
    </span><br>
    ${dangerStations}/11 stations
    above danger threshold
    `;

if (dangerStations >= 4)
    return `
    <span class="status-warning">
    HIGH RISK
    </span><br>
    ${dangerStations}/11 stations
    above danger threshold
    `;

return `
<span class="status-safe">
MODERATE
</span><br>
Heat stress manageable
`;

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

const lastUpdate =
    document.getElementById("last-update");

const karachiStatus =
    document.getElementById("karachi-status");

const heatDivide =
    document.getElementById("heat-divide");

tableBody.innerHTML = "";

const sorted =
    data.sort(
        (a, b) => b.heat_index - a.heat_index
    );

const hottest =
    sorted[0];

const lowest =
    sorted[sorted.length - 1];

// Timestamp

const ts =
    new Date(
        hottest.timestamp.replace(" ","T")
    );

lastUpdate.innerHTML =
    "Last Updated: " +
    ts.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }) +
    " | " +
    ts.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
    }) +
    " PKT";

// Karachi Status Card

karachiStatus.innerHTML =
    getCityStatus(sorted);

// Heat Divide Card

heatDivide.innerHTML = `
Highest: ${hottest.area}
(${hottest.heat_index}°C)<br><br>

Lowest: ${lowest.area}
(${lowest.heat_index}°C)<br><br>

Difference:
${hottest.heat_index - lowest.heat_index}°C
`;

// Highest Heat Burden Card

topCity.innerHTML = `
<strong>${hottest.area}</strong><br>
${hottest.heat_index}°C Heat Index<br>
${hottest.humidity}% Humidity<br><br>

${getRisk(hottest.heat_index)}
`;

// Night Recovery Card

recoveryStatus.innerHTML =
    getNightRecoveryStatus(sorted);

// Burden Score Card

const score =
    getBurdenScore(sorted);

burdenScore.innerHTML = `
${score}<br>
${getBurdenCategory(score)} BURDEN<br><br>

City-wide heat
stress elevated
`;

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
        <td class="
        risk-${city.risk
            .toLowerCase()
            .replaceAll(' ','-')}
        ">
        ${city.risk}
        </td>
    `;

    tableBody.appendChild(row);

});

}

loadHeatData();