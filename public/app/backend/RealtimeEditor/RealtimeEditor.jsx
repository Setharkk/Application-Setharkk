import React from 'react';
import styled from 'styled-components';
import { colors, spacing } from '../design-system/theme';
import EditorChat from './EditorChat';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${colors.neutral.gray[50]};
`;

const Header = styled.header`
  background: ${colors.neutral.white};
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral.gray[200]};
  margin-bottom: ${spacing.lg};
`;

const Title = styled.h1`
  color: ${colors.neutral.gray[900]};
  font-size: 1.5rem;
  margin: 0;
`;

const Description = styled.p`
  color: ${colors.neutral.gray[600]};
  margin-top: ${spacing.sm};
`;

const RealtimeEditor = () => {
  return (
    <PageContainer>
      <Header>
        <Title>Éditeur en Temps Réel</Title>
        <Description>
          Rédigez votre contenu avec l'aide de notre assistant intelligent.
          Obtenez des suggestions en temps réel pour améliorer votre texte.
        </Description>
      </Header>
      <EditorChat />
    </PageContainer>
  );
};

export default RealtimeEditor; 