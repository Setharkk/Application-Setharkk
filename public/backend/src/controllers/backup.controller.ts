import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { BackupService } from '../services/backup.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('api/admin/backup')
export class BackupController {
  constructor(
    private backupService: BackupService,
    private configService: ConfigService,
  ) {}

  @Post()
  async createBackup(@Body() body: { path: string }) {
    const backupPath = body.path || this.configService.get('backup.defaultPath');
    return await this.backupService.createBackup(backupPath);
  }

  @Post('schedule')
  async scheduleBackup(@Body() body: { 
    enabled: boolean;
    frequency: string;
    retentionDays: number;
    path: string;
  }) {
    // TODO: Implémenter la planification des sauvegardes
    // Utiliser un service de planification comme node-cron
    return { success: true };
  }

  @Get('list')
  async listBackups() {
    const backupPath = this.configService.get('backup.defaultPath');
    const files = await fs.readdir(backupPath);
    return files.filter(file => file.startsWith('backup_') && file.endsWith('.zip'))
      .map(file => ({
        name: file,
        path: path.join(backupPath, file),
        date: new Date(file.replace('backup_', '').replace('.zip', ''))
      }));
  }

  @Post('restore/:filename')
  async restoreBackup(@Param('filename') filename: string) {
    const backupPath = this.configService.get('backup.defaultPath');
    const backupFile = path.join(backupPath, filename);
    
    if (!await fs.pathExists(backupFile)) {
      throw new Error('Fichier de sauvegarde non trouvé');
    }

    await this.backupService.restoreBackup(backupFile);
    return { success: true };
  }

  @Delete(':filename')
  async deleteBackup(@Param('filename') filename: string) {
    const backupPath = this.configService.get('backup.defaultPath');
    const backupFile = path.join(backupPath, filename);
    
    if (await fs.pathExists(backupFile)) {
      await fs.remove(backupFile);
    }
    
    return { success: true };
  }
} 