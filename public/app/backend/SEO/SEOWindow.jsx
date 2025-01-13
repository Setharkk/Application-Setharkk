import React, { useState } from 'react';
import { db } from '../../config/db';
import { SEOController } from './SEOController';

const SEOWindow = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError('Veuillez entrer une URL valide');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const controller = new SEOController();
      const analysisResults = await controller.analyzeUrl(url);
      
      setResults(analysisResults);
      db.saveSeoAnalysis({ url, results: analysisResults, timestamp: Date.now() });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="seo-container">
      <h1>Analyseur SEO</h1>
      
      <div className="seo-input">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Entrez l'URL à analyser"
          disabled={isAnalyzing}
        />
        <button onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyse en cours...' : 'Analyser'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {results && (
        <div className="results-container">
          <h2>Résultats de l'analyse</h2>
          
          <div className="score-card">
            <h3>Score global</h3>
            <div className={`score score-${results.score >= 80 ? 'good' : results.score >= 60 ? 'medium' : 'bad'}`}>
              {results.score}/100
            </div>
          </div>

          <div className="metrics-grid">
            {Object.entries(results.metrics).map(([key, value]) => (
              <div key={key} className="metric-card">
                <h4>{value.label}</h4>
                <div className={`metric-score score-${value.score >= 80 ? 'good' : value.score >= 60 ? 'medium' : 'bad'}`}>
                  {value.score}/100
                </div>
                <p>{value.description}</p>
                {value.recommendations && (
                  <ul className="recommendations">
                    {value.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOWindow;
