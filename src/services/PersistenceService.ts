import * as fs from 'fs';
import * as path from 'path';
import { GameState, Empire } from '../types';

/**
 * Persistence Service
 * Sauvegarde et charge l'état du jeu
 * Version simple: fichiers JSON
 * Production: PostgreSQL
 */
export class PersistenceService {
  private savePath: string;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(savePath: string = './game_saves') {
    this.savePath = savePath;
    this.ensureSaveDirectory();
  }

  /**
   * Créer le répertoire de sauvegarde s'il n'existe pas
   */
  private ensureSaveDirectory(): void {
    if (!fs.existsSync(this.savePath)) {
      fs.mkdirSync(this.savePath, { recursive: true });
      console.log(`[Persistence] Created save directory: ${this.savePath}`);
    }
  }

  /**
   * Sauvegarder l'état complet du jeu
   */
  public saveGameState(gameState: Partial<GameState>, filename: string = 'game_state.json'): boolean {
    try {
      const filePath = path.join(this.savePath, filename);

      // Convertir les Maps en objets sérialisables
      const serializable = {
        cycle: gameState.cycle || 0,
        paused: gameState.paused || false,
        empires: this.serializeEmpires(gameState.empires),
        sectors: gameState.sectors || [],
        marketPrices: this.serializeMap(gameState.marketPrices),
        tradeRoutes: gameState.tradeRoutes || [],
        timestamp: Date.now(),
      };

      fs.writeFileSync(filePath, JSON.stringify(serializable, null, 2));
      console.log(`[Persistence] Game state saved to ${filename}`);
      return true;
    } catch (error) {
      console.error(`[Persistence] Failed to save game state:`, error);
      return false;
    }
  }

  /**
   * Charger l'état du jeu
   */
  public loadGameState(filename: string = 'game_state.json'): Partial<GameState> | null {
    try {
      const filePath = path.join(this.savePath, filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`[Persistence] Save file not found: ${filename}`);
        return null;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Reconvertir les objets en Maps
      const gameState: Partial<GameState> = {
        cycle: data.cycle,
        paused: data.paused,
        empires: this.deserializeEmpires(data.empires),
        sectors: data.sectors,
        marketPrices: this.deserializeMap(data.marketPrices),
        tradeRoutes: data.tradeRoutes,
      };

      console.log(`[Persistence] Game state loaded from ${filename}`);
      return gameState;
    } catch (error) {
      console.error(`[Persistence] Failed to load game state:`, error);
      return null;
    }
  }

  /**
   * Sauvegarder un empire spécifique
   */
  public saveEmpire(empire: Empire, filename?: string): boolean {
    try {
      const filename_actual = filename || `empire_${empire.id}.json`;
      const filePath = path.join(this.savePath, filename_actual);

      fs.writeFileSync(filePath, JSON.stringify(empire, null, 2));
      console.log(`[Persistence] Empire ${empire.name} saved`);
      return true;
    } catch (error) {
      console.error(`[Persistence] Failed to save empire:`, error);
      return false;
    }
  }

  /**
   * Charger un empire
   */
  public loadEmpire(empireId: string): Empire | null {
    try {
      const filePath = path.join(this.savePath, `empire_${empireId}.json`);

      if (!fs.existsSync(filePath)) {
        console.warn(`[Persistence] Empire file not found: ${empireId}`);
        return null;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`[Persistence] Empire loaded: ${data.name}`);
      return data;
    } catch (error) {
      console.error(`[Persistence] Failed to load empire:`, error);
      return null;
    }
  }

  /**
   * Sauvegarder un historique de transaction
   */
  public logTransaction(empireId: string, transaction: any): void {
    try {
      const timestamp = new Date().toISOString();
      const logFile = path.join(this.savePath, `transaction_log_${empireId}.jsonl`);

      const logEntry = {
        timestamp,
        cycle: transaction.cycle || 0,
        type: transaction.type,
        amount: transaction.amount,
        details: transaction.details,
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.warn('[Persistence] Failed to log transaction:', error);
    }
  }

  /**
   * Lister toutes les sauvegardes
   */
  public listSaves(): string[] {
    try {
      return fs
        .readdirSync(this.savePath)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => {
          const aTime = fs.statSync(path.join(this.savePath, a)).mtime.getTime();
          const bTime = fs.statSync(path.join(this.savePath, b)).mtime.getTime();
          return bTime - aTime; // Most recent first
        });
    } catch (error) {
      console.error('[Persistence] Failed to list saves:', error);
      return [];
    }
  }

  /**
   * Supprimer une sauvegarde
   */
  public deleteSave(filename: string): boolean {
    try {
      const filePath = path.join(this.savePath, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Persistence] Deleted save: ${filename}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Persistence] Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Activer la sauvegarde automatique
   */
  public enableAutoSave(gameState: Partial<GameState>, intervalSeconds: number = 60): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.saveGameState(gameState, 'autosave.json');
    }, intervalSeconds * 1000);

    console.log(`[Persistence] Auto-save enabled every ${intervalSeconds} seconds`);
  }

  /**
   * Désactiver la sauvegarde automatique
   */
  public disableAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[Persistence] Auto-save disabled');
    }
  }

  /**
   * Créer une sauvegarde backup
   */
  public createBackup(filename: string = 'game_state.json'): boolean {
    try {
      const source = path.join(this.savePath, filename);
      const backup = path.join(this.savePath, `backup_${Date.now()}_${filename}`);

      if (fs.existsSync(source)) {
        fs.copyFileSync(source, backup);
        console.log(`[Persistence] Backup created: ${path.basename(backup)}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Persistence] Failed to create backup:', error);
      return false;
    }
  }

  /**
   * Exporter les stats pour analyse
   */
  public exportStats(stats: Record<string, unknown>, filename: string = 'stats.json'): boolean {
    try {
      const filePath = path.join(this.savePath, filename);
      fs.writeFileSync(filePath, JSON.stringify(stats, null, 2));
      console.log(`[Persistence] Stats exported to ${filename}`);
      return true;
    } catch (error) {
      console.error('[Persistence] Failed to export stats:', error);
      return false;
    }
  }

  // Helper methods for serialization
  private serializeEmpires(empires: Map<string, Empire> | undefined): any {
    if (!empires) return {};
    const obj: Record<string, Empire> = {};
    for (const [key, value] of empires) {
      obj[key] = value;
    }
    return obj;
  }

  private deserializeEmpires(obj: Record<string, Empire>): Map<string, Empire> {
    const map = new Map<string, Empire>();
    for (const [key, value] of Object.entries(obj)) {
      map.set(key, value);
    }
    return map;
  }

  private serializeMap(map: Map<any, any> | undefined): Record<string, any> {
    if (!map) return {};
    const obj: Record<string, any> = {};
    for (const [key, value] of map) {
      obj[String(key)] = value;
    }
    return obj;
  }

  private deserializeMap(obj: Record<string, any>): Map<any, any> {
    const map = new Map();
    for (const [key, value] of Object.entries(obj)) {
      map.set(key, value);
    }
    return map;
  }
}

export default PersistenceService;
