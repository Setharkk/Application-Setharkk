import mongoose, { Document, Schema, Model } from 'mongoose';

type AutomationType = 'email' | 'sms' | 'notification' | 'custom';
type AutomationStatus = 'active' | 'paused' | 'error';

interface ITrigger {
  type: string;
  config: any;
}

interface IAction {
  type: string;
  config: any;
}

interface IAutomation extends Document {
  name: string;
  description?: string;
  type: AutomationType;
  trigger: ITrigger;
  actions: IAction[];
  status: AutomationStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
  pause: () => Promise<IAutomation>;
  activate: () => Promise<IAutomation>;
  setError: (error: string) => Promise<IAutomation>;
}

interface IAutomationModel extends Model<IAutomation> {
  findByUser: (userId: mongoose.Types.ObjectId) => Promise<IAutomation[]>;
  findActiveAutomations: () => Promise<IAutomation[]>;
}

const automationSchema = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastError: {
    type: String
  }
});

// Middleware pre-save
automationSchema.pre('save', function(this: IAutomation, next: () => void): void {
  this.updatedAt = new Date();
  next();
});

// Méthodes statiques
automationSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId): Promise<IAutomation[]> {
  return this.find({ createdBy: userId });
};

automationSchema.statics.findActiveAutomations = function(): Promise<IAutomation[]> {
  return this.find({ status: 'active' });
};

// Méthodes d'instance
automationSchema.methods.pause = function(this: IAutomation): Promise<IAutomation> {
  this.status = 'paused';
  return this.save();
};

automationSchema.methods.activate = function(this: IAutomation): Promise<IAutomation> {
  this.status = 'active';
  return this.save();
};

automationSchema.methods.setError = function(this: IAutomation, error: string): Promise<IAutomation> {
  this.status = 'error';
  this.lastError = error;
  return this.save();
};

export const Automation = mongoose.model<IAutomation, IAutomationModel>('Automation', automationSchema); 