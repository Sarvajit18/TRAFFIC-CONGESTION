"""
TrafficAI - Automated Model Training & Synthetic Dataset Generator
Generates spatial-temporal traffic time series and fits Random Forest & Gradient Boosting regressors.
"""

import numpy as np
import pandas as pd
from model import TrafficPredictionModel
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def generate_synthetic_traffic_dataset(num_samples: int = 5000):
    np.random.seed(42)

    hours = np.random.uniform(0, 24, num_samples)
    days = np.random.randint(0, 7, num_samples)
    weather_indices = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.7, 0.18, 0.08, 0.04])
    incident_indices = np.random.choice([0, 1, 2, 3, 4], size=num_samples, p=[0.8, 0.1, 0.04, 0.04, 0.02])
    capacities = np.random.choice([1800, 2400, 2800, 3600, 4000], size=num_samples)
    speed_limits = np.random.choice([50, 60, 70, 80, 90], size=num_samples)

    speeds = []
    volumes = []

    weather_penalties = [1.0, 0.75, 0.65, 0.52]
    incident_penalties = [1.0, 0.65, 0.35, 0.70, 0.85]

    for i in range(num_samples):
        h = hours[i]
        cap = capacities[i]
        spd_lim = speed_limits[i]
        w_pen = weather_penalties[weather_indices[i]]
        inc_pen = incident_penalties[incident_indices[i]]

        morning = np.exp(-((h - 9.0) / 1.5) ** 2) * 0.9
        evening = np.exp(-((h - 18.0) / 1.8) ** 2) * 1.1
        surge = 0.35 + morning + evening + np.random.normal(0, 0.05)

        vol = min(cap * 1.1, cap * 0.45 * surge)
        spd = max(8.0, spd_lim * (1.0 - (vol / cap) * 0.6) * w_pen * inc_pen + np.random.normal(0, 1.5))

        volumes.append(vol)
        speeds.append(spd)

    hour_sin = np.sin((hours / 24.0) * 2 * np.pi)
    hour_cos = np.cos((hours / 24.0) * 2 * np.pi)

    X = np.column_stack([hour_sin, hour_cos, days, weather_indices, incident_indices, capacities, speed_limits])
    y = np.array(speeds)

    return X, y

def run_training():
    print("Generating synthetic spatial-temporal dataset...")
    X, y = generate_synthetic_traffic_dataset(6000)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = TrafficPredictionModel()
    print("Fitting Random Forest Regressor...")
    model.train(X_train, y_train)

    preds = model.model.predict(model.scaler.transform(X_test))
    r2 = r2_score(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))

    print(f"Model Training Complete! R2: {r2:.4f}, RMSE: {rmse:.2f} km/h")

if __name__ == "__main__":
    run_training()
