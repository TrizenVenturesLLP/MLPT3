import os
import joblib
import numpy as np
from pathlib import Path
import pickle

class PredictionModel:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "../models/extra_trees_model.pkl")
        self.min_max_path = os.path.join(os.path.dirname(__file__), "../models/min_max.pkl")
        
        # Check if model files exist; if not, create placeholder data
        self._initialize_model_files()
        
        # Load model and min-max values
        self.model = joblib.load(self.model_path)
        self.min_max_dict = joblib.load(self.min_max_path)
        
        # Column names required for the model
        self.columns = ['rely', 'data', 'cplx', 'time', 'stor', 'virt', 'turn', 
                        'acap', 'aexp', 'pcap', 'vexp', 'lexp', 'modp', 'tool', 
                        'sced', 'loc']
        
    def _initialize_model_files(self):
        """Create placeholder model files if they don't exist."""
        models_dir = os.path.join(os.path.dirname(__file__), "../models")
        Path(models_dir).mkdir(parents=True, exist_ok=True)
        
        # Create placeholder model file if it doesn't exist
        if not os.path.exists(self.model_path):
            from sklearn.ensemble import ExtraTreesRegressor
            model = ExtraTreesRegressor(n_estimators=50, random_state=42)
            X_dummy = np.random.rand(100, 16)
            y_dummy = np.random.rand(100)
            model.fit(X_dummy, y_dummy)
            joblib.dump(model, self.model_path)
            print("Created placeholder model file")
            
        # Create placeholder min-max dictionary if it doesn't exist
        if not os.path.exists(self.min_max_path):
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
            joblib.dump(min_max_dict, self.min_max_path)
            print("Created min-max dictionary with specific ranges")

    def get_input_ranges(self):
        """Return the valid input ranges for each feature."""
        return {
            'columns': self.columns,
            'ranges': {
                col: {
                    'min': float(self.min_max_dict['min'][col]),
                    'max': float(self.min_max_dict['max'][col])
                } for col in self.columns
            }
        }
    
    def predict(self, user_inputs):
        """Make a prediction using the model."""
        if len(user_inputs) != len(self.columns):
            raise ValueError(f"Expected {len(self.columns)} inputs, got {len(user_inputs)}")
            
        # Scale the inputs
        scaled_inputs = []
        for i, col in enumerate(self.columns):
            min_val = self.min_max_dict['min'][col]
            max_val = self.min_max_dict['max'][col]

            # Apply min-max scaling
            scaled_val = (user_inputs[i] - min_val) / (max_val - min_val)
            scaled_inputs.append(scaled_val)
            
        # Make prediction
        prediction = self.model.predict([scaled_inputs])[0]
        return float(prediction)

# Initialize the model
prediction_model = PredictionModel()