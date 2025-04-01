
import React from "react";
import { cn } from "@/lib/utils";
import { Trophy, AreaChart, ChevronRight, Star, Zap, BarChart2, Check, CheckCircle2 } from "lucide-react";

export interface ModelResult {
  name: string;
  // Regression metrics
  mae?: number;
  mse?: number;
  rmse?: number;
  r2?: number;
  // Classification metrics
  accuracy?: number;
  isBest?: boolean;
}

interface ModelCardProps {
  model: ModelResult;
  modelType: 'regression' | 'classification';
  onClick?: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, modelType, onClick }) => {
  const { name, mae, mse, rmse, r2, accuracy, isBest } = model;

  return (
    <div
      className={cn(
        "gradient-border p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]",
        "bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm",
        isBest 
          ? "shadow-glow" 
          : "hover:shadow-glow cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          {isBest && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/20 to-accent/20 text-primary backdrop-blur-sm animate-pulse-light">
              <Trophy className="w-3 h-3 mr-1 text-amber-500" />
              Best Model
            </div>
          )}
          <h3 className="text-lg font-medium">{name}</h3>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isBest 
            ? "bg-gradient-to-br from-primary to-accent" 
            : "bg-accent/10"
        )}>
          {isBest ? (
            <Star className="w-5 h-5 text-white" />
          ) : (
            modelType === 'regression' ? 
              <AreaChart className="w-5 h-5 text-accent-foreground" /> :
              <BarChart2 className="w-5 h-5 text-accent-foreground" />
          )}
        </div>
      </div>

      {modelType === 'regression' ? (
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">R² Score</p>
            <p className={cn(
              "text-lg font-medium flex items-center gap-1",
              isBest 
                ? "text-primary" 
                : "text-foreground",
              r2 && r2 > 0.8 && "text-primary"
            )}>
              {r2 && r2 > 0.8 && <Zap className="w-4 h-4 text-primary" />}
              {r2?.toFixed(4)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">RMSE</p>
            <p className="text-lg font-medium">{rmse?.toFixed(4)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">MAE</p>
            <p className="text-lg font-medium">{mae?.toFixed(4)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">MSE</p>
            <p className="text-lg font-medium">{mse?.toFixed(4)}</p>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className={cn(
                "text-lg font-medium flex items-center gap-1",
                isBest ? "text-primary" : "text-foreground",
                accuracy && accuracy > 0.8 && "text-primary"
              )}>
                {accuracy && accuracy > 0.8 && <CheckCircle2 className="w-4 h-4 text-primary" />}
                {accuracy ? `${(accuracy * 100).toFixed(2)}%` : "N/A"}
              </p>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={cn(
                  "h-2.5 rounded-full",
                  accuracy && accuracy > 0.8 
                    ? "bg-gradient-to-r from-primary to-accent" 
                    : "bg-accent"
                )}
                style={{ width: `${accuracy ? accuracy * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {isBest && (
        <div className="mt-5 text-sm flex justify-between items-center text-primary cursor-pointer group bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-2 rounded-lg backdrop-blur-sm">
          <span>View detailed report</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  );
};

export default ModelCard;
