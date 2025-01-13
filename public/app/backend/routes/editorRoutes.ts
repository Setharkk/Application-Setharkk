import { Router, Request, Response } from 'express';
import { editorController } from '../controllers/editorController';

interface ContentRequest {
    content: string;
}

interface EditorResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

const router = Router();

router.post('/initialize', async (_req: Request, res: Response) => {
    try {
        const data = await editorController.initializeEditor();
        res.json({
            success: true,
            data
        } as EditorResponse<typeof data>);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as EditorResponse<never>);
    }
});

router.post('/update', async (req: Request<{}, {}, ContentRequest>, res: Response) => {
    try {
        const { content } = req.body;
        const data = await editorController.updateContent(content);
        res.json({
            success: true,
            data
        } as EditorResponse<typeof data>);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as EditorResponse<never>);
    }
});

router.post('/analyze', async (req: Request<{}, {}, ContentRequest>, res: Response) => {
    try {
        const { content } = req.body;
        const analysis = await editorController.analyzeContent(content);
        res.json({
            success: true,
            data: analysis
        } as EditorResponse<typeof analysis>);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as EditorResponse<never>);
    }
});

export default router; 