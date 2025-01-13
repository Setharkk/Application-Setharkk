import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackupService } from './backup.service';
import * as cron from 'node-cron';

@Injectable()
export class BackupSchedulerService implements OnModuleInit {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  constructor(
    private configService: ConfigService,
    private backupService: BackupService,
  ) {}

  onModuleInit() {
    // Charger la configuration des sauvegardes au démarrage
    const backupConfig = this.configService.get('backup');
    if (backupConfig?.enabled) {
      this.scheduleBackup(backupConfig);
    }
  }

  scheduleBackup(config: {
    enabled: boolean;
    frequency: string;
    retentionDays: number;
    path: string;
  }) {
    // Arrêter les tâches existantes
    this.stopAllTasks();

    if (!config.enabled) return;

    const cronExpression = this.getCronExpression(config.frequency);
    if (!cronExpression) return;

    const task = cron.schedule(cronExpression, async () => {
      try {
        await this.backupService.createBackup(config.path);
        await this.backupService.cleanOldBackups(config.path, config.retentionDays);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    });

    this.tasks.set('backup', task);
  }

  private getCronExpression(frequency: string): string {
    switch (frequency) {
      case 'hourly':
        return '0 * * * *';
      case 'daily':
        return '0 0 * * *';
      case 'weekly':
        return '0 0 * * 0';
      case 'monthly':
        return '0 0 1 * *';
      default:
        return null;
    }
  }

  private stopAllTasks() {
    for (const task of this.tasks.values()) {
      task.stop();
    }
    this.tasks.clear();
  }
} 