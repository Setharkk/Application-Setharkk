import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as archiver from 'archiver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as zlib from 'zlib';

@Injectable()
export class BackupService {
  constructor(
    private configService: ConfigService,
  ) {}

  async createBackup(backupPath: string): Promise<string> {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss', { locale: fr });
    const backupFileName = `backup_${timestamp}.zip`;
    const fullBackupPath = path.join(backupPath, backupFileName);

    // Créer le dossier de sauvegarde s'il n'existe pas
    await fs.ensureDir(backupPath);

    // Créer le fichier zip avec compression maximale
    const output = fs.createWriteStream(fullBackupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression maximale
      store: false // Toujours compresser, même les fichiers déjà compressés
    });

    // Gérer les événements d'archivage
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Attention lors de la sauvegarde:', err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Pipe l'archive vers le fichier de sortie
    archive.pipe(output);

    // Sauvegarder la base de données
    await this.backupDatabase(archive);

    // Sauvegarder les fichiers de configuration
    await this.backupConfigs(archive);

    // Sauvegarder les fichiers générés
    await this.backupGeneratedFiles(archive);

    // Sauvegarder les ressources utilisateur
    await this.backupUserResources(archive);

    // Finaliser l'archive
    await archive.finalize();

    // Compresser davantage avec gzip après la création du zip
    await this.compressBackup(fullBackupPath);

    return fullBackupPath;
  }

  private async compressBackup(filePath: string): Promise<void> {
    const gzipPath = `${filePath}.gz`;
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(gzipPath);
    const gzip = zlib.createGzip({
      level: 9,
      memLevel: 9,
      strategy: zlib.constants.Z_DEFAULT_STRATEGY
    });

    await new Promise((resolve, reject) => {
      readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on('finish', async () => {
          await fs.remove(filePath);
          await fs.rename(gzipPath, filePath);
          resolve(null);
        })
        .on('error', reject);
    });
  }

  async getBackupStats(backupPath: string): Promise<{
    totalSize: number;
    count: number;
    oldestBackup: Date;
    newestBackup: Date;
    backups: Array<{
      name: string;
      size: number;
      date: Date;
      compressed: boolean;
    }>;
  }> {
    const files = await fs.readdir(backupPath);
    const backups = await Promise.all(
      files
        .filter(file => file.startsWith('backup_') && file.endsWith('.zip'))
        .map(async file => {
          const filePath = path.join(backupPath, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
            date: stats.mtime,
            compressed: true
          };
        })
    );

    if (backups.length === 0) {
      return {
        totalSize: 0,
        count: 0,
        oldestBackup: null,
        newestBackup: null,
        backups: []
      };
    }

    const sortedBackups = backups.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
      count: backups.length,
      oldestBackup: sortedBackups[sortedBackups.length - 1].date,
      newestBackup: sortedBackups[0].date,
      backups: sortedBackups
    };
  }

  private async backupDatabase(archive: archiver.Archiver): Promise<void> {
    // Exporter la base de données
    const dbBackupPath = path.join(process.cwd(), 'temp', 'db_backup.sql');
    await fs.ensureDir(path.dirname(dbBackupPath));
    
    // TODO: Implémenter l'export selon votre base de données
    // Exemple pour PostgreSQL:
    // await exec(`pg_dump -U ${user} -d ${database} > ${dbBackupPath}`);
    
    archive.file(dbBackupPath, { name: 'database/backup.sql' });
  }

  private async backupConfigs(archive: archiver.Archiver): Promise<void> {
    const configPath = path.join(process.cwd(), 'config');
    archive.directory(configPath, 'config');
  }

  private async backupGeneratedFiles(archive: archiver.Archiver): Promise<void> {
    const generatedPath = path.join(process.cwd(), 'generated');
    if (await fs.pathExists(generatedPath)) {
      archive.directory(generatedPath, 'generated');
    }
  }

  private async backupUserResources(archive: archiver.Archiver): Promise<void> {
    const resourcesPath = path.join(process.cwd(), 'resources');
    if (await fs.pathExists(resourcesPath)) {
      archive.directory(resourcesPath, 'resources');
    }
  }

  async cleanOldBackups(backupPath: string, retentionDays: number): Promise<void> {
    const files = await fs.readdir(backupPath);
    const now = new Date();

    for (const file of files) {
      if (!file.startsWith('backup_') || !file.endsWith('.zip')) continue;

      const filePath = path.join(backupPath, file);
      const stats = await fs.stat(filePath);
      const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (daysOld > retentionDays) {
        await fs.remove(filePath);
      }
    }
  }

  async restoreBackup(backupFile: string): Promise<void> {
    const extractPath = path.join(process.cwd(), 'temp', 'restore');
    await fs.ensureDir(extractPath);

    // TODO: Implémenter la restauration
    // 1. Extraire l'archive
    // 2. Restaurer la base de données
    // 3. Restaurer les fichiers de configuration
    // 4. Restaurer les fichiers générés
    // 5. Restaurer les ressources utilisateur
  }
} 