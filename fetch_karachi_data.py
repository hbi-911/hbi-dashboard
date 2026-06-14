import requests
import json
import os
from datetime import datetime

# ==========================
# CONFIGURATION
# ==========================

import os

API_KEY = os.getenv("WU_API_KEY")

if not API_KEY:
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

        print(f"{station_id}: {response.status_code}")

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
# CALCULATE TRENDS
# ==========================



previous_snapshot = None

if os.path.exists("history.json"):

    try:

        with open("history.json", "r") as f:

            history = json.load(f)

            if len(history) > 0:
                    previous_snapshot = history[-1]

    except:
        previous_snapshot = None

    if previous_snapshot:

        previous_stations = {
        s["station_id"]: s
        for s in previous_snapshot["stations"]
}

for station in results:

    previous = previous_stations.get(
        station["station_id"]
    )

    if previous:

        delta = (
            station["heat_index"]
            - previous["heat_index"]
        )

        station["trend"] = delta

    else:

        station["trend"] = 0

else:

    for station in results:

        station["trend"] = 0

# ==========================
# SAVE CURRENT DATA
# ==========================

with open("heat_data.json", "w") as f:

    json.dump(results, f, indent=2)

print("\nSaved heat_data.json")

# ==========================
# APPEND HISTORY
# ==========================

history_file = "history.json"

if os.path.exists(history_file):
    with open(history_file, "r") as f:
        try:
            history = json.load(f)
        except:
            history = []
else:
    history = []

snapshot = {
"timestamp": results[0]["timestamp"],
"stations": results
}

history.append(snapshot)

# Keep only latest 5000 snapshots

history = history[-5000:]

with open(history_file, "w") as f:
    json.dump(history, f, indent=2)

print("Saved history.json")