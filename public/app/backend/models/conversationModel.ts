import mongoose, { Document, Schema } from 'mongoose';

type MessageType = 'user' | 'assistant';
type MessageAction = 'message' | 'seo' | 'editor' | 'pause' | 'resume';
type ConversationStatus = 'active' | 'paused' | 'completed';

interface IMessage {
  type: MessageType;
  content: string;
  timestamp: Date;
  action: MessageAction;
  data?: any;
}

interface IContext {
  [key: string]: any;
}

interface IConversation extends Document {
  messages: IMessage[];
  status: ConversationStatus;
  context: IContext;
  createdAt: Date;
  updatedAt: Date;
  addMessage: (type: MessageType, content: string, action?: MessageAction, data?: any) => Promise<IConversation>;
  updateStatus: (status: ConversationStatus) => Promise<IConversation>;
  updateContext: (context: Partial<IContext>) => Promise<IConversation>;
}

const messageSchema = new Schema({
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

const conversationSchema = new Schema({
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  context: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification
conversationSchema.pre('save', function(this: IConversation, next: () => void): void {
  this.updatedAt = new Date();
  next();
});

// Méthode pour ajouter un message
conversationSchema.methods.addMessage = function(
  this: IConversation,
  type: MessageType,
  content: string,
  action: MessageAction = 'message',
  data: any = null
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
  this: IConversation,
  status: ConversationStatus
): Promise<IConversation> {
  this.status = status;
  return this.save();
};

// Méthode pour mettre à jour le contexte
conversationSchema.methods.updateContext = function(
  this: IConversation,
  context: Partial<IContext>
): Promise<IConversation> {
  this.context = { ...this.context, ...context };
  return this.save();
};

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema); 