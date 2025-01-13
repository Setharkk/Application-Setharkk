import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { colors, typography, spacing, borderRadius, transitions } from './theme';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Label = styled.label`
  color: ${colors.neutral.gray[700]};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const ErrorMessage = styled.span`
  color: ${colors.state.error};
  font-size: ${typography.fontSize.sm};
  margin-top: ${spacing.xs};
`;

const inputSizes = {
  small: css`
    padding: ${spacing.xs} ${spacing.sm};
    font-size: ${typography.fontSize.sm};
  `,
  medium: css`
    padding: ${spacing.sm};
    font-size: ${typography.fontSize.base};
  `,
  large: css`
    padding: ${spacing.sm} ${spacing.md};
    font-size: ${typography.fontSize.lg};
  `
};

const StyledInput = styled.input`
  font-family: ${typography.fontFamily.sans};
  border-radius: ${borderRadius.md};
  border: 2px solid ${({ error }) => error ? colors.state.error : colors.neutral.gray[300]};
  background: ${colors.neutral.white};
  color: ${colors.neutral.gray[900]};
  transition: all ${transitions.default};
  width: 100%;
  
  ${({ size }) => inputSizes[size] || inputSizes.medium}
  
  &:focus {
    outline: none;
    border-color: ${({ error }) => error ? colors.state.error : colors.primary.main};
    box-shadow: 0 0 0 3px ${({ error }) => error ? colors.state.error + '40' : colors.primary.main + '40'};
  }
  
  &::placeholder {
    color: ${colors.neutral.gray[400]};
  }
  
  &:disabled {
    background: ${colors.neutral.gray[100]};
    cursor: not-allowed;
  }
`;

const Input = ({ 
  label,
  error,
  size = 'medium',
  className,
  ...props 
}) => {
  return (
    <InputWrapper className={className}>
      {label && <Label>{label}</Label>}
      <StyledInput
        size={size}
        error={error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};

export default Input; 