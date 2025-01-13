import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { ChatInterface, Card } from '../design-system';
import { colors, spacing } from '../design-system/theme';
import useCollaboration from './hooks/useCollaboration';
import CollaboratorsList from './CollaboratorsList';
import { v4 as uuidv4 } from 'uuid';

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

const EditorContainer = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TextEditor = styled.textarea`
  flex: 1;
  padding: ${spacing.md};
  border: none;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  background: ${colors.neutral.white};
  color: ${colors.neutral.gray[900]};
  
  &:focus {
    outline: none;
  }
`;

const AssistantPanel = styled(Card)`
  padding: ${spacing.lg};
  background: ${colors.neutral.white};
  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

const StatItem = styled.div`
  margin-bottom: ${spacing.md};
  
  .label {
    font-size: 0.875rem;
    color: ${colors.neutral.gray[600]};
    margin-bottom: ${spacing.xs};
  }
  
  .value {
    font-size: 1rem;
    color: ${colors.neutral.gray[900]};
  }
`;

const CollaborationHeader = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid ${colors.neutral.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ShareButton = styled.button`
  background: ${colors.primary.main};
  color: ${colors.neutral.white};
  border: none;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: ${colors.primary.dark};
  }
`;

const EditorChat = () => {
  const [documentId] = useState(() => uuidv4());
  const { collaborators, isConnected, emitChange, emitCursorPosition } = useCollaboration(documentId);
  const [editorStats, setEditorStats] = useState({
    readability: 0,
    tone: 'Neutre',
    suggestions: [],
    grammar: []
  });
  const [editorContent, setEditorContent] = useState('');

  const handleShare = () => {
    const url = `${window.location.origin}/editor/${documentId}`;
    navigator.clipboard.writeText(url);
    alert('Lien de collaboration copié dans le presse-papier !');
  };

  const handleEditorChange = useCallback((e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    
    // Émettre le changement aux collaborateurs
    emitChange({
      content: newContent,
      timestamp: Date.now()
    });

    // Analyse tous les 10 mots
    if (newContent.split(' ').length % 10 === 0) {
      analyzeText(newContent);
    }
  }, [emitChange]);

  const handleCursorMove = useCallback((e) => {
    const position = e.target.selectionStart;
    emitCursorPosition({
      position,
      timestamp: Date.now()
    });
  }, [emitCursorPosition]);

  const analyzeText = async (text) => {
    // Simulation d'analyse de texte
    const analysis = {
      readability: Math.floor(Math.random() * 100),
      tone: ['Professionnel', 'Amical', 'Formel', 'Informel'][Math.floor(Math.random() * 4)],
      suggestions: [
        "Utilisez des phrases plus courtes pour améliorer la lisibilité",
        "Ajoutez des sous-titres pour structurer votre texte",
        "Variez votre vocabulaire"
      ],
      grammar: [
        "Vérifiez l'accord du verbe dans la deuxième phrase",
        "Attention à la ponctuation"
      ]
    };
    
    setEditorStats(analysis);
    
    return `
📝 Analyse de texte terminée !

Lisibilité : ${analysis.readability}/100
Ton détecté : ${analysis.tone}

Suggestions stylistiques :
${analysis.suggestions.map(s => `• ${s}`).join('\n')}

Corrections grammaticales :
${analysis.grammar.map(g => `• ${g}`).join('\n')}

Comment puis-je vous aider à améliorer votre texte ?
    `.trim();
  };

  const initialMessages = [
    {
      id: 1,
      message: "Bonjour ! Je suis votre assistant de rédaction. Je peux vous aider à améliorer votre style, corriger la grammaire et optimiser la lisibilité de votre texte.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ];

  return (
    <Container>
      <EditorContainer>
        <CollaborationHeader>
          <div>
            {isConnected ? (
              <span style={{ color: colors.state.success }}>
                ● Connecté ({collaborators.length} collaborateur{collaborators.length !== 1 ? 's' : ''})
              </span>
            ) : (
              <span style={{ color: colors.state.error }}>
                ● Déconnecté
              </span>
            )}
          </div>
          <ShareButton onClick={handleShare}>
            Partager le document
          </ShareButton>
        </CollaborationHeader>
        
        <TextEditor
          value={editorContent}
          onChange={handleEditorChange}
          onSelect={handleCursorMove}
          placeholder="Commencez à écrire ici..."
        />
      </EditorContainer>
      
      <AssistantPanel>
        <CollaboratorsList collaborators={collaborators} />
        
        <ChatInterface
          onSendMessage={analyzeText}
          placeholder="Posez une question sur votre texte..."
          initialMessages={initialMessages}
        />
        
        <StatItem>
          <div className="label">Lisibilité</div>
          <div className="value">{editorStats.readability}/100</div>
        </StatItem>
        
        <StatItem>
          <div className="label">Ton</div>
          <div className="value">{editorStats.tone}</div>
        </StatItem>
        
        <StatItem>
          <div className="label">Suggestions</div>
          <ul>
            {editorStats.suggestions.map((suggestion) => (
              <li key={`suggestion-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}>
                {suggestion}
              </li>
            ))}
          </ul>
        </StatItem>
        
        <StatItem>
          <div className="label">Grammaire</div>
          <ul>
            {editorStats.grammar.map((issue) => (
              <li key={`grammar-${issue.toLowerCase().replace(/\s+/g, '-')}`}>
                {issue}
              </li>
            ))}
          </ul>
        </StatItem>
      </AssistantPanel>
    </Container>
  );
};

export default EditorChat; 