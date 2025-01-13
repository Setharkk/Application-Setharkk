import React, { useState } from 'react';
import styled from 'styled-components';
import { ChatInterface, Card } from '../design-system';
import { colors, spacing } from '../design-system/theme';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${spacing.lg};
  height: calc(100vh - 100px);
  padding: ${spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChatContainer = styled(Card)`
  height: 100%;
  overflow: hidden;
`;

const StatsPanel = styled(Card)`
  padding: ${spacing.lg};
  background: ${colors.neutral.white};
  
  h3 {
    margin-bottom: ${spacing.md};
    color: ${colors.neutral.gray[800]};
  }
`;

const StatItem = styled.div`
  margin-bottom: ${spacing.md};
  
  .label {
    font-size: 0.875rem;
    color: ${colors.neutral.gray[600]};
    margin-bottom: ${spacing.xs};
  }
  
  .value {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${colors.primary.main};
  }
`;

const SeoChat = () => {
  const [seoStats, setSeoStats] = useState({
    score: 0,
    wordCount: 0,
    keywords: [],
    suggestions: []
  });

  const analyzeSEO = async (text) => {
    // Simulation d'analyse SEO
    const analysis = {
      score: Math.floor(Math.random() * 100),
      wordCount: text.split(' ').length,
      keywords: text.toLowerCase().split(' ').slice(0, 3),
      suggestions: [
        "Ajoutez plus de mots-clés pertinents",
        "Optimisez vos balises meta",
        "Améliorez la structure des titres"
      ]
    };
    
    setSeoStats(analysis);
    
    // Formatage de la réponse pour le chat
    return `
📊 Analyse SEO terminée !

Score SEO : ${analysis.score}/100
Nombre de mots : ${analysis.wordCount}
Mots-clés détectés : ${analysis.keywords.join(', ')}

Suggestions d'amélioration :
${analysis.suggestions.map(s => `• ${s}`).join('\n')}

Que souhaitez-vous analyser d'autre ?
    `.trim();
  };

  const initialMessages = [
    {
      id: 1,
      message: "Bonjour ! Je suis votre assistant SEO. Collez votre texte ou votre URL pour commencer l'analyse.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ];

  return (
    <Container>
      <ChatContainer>
        <ChatInterface
          onSendMessage={analyzeSEO}
          placeholder="Collez votre texte ou URL à analyser..."
          initialMessages={initialMessages}
        />
      </ChatContainer>
      
      <StatsPanel>
        <h3>Statistiques SEO</h3>
        <StatItem>
          <div className="label">Score global</div>
          <div className="value">{seoStats.score}/100</div>
        </StatItem>
        <StatItem>
          <div className="label">Nombre de mots</div>
          <div className="value">{seoStats.wordCount}</div>
        </StatItem>
        <StatItem>
          <div className="label">Mots-clés principaux</div>
          <div className="value">
            {seoStats.keywords.length > 0 
              ? seoStats.keywords.join(', ') 
              : 'Aucun mot-clé détecté'}
          </div>
        </StatItem>
        <StatItem>
          <div className="label">Suggestions</div>
          <ul>
            {seoStats.suggestions.map((suggestion) => (
              <li key={`suggestion-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}>
                {suggestion}
              </li>
            ))}
          </ul>
        </StatItem>
      </StatsPanel>
    </Container>
  );
};

export default SeoChat; 