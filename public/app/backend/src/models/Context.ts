import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContext extends Document {
    _id: Types.ObjectId;
    data: Record<string, any>;
    updatedAt: Date;
}

const ContextSchema = new Schema({
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

export default mongoose.model<IContext>('Context', ContextSchema); 