import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Globe, Info } from "lucide-react";

// Base API URL from your gdeltApi.ts
const API_BASE_URL = 'http://localhost:4041';

const ApiStatusChecker = () => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const checkEndpoint = async () => {
    setChecking(true);
    setStatus(null);
    setProgress(0);

    try {
      // Test with a simple timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      setProgress(30);
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'HEAD',
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') throw new Error('Connection timeout');
        throw err;
      });

      clearTimeout(timeoutId);
      setProgress(100);

      setStatus({
        success: true,
        message: 'GDELT API server is running on port 4041'
      });
    } catch (error) {
      setProgress(100);

      // Helpful error message
      if (error.message.includes('Failed to fetch')) {
        setStatus({
          success: false,
          message: 'Connection failed. Make sure your API server is running on port 4041.'
        });
      } else {
        setStatus({
          success: false,
          message: `Connection error: ${error.message}`
        });
      }
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  };

  return (
    <div className="bg-black/40 p-4 rounded-lg border border-white/10">
      {status && (
        <Alert className={`${status.success ? 'bg-black/40 border-green-700' : 'bg-black/40 border-red-700'} mb-4`}>
          <Info className="h-4 w-4" />
          <AlertTitle className="text-white">API Status</AlertTitle>
          <AlertDescription className="text-gray-300">
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      {checking && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Checking API connection...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      <Button
        variant="outline"
        className="w-full bg-black/50 text-white border-white/20"
        onClick={checkEndpoint}
        disabled={checking}
      >
        {checking ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Globe className="mr-2 h-4 w-4" />
        )}
        {checking ? 'Checking API...' : 'Check API Connection'}
      </Button>

      <div className="mt-4 text-xs text-gray-400">
        <p className="text-center">To fix CORS issues in your FastAPI server:</p>
        <pre className="mt-1 bg-black/60 p-2 rounded text-gray-300 text-left overflow-x-auto">
{`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}
        </pre>
      </div>
    </div>
  );
};

export default ApiStatusChecker;