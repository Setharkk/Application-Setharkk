import React, { useState, useRef, useEffect } from 'react';
import { 
    Paper, 
    TextField, 
    IconButton, 
    Typography, 
    Box,
    Chip,
    Tooltip,
    CircularProgress,
    Divider
} from '@mui/material';
import { 
    Send as SendIcon, 
    Delete as DeleteIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Analytics as AnalyticsIcon,
    Campaign as CampaignIcon
} from '@mui/icons-material';
import axios from 'axios';

const QUICK_ACTIONS = [
    { label: 'Analyser SEO', icon: <SearchIcon />, action: 'seo' },
    { label: 'Optimiser contenu', icon: <EditIcon />, action: 'content' },
    { label: 'Analyser metrics', icon: <AnalyticsIcon />, action: 'metrics' },
    { label: 'Suggestions marketing', icon: <CampaignIcon />, action: 'marketing' }
];

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleQuickAction = async (action) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/chat/action', 
                { action },
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
            );

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: response.data.message,
                    timestamp: new Date(),
                    action: action
                }]);
            }
        } catch (error) {
            console.error('Erreur lors de l\'action rapide:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Erreur lors de l\'exécution de l\'action',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setIsLoading(true);

        // Ajouter le message de l'utilisateur
        setMessages(prev => [...prev, {
            type: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);

        try {
            const response = await axios.post('/api/chat/message', {
                message: userMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                // Ajouter la réponse de l'assistant
                setMessages(prev => [...prev, {
                    type: 'assistant',
                    content: response.data.message,
                    timestamp: new Date(),
                    suggestions: response.data.suggestions || []
                }]);

                // Mettre à jour les suggestions
                if (response.data.suggestions) {
                    setSuggestions(response.data.suggestions);
                }
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await axios.post('/api/chat/clear', {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessages([]);
            setSuggestions([]);
        } catch (error) {
            console.error('Erreur lors de l\'effacement du chat:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
    };

    return (
        <Paper elevation={3} sx={{ height: '600px', maxWidth: '800px', margin: 'auto', mt: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* En-tête */}
                <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6">Assistant SEO</Typography>
                    <IconButton onClick={clearChat} color="error" size="small">
                        <DeleteIcon />
                    </IconButton>
                </Box>

                {/* Actions rapides */}
                <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {QUICK_ACTIONS.map((action) => (
                        <Tooltip key={action.action} title={action.label}>
                            <Chip
                                icon={action.icon}
                                label={action.label}
                                onClick={() => handleQuickAction(action.action)}
                                disabled={isLoading}
                                sx={{ m: 0.5 }}
                            />
                        </Tooltip>
                    ))}
                </Box>

                <Divider />

                {/* Zone des messages */}
                <Box sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    maxWidth: '70%',
                                    backgroundColor: msg.type === 'user' ? 'primary.light' : 
                                                   msg.type === 'error' ? 'error.light' : 'grey.100',
                                    color: msg.type === 'user' ? 'white' : 'text.primary'
                                }}
                            >
                                <Typography variant="body1">{msg.content}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </Typography>
                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {msg.suggestions.map((suggestion, i) => (
                                            <Chip
                                                key={i}
                                                label={suggestion}
                                                size="small"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    ))}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Suggestions actives */}
                {suggestions.length > 0 && (
                    <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {suggestions.map((suggestion, index) => (
                                <Chip
                                    key={index}
                                    label={suggestion}
                                    size="small"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Zone de saisie */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tapez votre message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            multiline
                            maxRows={4}
                            size="small"
                        />
                        <IconButton 
                            color="primary" 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default ChatWindow;
