import React, { useEffect, useState } from 'react';
import { db } from '../config/db';

const Dashboard = () => {
  const [stats, setStats] = useState({
    seoAnalyses: [],
    conversations: [],
    documents: []
  });

  useEffect(() => {
    const loadStats = () => {
      setStats({
        seoAnalyses: db.getSeoAnalyses(),
        conversations: db.getConversations(),
        documents: db.getDocuments()
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Analyses SEO</h2>
          <p>{stats.seoAnalyses.length} analyses réalisées</p>
          <ul>
            {stats.seoAnalyses.slice(0, 5).map((analysis, index) => (
              <li key={index}>
                {new Date(analysis.timestamp).toLocaleDateString()} - {analysis.url}
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Conversations</h2>
          <p>{stats.conversations.length} conversations enregistrées</p>
          <ul>
            {stats.conversations.slice(0, 5).map((conv, index) => (
              <li key={<ul>
  {stats.conversations.slice(0, 5).map((conv) => (
    <li key={conv.id}> 
      {new Date(conv.timestamp).toLocaleDateString()} - {conv.title || 'Sans titre'}
    </li>
  ))}
</ul>
}>
                {new Date(conv.timestamp).toLocaleDateString()} - {conv.title || 'Sans titre'}
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <h2>Documents</h2>
          <p>{stats.documents.length} documents sauvegardés</p>
          <ul>
            {stats.documents.slice(0, 5).map((doc, index) => (
              <li key={index}>
                {new Date(doc.timestamp).toLocaleDateString()} - {doc.title || 'Sans titre'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 