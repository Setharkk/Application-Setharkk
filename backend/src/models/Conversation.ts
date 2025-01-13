import { Schema, model, Document } from 'mongoose';

export type MessageType = 'user' | 'assistant';
export type MessageAction = 'message' | 'seo' | 'editor' | 'pause' | 'resume';
export type ConversationStatus = 'active' | 'paused' | 'completed';

export interface IMessage {
    type: MessageType;
    content: string;
    timestamp: Date;
    action: MessageAction;
    data?: unknown;
}

export interface IContext {
    [key: string]: unknown;
}

export interface IConversation extends Document {
    messages: IMessage[];
    status: ConversationStatus;
    context: IContext;
    createdAt: Date;
    updatedAt: Date;
    addMessage: (type: MessageType, content: string, action?: MessageAction, data?: unknown) => Promise<IConversation>;
    updateStatus: (status: ConversationStatus) => Promise<IConversation>;
    updateContext: (context: Partial<IContext>) => Promise<IConversation>;
}

const messageSchema = new Schema<IMessage>({
    type: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        enum: ['message', 'seo', 'editor', 'pause', 'resume'],
        default: 'message'
    },
    data: {
        type: Schema.Types.Mixed
    }
});

const conversationSchema = new Schema<IConversation>({
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['active', 'paused', 'completed'],
        default: 'active'
    },
    context: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Méthode pour ajouter un message
conversationSchema.methods.addMessage = function(
    type: MessageType,
    content: string,
    action: MessageAction = 'message',
    data: unknown = null
): Promise<IConversation> {
    this.messages.push({
        type,
        content,
        timestamp: new Date(),
        action,
        data
    });
    return this.save();
};

// Méthode pour mettre à jour le statut
conversationSchema.methods.updateStatus = function(
    status: ConversationStatus
): Promise<IConversation> {
    this.status = status;
    return this.save();
};

// Méthode pour mettre à jour le contexte
conversationSchema.methods.updateContext = function(
    context: Partial<IContext>
): Promise<IConversation> {
    this.context = { ...this.context, ...context };
    return this.save();
};

export default model<IConversation>('Conversation', conversationSchema); 