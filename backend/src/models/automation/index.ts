import { Schema, model, Document, Types } from 'mongoose';

type AutomationType = 'email' | 'sms' | 'notification' | 'custom';
type AutomationStatus = 'active' | 'paused' | 'error';

interface ITrigger {
  type: string;
  config: Record<string, unknown>;
}

interface IAction {
  type: string;
  config: Record<string, unknown>;
}

export interface IAutomation extends Document {
  name: string;
  description?: string;
  type: AutomationType;
  trigger: ITrigger;
  actions: IAction[];
  status: AutomationStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
  pause: () => Promise<IAutomation>;
  activate: () => Promise<IAutomation>;
  setError: (error: string) => Promise<IAutomation>;
}

const automationSchema = new Schema<IAutomation>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'notification', 'custom'],
    required: true
  },
  trigger: {
    type: {
      type: String,
      required: true
    },
    config: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  actions: [{
    type: {
      type: String,
      required: true
    },
    config: {
      type: Schema.Types.Mixed,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'error'],
    default: 'active'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastError: {
    type: String
  }
}, {
  timestamps: true
});

// Méthodes d'instance
automationSchema.methods.pause = function(): Promise<IAutomation> {
  this.status = 'paused';
  return this.save();
};

automationSchema.methods.activate = function(): Promise<IAutomation> {
  this.status = 'active';
  this.lastError = undefined;
  return this.save();
};

automationSchema.methods.setError = function(error: string): Promise<IAutomation> {
  this.status = 'error';
  this.lastError = error;
  return this.save();
};

// Index pour améliorer les performances
automationSchema.index({ createdBy: 1, type: 1 });
automationSchema.index({ status: 1 });
automationSchema.index({ createdAt: -1 });
automationSchema.index({ 'trigger.type': 1 });

export default model<IAutomation>('Automation', automationSchema); 