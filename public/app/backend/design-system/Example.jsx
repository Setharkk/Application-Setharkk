import React, { useState } from 'react';
import styled from 'styled-components';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { spacing } from './theme';

const ExampleContainer = styled.div`
  padding: ${spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
`;

const Example = () => {
  const [inputValue, setInputValue] = useState('');
  
  return (
    <ExampleContainer>
      <Section>
        <h2>Boutons</h2>
        <ButtonGroup>
          <Button>Bouton Principal</Button>
          <Button variant="secondary">Bouton Secondaire</Button>
          <Button variant="outline">Bouton Outline</Button>
          <Button variant="text">Bouton Texte</Button>
        </ButtonGroup>
        
        <ButtonGroup>
          <Button size="small">Petit</Button>
          <Button size="medium">Moyen</Button>
          <Button size="large">Grand</Button>
        </ButtonGroup>
      </Section>

      <Section>
        <h2>Champs de saisie</h2>
        <Input
          label="Nom d'utilisateur"
          placeholder="Entrez votre nom"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="exemple@email.com"
          error="Email invalide"
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          size="large"
        />
      </Section>

      <Section>
        <h2>Cartes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg }}>
          <Card
            header={<h3>Carte Standard</h3>}
            footer={<Button fullWidth>Action</Button>}
          >
            Contenu de la carte standard avec un texte de démonstration.
          </Card>
          
          <Card
            variant="elevated"
            interactive
            header={<h3>Carte Interactive</h3>}
          >
            Cette carte est interactive. Passez la souris dessus !
          </Card>
          
          <Card
            variant="flat"
            header={<h3>Carte Plate</h3>}
            footer={
              <ButtonGroup>
                <Button variant="outline">Annuler</Button>
                <Button>Confirmer</Button>
              </ButtonGroup>
            }
          >
            Une carte avec un style plat et des actions multiples.
          </Card>
        </div>
      </Section>
    </ExampleContainer>
  );
};

export default Example; 