// src/pages/Debug.tsx
import React, { useEffect, useState } from 'react';
import { useCompositionStore } from "@/utils/compositionData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DebugPage: React.FC = () => {
  const store = useCompositionStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await store.refreshCompositions();

        // Also fetch directly from API for comparison
        const manuscriptResponse = await fetch('http://localhost:8080/api/collections/manuscript');
        const manuscriptData = await manuscriptResponse.json();
        setApiResponse({
          manuscript: manuscriptData
        });

        setLoading(false);
      } catch (err) {
        setError(String(err));
        setLoading(false);
      }
    };

    loadData();
  }, [store]);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>Debug Page</h1>
      <Button onClick={() => navigate('/')} className="mb-4">Back to Home</Button>

      {loading ? <p>Loading...</p> : (
        <>
          <h2>Store State Summary:</h2>
          <pre style={{
            backgroundColor: '#333',
            color: '#fff',
            padding: '10px',
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {JSON.stringify({
              manuscript: store.manuscript?.length || 0,
              data: store.data?.length || 0,
              map: store.map?.length || 0,
              initialized: store.initialized
            }, null, 2)}
          </pre>

          {error && (
            <div style={{ color: 'red', margin: '20px 0' }}>
              <h2>Error:</h2>
              <pre style={{ backgroundColor: '#ffeeee', padding: '10px', borderRadius: '4px' }}>
                {error}
              </pre>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div>
              <h2>Store - Manuscript Data:</h2>
              <pre style={{
                backgroundColor: '#333',
                color: '#fff',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {JSON.stringify(store.manuscript, null, 2)}
              </pre>
            </div>

            <div>
              <h2>Direct API - Manuscript Data:</h2>
              <pre style={{
                backgroundColor: '#333',
                color: '#fff',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {JSON.stringify(apiResponse?.manuscript, null, 2)}
              </pre>
            </div>
          </div>

          <h3 style={{ marginTop: '20px' }}>Navigation Test Links:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate('/composition/manuscript')}
                    className="bg-blue-500 text-white">
              Manuscript Page
            </Button>

            {store.manuscript?.length > 0 && (
              <Button onClick={() => navigate(`/composition/manuscript/1/1`)}
                      className="bg-green-500 text-white">
                First Manuscript Section
              </Button>
            )}

            <Button onClick={() => navigate('/composition/data')}
                    className="bg-purple-500 text-white">
              Data Page
            </Button>

            {store.data?.length > 0 && (
              <Button onClick={() => navigate(`/composition/data/1/1`)}
                      className="bg-pink-500 text-white">
                First Data Section
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DebugPage;