function getRisk(heatIndex) {

if (heatIndex >= 54)
    return "Extreme Danger";

if (heatIndex >= 41)
    return "Danger";

if (heatIndex >= 32)
    return "Extreme Caution";

return "Caution";


}

function getTrendIcon(trend) {

if (trend >= 2)
    return `▲ +${trend}`;

if (trend > 0)
    return `↗ +${trend}`;

if (trend <= -2)
    return `▼ ${trend}`;

if (trend < 0)
    return `↘ ${trend}`;

return "▬ 0";


}

function getNightRecoveryStatus(data) {

const stationsAbove32 =
    data.filter(
        x => x.heat_index >= 32
    ).length;

let status = "GOOD RECOVERY";

if (stationsAbove32 >= 8)
    status = "RECOVERY FAILURE";

else if (stationsAbove32 >= 5)
    status = "POOR RECOVERY";

return `
<div class="hero-value">
${stationsAbove32}/11
</div>

<div class="hero-status">
${status}
</div>

<div class="hero-label">
Above 32°C HI
</div>
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

let status = "MODERATE";
let cssClass = "status-safe";

if (dangerStations >= 8) {
    status = "DANGER";
    cssClass = "status-danger";
}
else if (dangerStations >= 4) {
    status = "HIGH RISK";
    cssClass = "status-warning";
}

return `
    <div class="hero-value">
    ${dangerStations}/11
    </div>

    <div class="hero-status ${cssClass}">
    ${status}
    </div>

    <div class="hero-label">
    Stations in Danger
    </div>
`;
}

function getTrendStatus(data) {

let worsening = 0;
let improving = 0;
let stable = 0;

data.forEach(station => {

    if (station.trend > 0)
        worsening++;

    else if (station.trend < 0)
        improving++;

    else
        stable++;

});

let status = "STABLE";

if (worsening > improving)
    status = "HEATING UP";

if (improving > worsening)
    status = "COOLING";

return `
<div class="hero-value">
${stable}/${data.length}
</div>

<div class="hero-status">
${status}
</div>

<div class="hero-label">
Network Trend
</div>
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

const trendStatus =
    document.getElementById("trend-status");

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
    "Updated " +
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

// Trend Card

if (trendStatus) {
    trendStatus.innerHTML =
        getTrendStatus(sorted);
}

// Heat Divide Card

heatDivide.innerHTML = `
<div class="hero-value">
${hottest.heat_index - lowest.heat_index}°C
</div>

<div class="hero-status">
URBAN HEAT DIVIDE
</div>

<div class="hero-label">
${hottest.area} → ${lowest.area}
</div>
`;

// Highest Heat Burden Card

topCity.innerHTML = `
<div class="hero-value">
${hottest.heat_index}°C
</div>

<div class="hero-status">
${hottest.area}
</div>

<div class="hero-label">
Highest Heat Burden
</div>

<div class="hero-small">
${hottest.humidity}% RH
</div>
`;

// Night Recovery Card

recoveryStatus.innerHTML =
    getNightRecoveryStatus(sorted);

// Burden Score Card

const score =
    getBurdenScore(sorted);

burdenScore.innerHTML = `
<div class="hero-value">
${score}
</div>

<div class="hero-status">
${getBurdenCategory(score)}
</div>

<div class="hero-label">
Karachi Burden Score
</div>
`;

// Leaderboard

sorted.forEach((city, index) => {

    const row =
        document.createElement("tr");

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${city.area}</td>
        <td>${city.heat_index}°C</td>
        <td>${getTrendIcon(city.trend)}</td>
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
