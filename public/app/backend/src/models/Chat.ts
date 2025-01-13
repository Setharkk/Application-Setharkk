import mongoose from 'mongoose';
import { ChatMessage as IChatMessage } from '../types/common';

const chatMessageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['user', 'assistant'], required: true },
    timestamp: { type: String, required: true },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true
});

const chatContextSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    messages: [chatMessageSchema],
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
    lastActivity: { type: String, required: true }
}, {
    timestamps: true
});

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
export const ChatContextModel = mongoose.model('ChatContext', chatContextSchema); 