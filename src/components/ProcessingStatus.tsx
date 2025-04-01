
import React from "react";
import { Cpu, BarChart2, Loader2, AlertTriangle, SparkleIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingStatusProps {
  status: "idle" | "processing" | "complete" | "error";
  message?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  status, 
  message = "Processing your dataset..." 
}) => {
  if (status === "idle") return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-4 animate-fade-in">
      <div className="gradient-border backdrop-blur-md p-6 rounded-xl bg-white/40 dark:bg-gray-900/40">
        {status === "processing" && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                <Cpu className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-foreground">{message}</h3>
                <p className="text-sm text-muted-foreground">
                  Training multiple regression models...
                </p>
              </div>
            </div>
            <Progress value={30} className="h-2 bg-primary/20" />
            <div className="pt-2 flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <SparkleIcon className="w-3 h-3 text-primary" />
                Analyzing data patterns
              </span>
              <span className="flex items-center gap-1.5 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                Please wait
              </span>
            </div>
          </div>
        )}

        {status === "complete" && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center glow shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">Analysis complete</h3>
              <p className="text-sm text-muted-foreground">
                Your models have been evaluated successfully.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center glow shadow-[0_0_15px_rgba(248,113,113,0.4)]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-foreground">Processing failed</h3>
              <p className="text-sm text-muted-foreground">
                {message || "There was an error processing your dataset. Please try again."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingStatus;
