
'use client';

import { Wallet } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-pulse-icon">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <Wallet className="h-7 w-7"/>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              AVER<span className="font-bold">PAY</span>
            </h1>
            <p className="text-sm text-muted-foreground -mt-1">by Averon Workforce</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
