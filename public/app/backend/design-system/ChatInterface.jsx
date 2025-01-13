import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors, spacing, shadows } from './theme';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${colors.neutral.white};
  border-radius: ${spacing.md};
  box-shadow: ${shadows.md};
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.md};
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.neutral.gray[100]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.neutral.gray[300]};
    border-radius: ${spacing.sm};
  }
`;

const LoadingIndicator = styled.div`
  padding: ${spacing.md};
  text-align: center;
  color: ${colors.neutral.gray[500]};
`;

const ChatInterface = ({ 
  onSendMessage, 
  placeholder,
  initialMessages = [],
  isLoading = false 
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message) => {
    const newMessage = {
      id: Date.now(),
      message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (onSendMessage) {
      const response = await onSendMessage(message);
      if (response) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          message: response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && (
          <LoadingIndicator>
            L'assistant est en train d'écrire...
          </LoadingIndicator>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <ChatInput
        onSend={handleSend}
        placeholder={placeholder}
        disabled={isLoading}
      />
    </ChatContainer>
  );
};

ChatInterface.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialMessages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      isUser: PropTypes.bool.isRequired,
      timestamp: PropTypes.string
    })
  ),
  isLoading: PropTypes.bool
};

export default ChatInterface; 