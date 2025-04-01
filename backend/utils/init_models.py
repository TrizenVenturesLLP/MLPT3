
"""
Script to initialize model files if they don't exist.
Run this script before starting the Flask app to ensure all model files are created.
"""

import os
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import ExtraTreesRegressor

def init_models():
    """Initialize all models and data files needed for the application."""
    models_dir = os.path.join(os.path.dirname(__file__), "../models")
    Path(models_dir).mkdir(parents=True, exist_ok=True)
    
    model_path = os.path.join(models_dir, "extra_trees_model.pkl")
    min_max_path = os.path.join(models_dir, "min_max.pkl")
    
    # Create placeholder model file
    if not os.path.exists(model_path):
        model = ExtraTreesRegressor(n_estimators=50, random_state=42)
        X_dummy = np.random.rand(100, 16)
        y_dummy = np.random.rand(100)
        model.fit(X_dummy, y_dummy)
        joblib.dump(model, model_path)
        print(f"Created placeholder model file at {model_path}")
    else:
        print(f"Model file already exists at {model_path}")
    
    # Create min-max dictionary with specific ranges
    if not os.path.exists(min_max_path):
        min_max_dict = {
            'min': {
                'rely': 0.75, 'data': 0.94, 'cplx': 0.7, 'time': 1.0,
                'stor': 1.0, 'virt': 0.87, 'turn': 0.87, 'acap': 0.71,
                'aexp': 0.82, 'pcap': 0.7, 'vexp': 0.9, 'lexp': 0.95,
                'modp': 0.82, 'tool': 0.83, 'sced': 1.0, 'loc': 1.98
            },
            'max': {
                'rely': 1.4, 'data': 1.16, 'cplx': 1.65, 'time': 1.66,
                'stor': 1.56, 'virt': 1.3, 'turn': 1.15, 'acap': 1.46,
                'aexp': 1.29, 'pcap': 1.42, 'vexp': 1.21, 'lexp': 1.14,
                'modp': 1.24, 'tool': 1.24, 'sced': 1.23, 'loc': 1150.0
            }
        }
        joblib.dump(min_max_dict, min_max_path)
        print(f"Created min-max dictionary with specific ranges at {min_max_path}")
    else:
        print(f"Min-max file already exists at {min_max_path}")

if __name__ == "__main__":
    init_models()
    print("Model initialization complete!")
