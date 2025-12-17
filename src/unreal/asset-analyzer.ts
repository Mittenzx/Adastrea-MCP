/**
 * Asset Analyzer for Unreal Engine
 * Scans and catalogs project assets
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AssetInfo, BlueprintAsset } from './types.js';

export class UnrealAssetAnalyzer {
  private projectPath: string;
  private assets: Map<string, AssetInfo> = new Map();
  private blueprints: Map<string, BlueprintAsset> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Scan the Content directory for assets
   */
  async scanAssets(): Promise<AssetInfo[]> {
    const contentPath = path.join(this.projectPath, 'Content');
    this.assets.clear();

    try {
      await this.scanDirectory(contentPath, '');
    } catch (error) {
      console.error('Error scanning assets:', error);
    }

    return Array.from(this.assets.values());
  }

  /**
   * Recursively scan directory for assets
   */
  private async scanDirectory(dirPath: string, relativePath: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const assetPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, assetPath);
        } else if (this.isAssetFile(entry.name)) {
          await this.catalogAsset(fullPath, assetPath);
        }
      }
    } catch (error) {
      // Silently skip inaccessible directories
    }
  }

  /**
   * Check if file is an Unreal asset
   */
  private isAssetFile(filename: string): boolean {
    const assetExtensions = [
      '.uasset',
      '.umap',
      '.ubulk',
      '.uplugin',
      '.upluginmanifest'
    ];

    return assetExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Catalog an asset
   */
  private async catalogAsset(fullPath: string, relativePath: string): Promise<void> {
    try {
      const stats = await fs.stat(fullPath);
      const assetType = this.getAssetType(relativePath);
      const assetName = path.basename(relativePath, path.extname(relativePath));

      const asset: AssetInfo = {
        name: assetName,
        path: relativePath,
        type: assetType,
        size: stats.size,
        dependencies: [],
        referencedBy: []
      };

      this.assets.set(relativePath, asset);

      // If it's a Blueprint, analyze it further
      if (assetType === 'Blueprint') {
        await this.analyzeBlueprint(fullPath, relativePath);
      }
    } catch (error) {
      // Silently skip assets that can't be analyzed
    }
  }

  /**
   * Determine asset type from path and extension
   */
  private getAssetType(assetPath: string): string {
    const ext = path.extname(assetPath);
    const fileName = path.basename(assetPath, ext);
    const dirPath = path.dirname(assetPath);

    // Map by extension
    if (ext === '.umap') return 'Level';
    if (ext === '.uplugin') return 'Plugin';

    // Map by directory convention and filename prefixes
    if (dirPath.includes('Blueprints') || fileName.startsWith('BP_')) {
      return 'Blueprint';
    }
    if (dirPath.includes('Materials') || fileName.startsWith('M_')) {
      return 'Material';
    }
    if (dirPath.includes('Textures') || fileName.startsWith('T_')) {
      return 'Texture';
    }
    if (dirPath.includes('Meshes') || fileName.startsWith('SM_') || fileName.startsWith('SK_')) {
      return 'Mesh';
    }
    if (dirPath.includes('Animations') || fileName.startsWith('A_') || fileName.startsWith('AM_')) {
      return 'Animation';
    }
    if (dirPath.includes('Audio') || dirPath.includes('Sound')) {
      return 'Audio';
    }
    if (dirPath.includes('Particles') || fileName.startsWith('P_')) {
      return 'Particle System';
    }
    if (dirPath.includes('UI') || fileName.startsWith('W_') || fileName.startsWith('WBP_')) {
      return 'Widget';
    }

    return 'Asset';
  }

  /**
   * Analyze Blueprint asset (basic metadata only)
   */
  private async analyzeBlueprint(fullPath: string, relativePath: string): Promise<void> {
    try {
      const assetName = path.basename(relativePath, path.extname(relativePath));

      // For now, we only store basic metadata
      // Full Blueprint parsing would require UE's asset API or binary parsing
      const blueprint: BlueprintAsset = {
        name: assetName,
        path: relativePath,
        type: 'Blueprint',
        parentClass: undefined, // Would need asset parsing
        interfaces: [],
        variables: [],
        functions: []
      };

      this.blueprints.set(relativePath, blueprint);
    } catch (error) {
      // Silently skip blueprints that can't be analyzed
    }
  }

  /**
   * Get all assets
   */
  getAssets(): AssetInfo[] {
    return Array.from(this.assets.values());
  }

  /**
   * Get assets by type
   */
  getAssetsByType(type: string): AssetInfo[] {
    return this.getAssets().filter(asset => asset.type === type);
  }

  /**
   * Search assets
   */
  searchAssets(query: string): AssetInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getAssets().filter(asset =>
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.path.toLowerCase().includes(lowerQuery) ||
      asset.type.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get asset by path
   */
  getAsset(assetPath: string): AssetInfo | undefined {
    return this.assets.get(assetPath);
  }

  /**
   * Get all blueprints
   */
  getBlueprints(): BlueprintAsset[] {
    return Array.from(this.blueprints.values());
  }

  /**
   * Get asset statistics
   */
  getAssetStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const asset of this.getAssets()) {
      stats[asset.type] = (stats[asset.type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get total content size
   */
  getTotalContentSize(): number {
    let totalSize = 0;
    
    for (const asset of this.getAssets()) {
      totalSize += asset.size || 0;
    }

    return totalSize;
  }
}
