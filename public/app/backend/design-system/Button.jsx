import React from 'react';
import styled, { css } from 'styled-components';
import { colors, typography, spacing, borderRadius, transitions } from './theme';
import PropTypes from 'prop-types';

const variants = {
  primary: css`
    background: ${colors.primary.main};
    color: ${colors.neutral.white};
    &:hover {
      background: ${colors.primary.dark};
    }
  `,
  secondary: css`
    background: ${colors.secondary.main};
    color: ${colors.neutral.white};
    &:hover {
      background: ${colors.secondary.dark};
    }
  `,
  outline: css`
    background: transparent;
    color: ${colors.primary.main};
    border: 2px solid ${colors.primary.main};
    &:hover {
      background: ${colors.primary.main}10;
    }
  `,
  text: css`
    background: transparent;
    color: ${colors.primary.main};
    &:hover {
      background: ${colors.primary.main}10;
    }
  `
};

const sizes = {
  small: css`
    padding: ${spacing.xs} ${spacing.sm};
    font-size: ${typography.fontSize.sm};
  `,
  medium: css`
    padding: ${spacing.sm} ${spacing.md};
    font-size: ${typography.fontSize.base};
  `,
  large: css`
    padding: ${spacing.md} ${spacing.lg};
    font-size: ${typography.fontSize.lg};
  `
};

const StyledButton = styled.button`
  font-family: ${typography.fontFamily.sans};
  font-weight: ${typography.fontWeight.medium};
  border-radius: ${borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${transitions.default};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  
  ${({ variant }) => variants[variant] || variants.primary}
  ${({ size }) => sizes[size] || sizes.medium}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primary.main}40;
  }
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  icon,
  ...props 
}) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.node,
};

export default Button; 