import mongoose, { Document, Schema } from 'mongoose';

type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface IError extends Document {
  message: string;
  code: string;
  stack?: string;
  timestamp: Date;
  service: string;
  severity: ErrorSeverity;
}

const errorSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  stack: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  service: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    default: 'ERROR'
  }
});

export const Error = mongoose.model<IError>('Error', errorSchema); 