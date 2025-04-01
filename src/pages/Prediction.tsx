
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, BrainCircuit, ChevronRight, Gauge, LineChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type InputRange = {
  min: number;
  max: number;
};

type InputRanges = {
  columns: string[];
  ranges: Record<string, InputRange>;
};

const fetchInputRanges = async (): Promise<InputRanges> => {
  const response = await fetch('http://localhost:5000/api/predict/input-ranges');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch input ranges");
  }
  return response.json();
};

const makePrediction = async (inputs: Record<string, number>): Promise<{ prediction: number }> => {
  const response = await fetch('http://localhost:5000/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to make prediction");
  }
  
  return response.json();
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  'rely': 'Required Software Reliability (0.75-1.4)',
  'data': 'Database Size (0.94-1.16)',
  'cplx': 'Product Complexity (0.7-1.65)',
  'time': 'Execution Time Constraints (1.0-1.66)',
  'stor': 'Main Storage Constraint (1.0-1.56)',
  'virt': 'Virtual Machine Volatility (0.87-1.3)',
  'turn': 'Computer Turnaround Time (0.87-1.15)',
  'acap': 'Analyst Capability (0.71-1.46)',
  'aexp': 'Applications Experience (0.82-1.29)',
  'pcap': 'Programmer Capability (0.7-1.42)',
  'vexp': 'Virtual Machine Experience (0.9-1.21)',
  'lexp': 'Programming Language Experience (0.95-1.14)',
  'modp': 'Modern Programming Practices (0.82-1.24)',
  'tool': 'Use of Software Tools (0.83-1.24)',
  'sced': 'Required Development Schedule (1.0-1.23)',
  'loc': 'Lines of Code (in thousands) (1.98-1150.0)'
};

const Prediction = () => {
  const { toast } = useToast();
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  // Fetch input ranges
  const { data: inputRanges, isLoading: isLoadingRanges, error: rangesError } = useQuery({
    queryKey: ['inputRanges'],
    queryFn: fetchInputRanges,
  });

  useEffect(() => {
    if (inputRanges) {
      // Initialize all inputs with default values as empty strings
      const initialInputs: Record<string, string> = {};
      inputRanges.columns.forEach(col => {
        initialInputs[col] = '';
      });
      setUserInputs(initialInputs);
    }
  }, [inputRanges]);

  const mutation = useMutation({
    mutationFn: makePrediction,
    onSuccess: (data) => {
      setPrediction(data.prediction);
      toast({
        title: "Prediction Complete",
        description: `The predicted value is ${data.prediction.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const validateInputs = () => {
    if (!inputRanges) return false;
  
    const errors: Record<string, string> = {};
    let hasErrors = false;
  
    // Convert user inputs to number values for validation and submission
    const numericInputs: Record<string, number> = {};
  
    inputRanges.columns.forEach(col => {
      const inputValue = userInputs[col].trim();
  
      if (inputValue === '') {
        errors[col] = "Value is required";
        hasErrors = true;
      } else {
        const numValue = parseFloat(inputValue);
  
        if (isNaN(numValue)) {
          errors[col] = "Must be a number";
          hasErrors = true;
        } else {
          numericInputs[col] = numValue; // Allow any numeric value without range validation
        }
      }
    });
  
    setInputErrors(errors);
  
    if (!hasErrors) {
      return numericInputs;
    }
  
    return false;
  };  
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validInputs = validateInputs();
    
    if (validInputs) {
      mutation.mutate(validInputs);
    } else {
      toast({
        title: "Validation Error",
        description: "Please correct the input values to be within the valid ranges",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (name: string, value: string) => {
    // Allow the user to enter any value without immediate validation
    setUserInputs(prev => ({ ...prev, [name]: value }));
    
    // Clear the error for this field as the user is typing
    if (inputErrors[name]) {
      setInputErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isLoadingRanges) {
    return (
      <div className="min-h-screen gradient-bg p-4 sm:p-8">
        <div className="flex justify-center items-center h-80">
          <div className="animate-pulse text-lg text-muted-foreground">
            Loading input ranges...
          </div>
        </div>
      </div>
    );
  }

  if (rangesError) {
    return (
      <div className="min-h-screen gradient-bg p-4 sm:p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>Error Loading Prediction Model</AlertTitle>
          <AlertDescription>
            Failed to connect to the prediction API. Please ensure the backend server is running.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!inputRanges) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob bg-primary/40 w-[500px] h-[500px] -top-64 -left-64"></div>
      <div className="blob bg-accent/40 w-[600px] h-[600px] -bottom-80 -right-80 animation-delay-2000"></div>
      <div className="blob bg-primary/30 w-[300px] h-[300px] top-1/3 -right-32"></div>

      <div className="container px-4 py-12 sm:py-20 mx-auto relative z-10">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary mb-2 glow backdrop-blur-sm">
            <BrainCircuit className="w-4 h-4 mr-2 animate-pulse-light" />
            Prediction Tool
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl max-w-3xl mx-auto leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Machine Learning Prediction
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Enter values for each parameter to get a prediction from our pre-trained model.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-12 animate-slide-up">
          <Card className="shadow-lg border-opacity-40 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Prediction Form
              </CardTitle>
              <CardDescription>
                Enter values within the specified ranges to make a prediction
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inputRanges.columns.map((col) => {
                    const range = inputRanges.ranges[col];
                    
                    return (
                      <div key={col} className="space-y-2">
                        <Label htmlFor={col} className="text-sm font-medium">
                          {FEATURE_DESCRIPTIONS[col] || col}
                        </Label>
                        <Input
                          id={col}
                          type="text"
                          value={userInputs[col] || ''}
                          onChange={(e) => handleInputChange(col, e.target.value)}
                          className={`w-full ${inputErrors[col] ? 'border-red-500' : ''}`}
                        />
                        {inputErrors[col] && (
                          <p className="text-xs text-red-500">{inputErrors[col]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <Button 
                    type="submit" 
                    className="w-full relative overflow-hidden group transition-all duration-200"
                    disabled={mutation.isPending}
                  >
                    <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-primary via-accent to-primary"></span>
                    <span className="relative flex items-center justify-center gap-2">
                      {mutation.isPending ? (
                        <>Processing...</>
                      ) : (
                        <>
                          Make Prediction
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </form>

              {prediction !== null && (
                <div className="mt-8 p-4 border rounded-md bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Effort in terms of No.of required days</h3>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{Number(prediction.toFixed(2)) * 30}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to CSV Model Master
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
