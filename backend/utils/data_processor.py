
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from collections import Counter

def load_and_preprocess_data(file_path, target_variable, model_type='regression'):
    """
    Loads and preprocesses data for model training.
    
    Args:
        file_path: Path to the CSV file
        target_variable: Name of the target column
        model_type: 'regression' or 'classification'
        
    Returns:
        Preprocessed data and metadata
    """
    # Load dataset
    df = pd.read_csv(file_path)
    
    # Check if target variable exists in dataset
    if target_variable not in df.columns:
        raise ValueError(f"Target variable '{target_variable}' not found in dataset")
    
    # Handle missing values - Handle numerical columns first
    for column in df.select_dtypes(include=np.number):
        df[column].fillna(df[column].mean(), inplace=True)
    
    # For other columns, fill with most frequent value
    for column in df.select_dtypes(exclude=np.number):
        df[column].fillna(df[column].mode()[0], inplace=True)
    
    # Separate features (X) and target (y)
    X = df.drop(columns=[target_variable])
    y = df[target_variable]

    class_distribution = None
    encoded_class_names = None

    # For classification, encode the target if it's categorical
    if model_type == 'classification' and y.dtype == 'object':
        le = LabelEncoder()
        original_classes = y.unique().tolist()
        y = le.fit_transform(y)
        encoded_class_names = dict(zip(range(len(le.classes_)), le.classes_))
        # Get class distribution
        class_distribution = dict(Counter(y))
        class_distribution = {encoded_class_names.get(k, str(k)): int(v) for k, v in class_distribution.items()}
    
    # Convert categorical independent variables to numerical (if any)
    X = pd.get_dummies(X, drop_first=True)
    
    # Standardize numerical features
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    return {
        'X_train': X_train,
        'X_test': X_test,
        'y_train': y_train,
        'y_test': y_test,
        'class_distribution': class_distribution,
        'encoded_class_names': encoded_class_names
    }
