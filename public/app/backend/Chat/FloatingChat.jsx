import React, { useState } from 'react';
import { Fab, Zoom } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon } from '@mui/icons-material';
import ChatWindow from './ChatWindow';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <Zoom in={!isOpen}>
                <Fab
                    color="primary"
                    aria-label="chat"
                    onClick={toggleChat}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1000
                    }}
                >
                    <ChatIcon />
                </Fab>
            </Zoom>

            <Zoom in={isOpen}>
                <div
                    style={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                    }}
                >
                    <Fab
                        color="secondary"
                        aria-label="close chat"
                        onClick={toggleChat}
                        sx={{ mb: 2 }}
                    >
                        <CloseIcon />
                    </Fab>
                    <ChatWindow />
                </div>
            </Zoom>
        </>
    );
};

export default FloatingChat; 