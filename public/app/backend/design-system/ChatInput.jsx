import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from './theme';
import Button from './Button';

const InputContainer = styled.div`
  display: flex;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.neutral.white};
  border-top: 1px solid ${colors.neutral.gray[200]};
  position: sticky;
  bottom: 0;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  border: 2px solid ${colors.neutral.gray[200]};
  border-radius: ${borderRadius.md};
  padding: ${spacing.sm};
  resize: none;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;
  transition: border-color ${transitions.default};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
  }
  
  &::placeholder {
    color: ${colors.neutral.gray[400]};
  }
`;

const SendButton = styled(Button)`
  align-self: flex-end;
`;

const ChatInput = ({ onSend, placeholder = "Tapez votre message...", disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <InputContainer>
      <StyledTextarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
      />
      <SendButton
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        variant="primary"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </SendButton>
    </InputContainer>
  );
};

ChatInput.propTypes = {
  onSend: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
};

export default ChatInput; 