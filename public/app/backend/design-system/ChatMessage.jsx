import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { colors, spacing, borderRadius, typography } from './theme';

const MessageContainer = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
  ${({ isUser }) => isUser && css`
    flex-direction: row-reverse;
  `}
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.full};
  background: ${({ isUser }) => isUser ? colors.primary.main : colors.secondary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-weight: ${typography.fontWeight.bold};
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  background: ${({ isUser }) => isUser ? colors.primary.main + '15' : colors.neutral.gray[100]};
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  max-width: 70%;
  
  ${({ isUser }) => isUser ? css`
    border-top-right-radius: ${borderRadius.sm};
  ` : css`
    border-top-left-radius: ${borderRadius.sm};
  `}
`;

const MessageText = styled.p`
  margin: 0;
  color: ${colors.neutral.gray[900]};
  font-size: ${typography.fontSize.base};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const Timestamp = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral.gray[500]};
  margin-top: ${spacing.xs};
  display: block;
`;

const ChatMessage = ({ message, isUser, timestamp }) => {
  return (
    <MessageContainer isUser={isUser}>
      <Avatar isUser={isUser}>
        {isUser ? 'U' : 'A'}
      </Avatar>
      <MessageContent isUser={isUser}>
        <MessageText>{message}</MessageText>
        {timestamp && <Timestamp>{timestamp}</Timestamp>}
      </MessageContent>
    </MessageContainer>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool,
  timestamp: PropTypes.string
};

export default ChatMessage; 