/**
 * Plugin Scanner for Unreal Engine
 * Scans and catalogs installed plugins
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PluginInfo, UProjectModule } from './types.js';

interface UpluginFile {
  FileVersion: number;
  Version: number;
  VersionName: string;
  FriendlyName: string;
  Description: string;
  Category: string;
  CreatedBy?: string;
  CreatedByURL?: string;
  DocsURL?: string;
  MarketplaceURL?: string;
  SupportURL?: string;
  EngineVersion?: string;
  CanContainContent: boolean;
  IsBetaVersion?: boolean;
  IsExperimentalVersion?: boolean;
  Installed?: boolean;
  Modules?: UProjectModule[];
  Plugins?: Array<{ Name: string; Enabled: boolean }>;
}

export class UnrealPluginScanner {
  private projectPath: string;
  private plugins: Map<string, PluginInfo> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Scan for all plugins (project and engine)
   */
  async scanPlugins(): Promise<PluginInfo[]> {
    this.plugins.clear();

    // Scan project plugins
    const projectPluginsPath = path.join(this.projectPath, 'Plugins');
    await this.scanPluginDirectory(projectPluginsPath);

    return Array.from(this.plugins.values());
  }

  /**
   * Scan a plugin directory
   */
  private async scanPluginDirectory(pluginDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(pluginDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(pluginDir, entry.name);
          await this.scanSinglePlugin(pluginPath, entry.name);
        }
      }
    } catch (error) {
      // Plugin directory might not exist, that's okay
    }
  }

  /**
   * Scan a single plugin
   */
  private async scanSinglePlugin(pluginPath: string, pluginName: string): Promise<void> {
    try {
      const upluginFiles = await fs.readdir(pluginPath);
      const upluginFile = upluginFiles.find(f => f.endsWith('.uplugin'));

      if (!upluginFile) {
        return;
      }

      const upluginPath = path.join(pluginPath, upluginFile);
      const content = await fs.readFile(upluginPath, 'utf-8');
      const pluginData: UpluginFile = JSON.parse(content);

      const plugin: PluginInfo = {
        name: pluginName,
        enabled: true,
        version: pluginData.Version?.toString(),
        versionName: pluginData.VersionName,
        friendlyName: pluginData.FriendlyName,
        description: pluginData.Description,
        category: pluginData.Category,
        createdBy: pluginData.CreatedBy,
        marketplaceURL: pluginData.MarketplaceURL,
        supportURL: pluginData.SupportURL,
        engineVersion: pluginData.EngineVersion,
        canContainContent: pluginData.CanContainContent,
        isBetaVersion: pluginData.IsBetaVersion,
        isExperimentalVersion: pluginData.IsExperimentalVersion,
        installed: pluginData.Installed !== false,
        modules: pluginData.Modules,
        path: pluginPath
      };

      this.plugins.set(pluginName, plugin);
    } catch (error) {
      console.error(`Error scanning plugin ${pluginName}:`, error);
    }
  }

  /**
   * Get all plugins
   */
  getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): PluginInfo[] {
    return this.getPlugins().filter(plugin => plugin.enabled);
  }

  /**
   * Find plugin by name
   */
  findPlugin(pluginName: string): PluginInfo | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): PluginInfo[] {
    return this.getPlugins().filter(plugin =>
      plugin.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Check if plugin is installed
   */
  isPluginInstalled(pluginName: string): boolean {
    const plugin = this.findPlugin(pluginName);
    return plugin !== undefined && plugin.installed === true;
  }

  /**
   * Get plugin statistics
   */
  getPluginStatistics(): { total: number; enabled: number; categories: Record<string, number> } {
    const plugins = this.getPlugins();
    const categories: Record<string, number> = {};

    for (const plugin of plugins) {
      if (plugin.category) {
        categories[plugin.category] = (categories[plugin.category] || 0) + 1;
      }
    }

    return {
      total: plugins.length,
      enabled: this.getEnabledPlugins().length,
      categories
    };
  }
}
