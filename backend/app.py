
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile

# Import our modules
from models.regression_models import get_regression_models
from models.classification_models import get_classification_models
from utils.data_processor import load_and_preprocess_data
from utils.model_evaluator import evaluate_models
from models.prediction_model import prediction_model

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/process', methods=['POST'])
def process_csv():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    target_variable = request.form.get('target_variable')
    if not target_variable:
        return jsonify({"error": "No target variable specified"}), 400

    model_type = request.form.get('model_type', 'regression')
    if model_type not in ['regression', 'classification']:
        return jsonify({"error": "Invalid model type. Must be 'regression' or 'classification'"}), 400
    
    # Save the uploaded file temporarily
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    file.save(temp_file.name)
    temp_file.close()
    
    try:
        # Process data
        data = load_and_preprocess_data(temp_file.name, target_variable, model_type)
        
        # Get appropriate models based on model type
        if model_type == 'regression':
            models = get_regression_models()
        else:  # classification
            models = get_classification_models()
        
        # Evaluate models
        results, best_model, best_score = evaluate_models(models, data, model_type)
        
        response = {
            "results": results,
            "best_model": best_model,
            "model_type": model_type,
            "target_variable": target_variable
        }
        
        # Add classification-specific data
        if model_type == 'classification' and data['class_distribution']:
            response["class_distribution"] = data['class_distribution']
            response["best_accuracy"] = float(best_score)
        
        # Add regression-specific data
        if model_type == 'regression':
            response["best_r2_score"] = float(best_score)
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)

@app.route('/api/predict/input-ranges', methods=['GET'])
def get_input_ranges():
    """Return the valid input ranges for each feature in the prediction model."""
    try:
        ranges = prediction_model.get_input_ranges()
        return jsonify(ranges), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def make_prediction():
    """Make a prediction using the user inputs."""
    try:
        data = request.json
        if not data or not isinstance(data, dict) or 'inputs' not in data:
            return jsonify({"error": "Invalid request format. Expected JSON with 'inputs' field."}), 400
        
        inputs = data['inputs']
        if not isinstance(inputs, dict) or not all(col in inputs for col in prediction_model.columns):
            missing = set(prediction_model.columns) - set(inputs.keys())
            return jsonify({
                "error": f"Missing required inputs: {', '.join(missing)}",
                "required_inputs": prediction_model.columns
            }), 400
            
        # Convert inputs to list in the correct order
        user_inputs = [float(inputs[col]) for col in prediction_model.columns]
        
        # Make prediction
        prediction = prediction_model.predict(user_inputs)
        
        return jsonify({
            "prediction": prediction,
            "inputs": inputs
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # Initialize model files if needed
    try:
        from utils.init_models import init_models
        init_models()
    except Exception as e:
        print(f"Warning: Could not initialize models: {e}")
        
    app.run(debug=True, host='0.0.0.0', port=5000)
