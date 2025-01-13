import mongoose, { Document, Schema } from 'mongoose';

export interface EditorMetadata {
    lastModified: Date;
    wordCount: number;
    readingTime: number;
}

export interface VersionHistory {
    version: number;
    content: string;
    modifiedAt: Date;
    modifiedBy: mongoose.Types.ObjectId;
}

export type EditorStatus = 'draft' | 'published' | 'archived';

export interface IEditor extends Document {
    title: string;
    content: string;
    version: number;
    author: mongoose.Types.ObjectId;
    status: EditorStatus;
    tags: string[];
    metadata: EditorMetadata;
    history: VersionHistory[];
    createdAt: Date;
    updatedAt: Date;
}

const editorSchema = new Schema<IEditor>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        lastModified: {
            type: Date,
            default: Date.now
        },
        wordCount: {
            type: Number,
            default: 0
        },
        readingTime: {
            type: Number,
            default: 0
        }
    },
    history: [{
        version: Number,
        content: String,
        modifiedAt: Date,
        modifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
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
editorSchema.pre('save', function(this: IEditor, next) {
    this.updatedAt = new Date();
    this.metadata.lastModified = new Date();
    
    // Calcul du nombre de mots et du temps de lecture
    if (this.content) {
        const wordCount = this.content.trim().split(/\s+/).length;
        this.metadata.wordCount = wordCount;
        this.metadata.readingTime = Math.ceil(wordCount / 200); // ~200 mots par minute
    }
    
    // Gestion de l'historique des versions
    if (this.isModified('content')) {
        this.version += 1;
        this.history.push({
            version: this.version,
            content: this.content,
            modifiedAt: new Date(),
            modifiedBy: this.author
        });
    }
    
    next();
});

export const Editor = mongoose.model<IEditor>('Editor', editorSchema); 