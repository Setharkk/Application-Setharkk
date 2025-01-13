import { Router, Request, Response } from 'express';
import { chatController } from '../controllers/chatController';
import { validateMessage } from '../middleware/validation';

interface ChatResponse {
    message: string;
    timestamp: number;
    data?: any;
}

interface MessageRequest {
    message: string;
}

interface ActionRequest {
    action: string;
}

const router = Router();

router.post('/message', validateMessage, async (req: Request<{}, {}, MessageRequest>, res: Response) => {
    try {
        const { message } = req.body;
        const response: ChatResponse = await chatController.handleMessage(message);
        res.json({
            success: true,
            message: response.message,
            timestamp: response.timestamp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

router.post('/action', async (req: Request<{}, {}, ActionRequest>, res: Response) => {
    try {
        const { action } = req.body;
        const response: ChatResponse = await chatController.handleAction(action);
        res.json({
            success: true,
            message: response.message,
            data: response.data,
            timestamp: response.timestamp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

export default router; 