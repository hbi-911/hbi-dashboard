import requests
import json

# ==========================
# CONFIGURATION
# ==========================

API_KEY = "e1f10a1e78da46f5b10a1e78da96f525"

stations = {
    "IKARAC12": "Karachi Central",
    "IKARAC52": "DHA",
    "IKARAC56": "Bath Island",
    "IKARAC64": "Baldia",
    "IKARAC41": "Surjani",
    "IKARAC90": "DHA City",
    "IKARAC72": "DHA Phase 2",
    "IKARAC38": "Tank Chowk",
    "IKARAC79": "Gulshan-e-Roomi",
    "IKARAC13": "NEDUET",
    "IKARAC25": "Saadi Town"
}

# ==========================
# RISK CLASSIFICATION
# ==========================

def get_risk(heat_index):

    if heat_index >= 54:
        return "Extreme Danger"

    elif heat_index >= 41:
        return "Danger"

    elif heat_index >= 32:
        return "Extreme Caution"

    elif heat_index >= 27:
        return "Caution"

    return "Normal"

# ==========================
# FETCH DATA
# ==========================

results = []

for station_id, area in stations.items():

    url = (
        f"https://api.weather.com/v2/pws/observations/current"
        f"?stationId={station_id}"
        f"&format=json"
        f"&units=m"
        f"&apiKey={API_KEY}"
    )

    try:

        response = requests.get(url, timeout=20)

        data = response.json()

        obs = data["observations"][0]

        heat_index = obs["metric"]["heatIndex"]

        results.append({

            "area": area,
            "station_id": station_id,
            "timestamp": obs["obsTimeLocal"],
            "temperature": obs["metric"]["temp"],
            "humidity": obs["humidity"],
            "heat_index": heat_index,
            "risk": get_risk(heat_index),
            "latitude": obs["lat"],
            "longitude": obs["lon"]

        })

        print(f"✓ {area}")

    except Exception as e:

        print(f"✗ {area}: {e}")

# ==========================
# SORT HOTTEST FIRST
# ==========================

results.sort(
    key=lambda x: x["heat_index"],
    reverse=True
)

# ==========================
# SAVE JSON
# ==========================

with open("heat_data.json", "w") as f:

    json.dump(results, f, indent=2)

print("\nSaved heat_data.json")