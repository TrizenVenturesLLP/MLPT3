
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score

def evaluate_regression_model(model, X_train, X_test, y_train, y_test):
    """
    Trains and evaluates a regression model.
    
    Returns:
        Dictionary with model performance metrics
    """
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    return {
        "mae": float(mae),
        "mse": float(mse),
        "rmse": float(rmse),
        "r2": float(r2)
    }

def evaluate_classification_model(model, X_train, X_test, y_train, y_test):
    """
    Trains and evaluates a classification model.
    
    Returns:
        Dictionary with model performance metrics
    """
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    
    return {
        "accuracy": float(accuracy)
    }

def evaluate_models(models, data, model_type='regression'):
    """
    Evaluates multiple models and returns their performance metrics.
    
    Args:
        models: Dictionary of model instances
        data: Dictionary with training and test data
        model_type: 'regression' or 'classification'
        
    Returns:
        List of dictionaries with model names and performance metrics
    """
    X_train, X_test = data['X_train'], data['X_test']
    y_train, y_test = data['y_train'], data['y_test']
    
    results = []
    best_model = None
    best_score = float('-inf')  # For both accuracy and R2
    
    for name, model in models.items():
        if model_type == 'regression':
            metrics = evaluate_regression_model(model, X_train, X_test, y_train, y_test)
            score = metrics["r2"]
        else:
            metrics = evaluate_classification_model(model, X_train, X_test, y_train, y_test)
            score = metrics["accuracy"]
        
        model_result = {"name": name}
        model_result.update(metrics)
        
        if score > best_score:
            best_score = score
            best_model = name
            
        results.append(model_result)
    
    # Sort results
    if model_type == 'regression':
        results = sorted(results, key=lambda x: x.get("r2", 0), reverse=True)
    else:
        results = sorted(results, key=lambda x: x.get("accuracy", 0), reverse=True)
    
    return results, best_model, best_score
