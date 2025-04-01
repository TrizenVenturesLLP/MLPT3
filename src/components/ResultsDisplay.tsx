
import React, { useState } from "react";
import { ModelResult } from "./ModelCard";
import ModelCard from "./ModelCard";
import { Trophy, ScrollText, BarChart2, Sparkles, Star, BrainCircuit, PieChart, AreaChart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsDisplayProps {
  results: ModelResult[];
  targetVariable: string;
  modelType: 'regression' | 'classification';
  classDistribution?: Record<string, number>;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  targetVariable, 
  modelType,
  classDistribution 
}) => {
  const [sortBy, setSortBy] = useState<string>(
    modelType === 'regression' ? 'r2' : 'accuracy'
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Find the best model based on R² score or accuracy
  const bestModel = results.reduce((best, current) => {
    if (modelType === 'regression') {
      return (current.r2 || 0) > ((best?.r2 || 0)) ? current : best;
    } else {
      return (current.accuracy || 0) > ((best?.accuracy || 0)) ? current : best;
    }
  }, results[0]);
  
  // Sort models based on selected criteria
  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortBy as keyof ModelResult] || 0;
    const bValue = b[sortBy as keyof ModelResult] || 0;
    
    if (sortOrder === "asc") {
      return (aValue as number) - (bValue as number);
    } else {
      return (bValue as number) - (aValue as number);
    }
  });

  // Calculate total samples for class distribution
  const totalSamples = classDistribution 
    ? Object.values(classDistribution).reduce((sum, val) => sum + val, 0)
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 animate-fade-in">
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary/20 to-accent/20 text-primary mb-2 glow backdrop-blur-sm">
          <Sparkles className="w-4 h-4 mr-2 animate-pulse-light" />
          Results Ready
        </div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {modelType === 'regression' ? 'Regression' : 'Classification'} Model Comparison
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analysis complete for {modelType === 'regression' ? 'predicting' : 'classifying'}{" "}
          <span className="font-semibold text-foreground">{targetVariable}</span>. 
          We've evaluated {results.length} {modelType} models to find the best fit for your data.
        </p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <TabsList className="h-10 p-1 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
            <TabsTrigger value="summary" className="text-sm h-8 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20">
              {modelType === 'regression' ? 
                <AreaChart className="w-4 h-4 mr-2" /> :
                <BarChart2 className="w-4 h-4 mr-2" />
              }
              Summary
            </TabsTrigger>
            <TabsTrigger value="allModels" className="text-sm h-8 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20">
              <ScrollText className="w-4 h-4 mr-2" />
              All Models
            </TabsTrigger>
            {modelType === 'classification' && classDistribution && (
              <TabsTrigger value="distribution" className="text-sm h-8 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20">
                <PieChart className="w-4 h-4 mr-2" />
                Class Distribution
              </TabsTrigger>
            )}
          </TabsList>
          
          <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-900/40 p-1.5 rounded-lg backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[120px] h-8 bg-transparent border-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {modelType === 'regression' ? (
                  <>
                    <SelectItem value="r2">R² Score</SelectItem>
                    <SelectItem value="rmse">RMSE</SelectItem>
                    <SelectItem value="mae">MAE</SelectItem>
                    <SelectItem value="mse">MSE</SelectItem>
                  </>
                ) : (
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 rounded-md hover:bg-accent/10 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <TabsContent value="summary" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={cn(
              "col-span-1 md:col-span-2",
              "gradient-border p-8 rounded-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-md shadow-glow"
            )}>
              <div className="flex items-start space-x-6 flex-wrap sm:flex-nowrap gap-y-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Best Performing Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on {modelType === 'regression' ? 'highest R² score' : 'highest accuracy'}
                  </p>
                  
                  <div className="mt-6 flex items-center flex-wrap sm:flex-nowrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                      <span className="text-xl font-bold text-foreground">
                        {bestModel.name}
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {modelType === 'regression' ? 'R² Score:' : 'Accuracy:'}
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {modelType === 'regression' 
                          ? bestModel.r2?.toFixed(4) 
                          : bestModel.accuracy 
                            ? `${(bestModel.accuracy * 100).toFixed(2)}%`
                            : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {modelType === 'regression' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                  <div className="space-y-1 p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      RMSE
                    </p>
                    <p className="text-2xl font-bold">{bestModel.rmse?.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">
                      Root Mean Squared Error
                    </p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      MAE
                    </p>
                    <p className="text-2xl font-bold">{bestModel.mae?.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">
                      Mean Absolute Error
                    </p>
                  </div>
                  <div className="space-y-1 p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      MSE
                    </p>
                    <p className="text-2xl font-bold">{bestModel.mse?.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">
                      Mean Squared Error
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      Accuracy
                    </p>
                    <p className="text-2xl font-bold">
                      {bestModel.accuracy ? `${(bestModel.accuracy * 100).toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${bestModel.accuracy ? bestModel.accuracy * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Proportion of correctly classified instances in the test set
                  </p>
                </div>
              )}
            </div>
            
            {/* Top 3 models */}
            {sortedResults.slice(0, 3).map((model) => (
              <ModelCard 
                key={model.name} 
                model={{...model, isBest: model.name === bestModel.name}}
                modelType={modelType}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="allModels" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map((model) => (
              <ModelCard 
                key={model.name} 
                model={{...model, isBest: model.name === bestModel.name}}
                modelType={modelType}
              />
            ))}
          </div>
        </TabsContent>

        {modelType === 'classification' && classDistribution && (
          <TabsContent value="distribution" className="mt-0">
            <div className="gradient-border p-6 rounded-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
              <h3 className="text-xl font-medium mb-4">Class Distribution</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Visualization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(classDistribution).map(([className, count]) => (
                    <TableRow key={className}>
                      <TableCell className="font-medium">{className}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>{((count / totalSamples) * 100).toFixed(2)}%</TableCell>
                      <TableCell className="w-1/3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${(count / totalSamples) * 100}%` }}
                          ></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ResultsDisplay;
