
import { ModelResult } from "@/components/ModelCard";

// Function to parse CSV content
export const parseCSV = (content: string): { headers: string[], data: string[][] } => {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => line.split(',').map(cell => cell.trim()));
  
  return { headers, data };
};

// Function to process CSV with the Flask backend
export const processCSV = async (
  file: File, 
  targetVariable: string,
  modelType: 'regression' | 'classification' = 'regression'
): Promise<{ 
  results: ModelResult[], 
  targetVariable: string,
  modelType: 'regression' | 'classification',
  classDistribution?: Record<string, number> 
}> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_variable', targetVariable);
    formData.append('model_type', modelType);
    
    const response = await fetch('http://localhost:5000/api/process', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process CSV');
    }
    
    const data = await response.json();
    
    // Map the backend response to our frontend model format
    const results: ModelResult[] = data.results.map((model: any) => {
      if (modelType === 'regression') {
        return {
          name: model.name,
          mae: model.mae,
          mse: model.mse,
          rmse: model.rmse,
          r2: model.r2
        };
      } else {
        return {
          name: model.name,
          accuracy: model.accuracy
        };
      }
    });
    
    return { 
      results, 
      targetVariable: data.target_variable,
      modelType: data.model_type,
      classDistribution: data.class_distribution
    };
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw error;
  }
};
