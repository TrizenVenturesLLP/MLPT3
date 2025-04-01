import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import ProcessingStatus from "@/components/ProcessingStatus";
import ResultsDisplay from "@/components/ResultsDisplay";
import { ModelResult } from "@/components/ModelCard";
import { processCSV } from "@/utils/csvProcessor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown, BarChart2, TableProperties, Sparkles, Database, AreaChart, PieChart, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetVariable, setTargetVariable] = useState("");
  const [modelType, setModelType] = useState<'regression' | 'classification'>('regression');
  const [processing, setProcessing] = useState<"idle" | "processing" | "complete" | "error">("idle");
  const [results, setResults] = useState<ModelResult[]>([]);
  const [classDistribution, setClassDistribution] = useState<Record<string, number> | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setProcessing("idle");
    setResults([]);
    setErrorMessage("");
    setClassDistribution(undefined);
    toast({
      title: "File uploaded successfully",
      description: "Now specify the target variable to analyze.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    if (!targetVariable.trim()) {
      toast({
        title: "Target variable required",
        description: "Please specify the target variable for prediction.",
        variant: "destructive",
      });
      return;
    }

    setProcessing("processing");
    setResults([]);
    setErrorMessage("");
    setClassDistribution(undefined);

    try {
      const { results, targetVariable: processedTarget, modelType: resultModelType, classDistribution } = 
        await processCSV(file, targetVariable, modelType);
      
      setResults(results);
      setTargetVariable(processedTarget);
      setClassDistribution(classDistribution);
      setProcessing("complete");

      let successMessage = "";
      if (modelType === 'regression') {
        const bestR2 = Math.max(...results.map(r => r.r2 || 0)).toFixed(4);
        successMessage = `Found ${results.length} models with best R² of ${bestR2}`;
      } else {
        const bestAccuracy = Math.max(...results.map(r => r.accuracy || 0));
        successMessage = `Found ${results.length} models with best accuracy of ${(bestAccuracy * 100).toFixed(2)}%`;
      }

      toast({
        title: "Analysis complete",
        description: successMessage,
      });
    } catch (error) {
      console.error("Processing error:", error);
      setProcessing("error");
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob bg-primary/40 w-[500px] h-[500px] -top-64 -left-64"></div>
      <div className="blob bg-accent/40 w-[600px] h-[600px] -bottom-80 -right-80 animation-delay-2000"></div>
      <div className="blob bg-primary/30 w-[300px] h-[300px] top-1/3 -right-32"></div>

      <div className="container px-4 py-12 sm:py-20 mx-auto relative z-10">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary mb-2 glow backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse-light" />
            CSV Model Master
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl max-w-3xl mx-auto leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Intelligent Model Selection for Your Data
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload your CSV, select your target variable, and we'll find the best machine learning model for your prediction or classification task.
          </p>
          <div className="pt-2">
            <Link to="/prediction">
              <Button variant="outline" className="group">
                Try Prediction Tool
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 space-y-16 animate-slide-up">
          <FileUpload 
            onFileUpload={handleFileUpload} 
            disabled={processing === "processing"} 
          />

          <div className="w-full max-w-md mx-auto">
            <div className="gradient-border p-8 backdrop-blur-sm rounded-xl bg-white/40 dark:bg-gray-900/40">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Model Type
                  </label>
                  <Select
                    value={modelType}
                    onValueChange={(value: 'regression' | 'classification') => setModelType(value)}
                    disabled={!file || processing === "processing"}
                  >
                    <SelectTrigger className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Analysis Type</SelectLabel>
                        <SelectItem value="regression" className="flex items-center">
                          <div className="flex items-center gap-2">
                            <AreaChart className="w-4 h-4 text-muted-foreground" />
                            <span>Regression</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="classification">
                          <div className="flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-muted-foreground" />
                            <span>Classification</span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {modelType === 'regression' 
                      ? "Choose regression to predict continuous values." 
                      : "Choose classification to predict categories or classes."
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="targetVariable" className="block text-sm font-medium flex items-center gap-2">
                    <TableProperties className="w-4 h-4 text-primary" />
                    Target Variable
                  </label>
                  <div className="relative">
                    <Input
                      id="targetVariable"
                      value={targetVariable}
                      onChange={(e) => setTargetVariable(e.target.value)}
                      placeholder="Enter column name to predict"
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
                      disabled={!file || processing === "processing"}
                    />
                    <Database className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is the column your models will {modelType === 'regression' ? 'predict' : 'classify'}.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden group transition-all duration-200"
                  disabled={!file || !targetVariable.trim() || processing === "processing"}
                >
                  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-primary via-accent to-primary"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {processing === "processing" ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Find Best Model
                        <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </div>
          </div>

          <ProcessingStatus 
            status={processing} 
            message={processing === "error" ? errorMessage : undefined} 
          />
          
          {processing === "complete" && results.length > 0 && (
            <ResultsDisplay 
              results={results} 
              targetVariable={targetVariable} 
              modelType={modelType}
              classDistribution={classDistribution}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
