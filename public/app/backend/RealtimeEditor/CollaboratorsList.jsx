import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '../design-system/theme';

const Container = styled.div`
  margin-bottom: ${spacing.md};
`;

const CollaboratorItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.xs} ${spacing.sm};
  background: ${colors.neutral.gray[100]};
  border-radius: ${borderRadius.full};
  margin-bottom: ${spacing.xs};
  font-size: 0.875rem;
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${borderRadius.full};
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-size: 0.75rem;
  font-weight: bold;
`;

const Status = styled.div`
  width: 8px;
  height: 8px;
  border-radius: ${borderRadius.full};
  background: ${colors.state.success};
  margin-left: auto;
`;

const CollaboratorsList = ({ collaborators }) => {
  return (
    <Container>
      {collaborators.map((collaborator) => (
        <CollaboratorItem key={collaborator.id}>
          <Avatar color={collaborator.color}>
            {collaborator.name.charAt(0).toUpperCase()}
          </Avatar>
          <span>{collaborator.name}</span>
          <Status />
        </CollaboratorItem>
      ))}
    </Container>
  );
};

CollaboratorsList.propTypes = {
  collaborators: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired
};

export default CollaboratorsList; 