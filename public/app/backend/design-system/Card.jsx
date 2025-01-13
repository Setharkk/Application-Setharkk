import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import { colors, spacing, borderRadius, shadows } from './theme';

const variants = {
  default: css`
    background: ${colors.neutral.white};
    border: 1px solid ${colors.neutral.gray[200]};
  `,
  elevated: css`
    background: ${colors.neutral.white};
    box-shadow: ${shadows.md};
  `,
  flat: css`
    background: ${colors.neutral.gray[50]};
  `
};

const StyledCard = styled.div`
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  ${({ variant }) => variants[variant] || variants.default}
  
  ${({ interactive }) => interactive && css`
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${shadows.lg};
    }
  `}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${spacing.md};
`;

const CardContent = styled.div``;

const CardFooter = styled.div`
  margin-top: ${spacing.md};
  padding-top: ${spacing.md};
  border-top: 1px solid ${colors.neutral.gray[200]};
`;

const Card = ({ 
  children,
  variant = 'default',
  interactive = false,
  fullWidth = false,
  header,
  footer,
  className,
  ...props 
}) => {
  return (
    <StyledCard
      variant={variant}
      interactive={interactive}
      fullWidth={fullWidth}
      className={className}
      {...props}
    >
      {header && <CardHeader>{header}</CardHeader>}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </StyledCard>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'flat']),
  interactive: PropTypes.bool,
  fullWidth: PropTypes.bool,
  header: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
};

export default Card; 