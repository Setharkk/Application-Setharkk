import * as Joi from 'joi';

// Types et interfaces
export type TriggerType = 'form_submission' | 'schedule' | 'webhook' | 'api_call' | 'event' | 'condition';
export type ActionType = 'send_email' | 'send_notification' | 'update_record' | 'create_record' | 'api_request' | 'webhook_call';

export interface Workflow {
    name: string;
    description?: string;
    trigger_type: TriggerType;
    trigger_config: Record<string, any>;
    action_type: ActionType;
    action_config: Record<string, any>;
    is_active: boolean;
}

export interface TriggerConfig {
    form_submission?: {
        form_id: string;
        fields: string[];
    };
    schedule?: {
        cron: string;
        timezone?: string;
    };
    webhook?: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
    };
    api_call?: {
        endpoint: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
    };
    event?: {
        event_type: string;
        conditions?: Condition[];
    };
    condition?: {
        conditions: Condition[];
        logic: 'AND' | 'OR';
    };
}

export interface ActionConfig {
    send_email?: {
        to: string[];
        subject: string;
        template_id: string;
        variables?: Record<string, any>;
    };
    send_notification?: {
        user_ids: string[];
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
    };
    update_record?: {
        table: string;
        record_id: string;
        fields: Record<string, any>;
    };
    create_record?: {
        table: string;
        fields: Record<string, any>;
    };
    api_request?: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        body?: Record<string, any>;
    };
    webhook_call?: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: Record<string, string>;
        body?: Record<string, any>;
    };
}

export interface Condition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
}

// Constantes
export const triggerTypes: TriggerType[] = [
    'form_submission',
    'schedule',
    'webhook',
    'api_call',
    'event',
    'condition'
];

export const actionTypes: ActionType[] = [
    'send_email',
    'send_notification',
    'update_record',
    'create_record',
    'api_request',
    'webhook_call'
];

// Schéma de validation principal
const workflowSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            'string.min': 'Le nom doit contenir au moins 3 caractères',
            'string.max': 'Le nom ne peut pas dépasser 255 caractères',
            'any.required': 'Le nom est requis'
        }),

    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'La description ne peut pas dépasser 1000 caractères'
        }),

    trigger_type: Joi.string()
        .valid(...triggerTypes)
        .required()
        .messages({
            'any.only': 'Le type de déclencheur doit être l\'un des suivants : ' + triggerTypes.join(', '),
            'any.required': 'Le type de déclencheur est requis'
        }),

    trigger_config: Joi.object()
        .required()
        .messages({
            'any.required': 'La configuration du déclencheur est requise'
        }),

    action_type: Joi.string()
        .valid(...actionTypes)
        .required()
        .messages({
            'any.only': 'Le type d\'action doit être l\'un des suivants : ' + actionTypes.join(', '),
            'any.required': 'Le type d\'action est requis'
        }),

    action_config: Joi.object()
        .required()
        .messages({
            'any.required': 'La configuration de l\'action est requise'
        }),

    is_active: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'Le statut actif doit être un booléen'
        })
});

// Validateurs spécifiques pour chaque type de déclencheur
const triggerValidators = {
    form_submission: Joi.object({
        form_id: Joi.string().required(),
        fields: Joi.array().items(Joi.string()).min(1).required()
    }),

    schedule: Joi.object({
        cron: Joi.string().required(),
        timezone: Joi.string().default('UTC')
    }),

    webhook: Joi.object({
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
        headers: Joi.object().pattern(Joi.string(), Joi.string())
    }),

    api_call: Joi.object({
        endpoint: Joi.string().uri().required(),
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
        headers: Joi.object().pattern(Joi.string(), Joi.string())
    }),

    event: Joi.object({
        event_type: Joi.string().required(),
        conditions: Joi.array().items(Joi.object({
            field: Joi.string().required(),
            operator: Joi.string().valid('equals', 'not_equals', 'contains', 'greater_than', 'less_than').required(),
            value: Joi.any().required()
        }))
    }),

    condition: Joi.object({
        conditions: Joi.array().items(Joi.object({
            field: Joi.string().required(),
            operator: Joi.string().valid('equals', 'not_equals', 'contains', 'greater_than', 'less_than').required(),
            value: Joi.any().required()
        })).min(1).required(),
        logic: Joi.string().valid('AND', 'OR').required()
    })
};

// Validateurs spécifiques pour chaque type d'action
const actionValidators = {
    send_email: Joi.object({
        to: Joi.array().items(Joi.string().email()).min(1).required(),
        subject: Joi.string().required(),
        template_id: Joi.string().required(),
        variables: Joi.object()
    }),

    send_notification: Joi.object({
        user_ids: Joi.array().items(Joi.string()).min(1).required(),
        title: Joi.string().required(),
        message: Joi.string().required(),
        type: Joi.string().valid('info', 'success', 'warning', 'error').required()
    }),

    update_record: Joi.object({
        table: Joi.string().required(),
        record_id: Joi.string().required(),
        fields: Joi.object().min(1).required()
    }),

    create_record: Joi.object({
        table: Joi.string().required(),
        fields: Joi.object().min(1).required()
    }),

    api_request: Joi.object({
        url: Joi.string().uri().required(),
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
        headers: Joi.object().pattern(Joi.string(), Joi.string()),
        body: Joi.object()
    }),

    webhook_call: Joi.object({
        url: Joi.string().uri().required(),
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').required(),
        headers: Joi.object().pattern(Joi.string(), Joi.string()),
        body: Joi.object()
    })
};

// Fonctions de validation
export const validateWorkflow = (data: Partial<Workflow>) => {
    return workflowSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

export const validateTriggerConfig = (type: TriggerType, config: Record<string, any>) => {
    const validator = triggerValidators[type];
    if (!validator) {
        throw new Error(`No validator found for trigger type: ${type}`);
    }
    return validator.validate(config, {
        abortEarly: false,
        stripUnknown: true
    });
};

export const validateActionConfig = (type: ActionType, config: Record<string, any>) => {
    const validator = actionValidators[type];
    if (!validator) {
        throw new Error(`No validator found for action type: ${type}`);
    }
    return validator.validate(config, {
        abortEarly: false,
        stripUnknown: true
    });
}; 