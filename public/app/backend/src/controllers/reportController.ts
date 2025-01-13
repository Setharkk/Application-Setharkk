import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import schedule from 'node-schedule';
import { Request, Response } from 'express';
import { IMarketingInsights } from '../types/models';
import { MarketingInsights } from '../models/marketingInsightsModel';
import { Report, IReport } from '../models/reportModel';

interface ReportData {
  [key: string]: any;
}

interface ScheduledJob {
  cancel: () => void;
}

// Map pour stocker les jobs planifiés
const scheduledJobs: Map<string, ScheduledJob> = new Map();

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD
    }
});

// Obtenir tous les rapports
export const getReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const reports = await Report.find()
            .sort('-createdAt')
            .populate('metrics');

        res.json({
            success: true,
            reports: reports.map(report => ({
                id: report._id,
                name: report.name,
                frequency: report.frequency,
                metrics: report.metrics,
                recipients: report.recipients,
                autoSend: report.autoSend,
                format: report.format,
                lastGenerated: report.lastGenerated
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des rapports",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};

// Créer un nouveau rapport
export const createReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, frequency, metrics, recipients, autoSend, format } = req.body;

        const report = new Report({
            name,
            frequency,
            metrics,
            recipients: recipients.split(',').map((email: string) => email.trim()),
            autoSend,
            format
        });

        await report.save();

        if (autoSend) {
            scheduleReport(report);
        }

        res.json({
            success: true,
            message: "Rapport créé avec succès",
            report: {
                id: report._id,
                name: report.name,
                frequency: report.frequency,
                metrics: report.metrics,
                recipients: report.recipients,
                autoSend: report.autoSend,
                format: report.format
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création du rapport",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};

// Mettre à jour un rapport
export const updateReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, frequency, metrics, recipients, autoSend, format } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            res.status(404).json({
                success: false,
                message: "Rapport non trouvé"
            });
            return;
        }

        // Annuler le job planifié existant
        if (scheduledJobs.has(id)) {
            scheduledJobs.get(id)?.cancel();
            scheduledJobs.delete(id);
        }

        report.name = name;
        report.frequency = frequency;
        report.metrics = metrics;
        report.recipients = recipients.split(',').map((email: string) => email.trim());
        report.autoSend = autoSend;
        report.format = format;

        await report.save();

        // Replanifier si nécessaire
        if (autoSend) {
            scheduleReport(report);
        }

        res.json({
            success: true,
            message: "Rapport mis à jour avec succès",
            report: {
                id: report._id,
                name: report.name,
                frequency: report.frequency,
                metrics: report.metrics,
                recipients: report.recipients,
                autoSend: report.autoSend,
                format: report.format
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du rapport",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};

// Supprimer un rapport
export const deleteReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Annuler le job planifié
        if (scheduledJobs.has(id)) {
            scheduledJobs.get(id)?.cancel();
            scheduledJobs.delete(id);
        }

        await Report.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Rapport supprimé avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression du rapport",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};

// Générer un rapport immédiatement
export const generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const report = await Report.findById(id);

        if (!report) {
            res.status(404).json({
                success: false,
                message: "Rapport non trouvé"
            });
            return;
        }

        const data = await generateReportData(report.metrics);
        const buffer = await createReportFile(data, report.format, report.name);

        res.setHeader('Content-Type', getContentType(report.format));
        res.setHeader('Content-Disposition', `attachment; filename=${report.name}.${report.format}`);
        res.send(buffer);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la génération du rapport",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
};

// Fonctions utilitaires

const scheduleReport = (report: IReport): void => {
    let schedulePattern: string;
    switch (report.frequency) {
        case 'daily':
            schedulePattern = '0 0 * * *'; // Tous les jours à minuit
            break;
        case 'weekly':
            schedulePattern = '0 0 * * 1'; // Tous les lundis à minuit
            break;
        case 'monthly':
            schedulePattern = '0 0 1 * *'; // Le premier jour de chaque mois à minuit
            break;
        default:
            schedulePattern = '0 0 * * 1'; // Par défaut : hebdomadaire
    }

    const job = schedule.scheduleJob(schedulePattern, async () => {
        try {
            const data = await generateReportData(report.metrics);
            const buffer = await createReportFile(data, report.format, report.name);
            await sendReport(report, buffer);

            // Mettre à jour la date de dernière génération
            report.lastGenerated = new Date();
            await report.save();
        } catch (error) {
            console.error(`Erreur lors de la génération automatique du rapport ${report.name}:`, error);
        }
    });

    scheduledJobs.set(report._id.toString(), job);
};

const generateReportData = async (metrics: string[]): Promise<ReportData> => {
    const data: ReportData = {};
    const insights = await MarketingInsights.findOne().sort({ createdAt: -1 });

    if (!insights) {
        throw new Error('Aucune donnée marketing disponible');
    }

    metrics.forEach(metric => {
        switch (metric) {
            case 'roi':
                data.ROI = calculateROI(insights);
                break;
            case 'cpa':
                data.CPA = calculateCPA(insights);
                break;
            // Ajouter d'autres métriques selon les besoins
        }
    });

    return data;
};

const createReportFile = async (data: ReportData, format: string, title: string): Promise<Buffer> => {
    switch (format.toLowerCase()) {
        case 'pdf':
            return await createPDFReport(data, title);
        case 'excel':
            return await createExcelReport(data, title);
        default:
            throw new Error('Format de rapport non supporté');
    }
};

const createPDFReport = async (data: ReportData, title: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(25).text(title, { align: 'center' });
            doc.moveDown();

            Object.entries(data).forEach(([key, value]) => {
                doc.fontSize(14).text(`${key}: ${value}`);
                doc.moveDown();
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const createExcelReport = async (data: ReportData, title: string): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Ajouter les données
    Object.entries(data).forEach(([key, value], index) => {
        worksheet.getCell(`A${index + 1}`).value = key;
        worksheet.getCell(`B${index + 1}`).value = value;
    });

    // Retourner le buffer
    return await workbook.xlsx.writeBuffer();
};

const createHTMLReport = async (data: ReportData, title: string): Promise<string> => {
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; text-align: center; }
                .metric { margin: 20px 0; padding: 10px; background: #f5f5f5; }
                .metric-name { font-weight: bold; color: #666; }
                .metric-value { font-size: 1.2em; color: #333; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
    `;

    Object.entries(data).forEach(([key, value]) => {
        html += `
            <div class="metric">
                <div class="metric-name">${key}</div>
                <div class="metric-value">${value}</div>
            </div>
        `;
    });

    html += `
        </body>
        </html>
    `;

    return html;
};

const sendReport = async (report: IReport, buffer: Buffer): Promise<void> => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: report.recipients.join(', '),
        subject: `Rapport: ${report.name}`,
        text: `Veuillez trouver ci-joint votre rapport ${report.name}`,
        attachments: [{
            filename: `${report.name}.${report.format.toLowerCase()}`,
            content: buffer
        }]
    };

    await transporter.sendMail(mailOptions);
};

const getContentType = (format: string): string => {
    switch (format.toLowerCase()) {
        case 'pdf':
            return 'application/pdf';
        case 'excel':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'html':
            return 'text/html';
        default:
            return 'application/octet-stream';
    }
};

const calculateROI = (insight: IMarketingInsights): number => {
    const revenue = insight.revenue || 0;
    const costs = insight.costs || 0;
    return costs > 0 ? ((revenue - costs) / costs) * 100 : 0;
};

const calculateCPA = (insight: IMarketingInsights): number => {
    const costs = insight.costs || 0;
    const acquisitions = insight.acquisitions || 0;
    return acquisitions > 0 ? costs / acquisitions : 0;
}; 