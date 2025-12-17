/**
 * Unreal Engine Project File Parser
 * Parses .uproject files and extracts project configuration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { UProjectFile, UnrealProjectConfig, ModuleInfo, PluginInfo } from './types.js';

export class UnrealProjectParser {
  private projectPath: string;
  private uprojectPath?: string;
  private projectData?: UProjectFile;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Find the .uproject file in the given directory
   */
  async findUProjectFile(): Promise<string> {
    if (this.uprojectPath) {
      return this.uprojectPath;
    }

    try {
      const files = await fs.readdir(this.projectPath);
      const uprojectFile = files.find(file => file.endsWith('.uproject'));
      
      if (!uprojectFile) {
        throw new Error(`No .uproject file found in ${this.projectPath}`);
      }

      this.uprojectPath = path.join(this.projectPath, uprojectFile);
      return this.uprojectPath;
    } catch (error) {
      throw new Error(`Failed to find .uproject file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse the .uproject file
   */
  async parseUProject(): Promise<UProjectFile> {
    if (this.projectData) {
      return this.projectData;
    }

    const uprojectPath = await this.findUProjectFile();
    
    try {
      const content = await fs.readFile(uprojectPath, 'utf-8');
      this.projectData = JSON.parse(content) as UProjectFile;
      return this.projectData;
    } catch (error) {
      throw new Error(`Failed to parse .uproject file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get complete project configuration
   */
  async getProjectConfig(): Promise<UnrealProjectConfig> {
    const projectData = await this.parseUProject();
    const projectName = path.basename(this.uprojectPath!, '.uproject');

    // Parse modules
    const modules: ModuleInfo[] = projectData.Modules.map(module => ({
      name: module.Name,
      type: module.Type,
      loadingPhase: module.LoadingPhase,
      dependencies: module.AdditionalDependencies || [],
      classes: [], // Will be populated by code analysis
      path: path.join(this.projectPath, 'Source', module.Name)
    }));

    // Parse plugins
    const plugins: PluginInfo[] = (projectData.Plugins || []).map(plugin => ({
      name: plugin.Name,
      enabled: plugin.Enabled,
      marketplaceURL: plugin.MarketplaceURL,
      supportURL: undefined,
      installed: true,
      path: path.join(this.projectPath, 'Plugins', plugin.Name)
    }));

    // Detect build configurations
    const buildConfigurations = this.detectBuildConfigurations(projectData);

    return {
      projectPath: this.projectPath,
      projectName,
      engineVersion: projectData.EngineAssociation,
      engineAssociation: projectData.EngineAssociation,
      modules,
      plugins,
      targetPlatforms: projectData.TargetPlatforms || ['Windows'],
      buildConfigurations
    };
  }

  /**
   * Detect available build configurations
   */
  private detectBuildConfigurations(projectData: UProjectFile): any[] {
    const configurations: any[] = [];
    const platforms = projectData.TargetPlatforms || ['Windows'];
    const buildTypes = ['Development', 'Shipping', 'DebugGame'];

    for (const platform of platforms) {
      for (const buildType of buildTypes) {
        configurations.push({
          name: `${platform}_${buildType}`,
          platform,
          configuration: buildType
        });
      }
    }

    return configurations;
  }

  /**
   * Get engine version
   */
  async getEngineVersion(): Promise<string> {
    const projectData = await this.parseUProject();
    return projectData.EngineAssociation;
  }

  /**
   * Get modules list
   */
  async getModules(): Promise<ModuleInfo[]> {
    const config = await this.getProjectConfig();
    return config.modules;
  }

  /**
   * Get plugins list
   */
  async getPlugins(): Promise<PluginInfo[]> {
    const config = await this.getProjectConfig();
    return config.plugins;
  }

  /**
   * Validate project structure
   */
  async validateProjectStructure(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      await this.findUProjectFile();
    } catch (error) {
      issues.push(`No .uproject file found`);
      return { valid: false, issues };
    }

    try {
      const projectData = await this.parseUProject();
      
      // Check for modules
      if (!projectData.Modules || projectData.Modules.length === 0) {
        issues.push('No modules defined in .uproject file');
      }

      // Check Source directory exists
      try {
        const sourcePath = path.join(this.projectPath, 'Source');
        await fs.access(sourcePath);
      } catch {
        issues.push('Source directory not found');
      }

      // Check Content directory exists
      try {
        const contentPath = path.join(this.projectPath, 'Content');
        await fs.access(contentPath);
      } catch {
        issues.push('Content directory not found');
      }

      // Validate each module
      for (const module of projectData.Modules) {
        const modulePath = path.join(this.projectPath, 'Source', module.Name);
        try {
          await fs.access(modulePath);
        } catch {
          issues.push(`Module directory not found: ${module.Name}`);
        }
      }

    } catch (error) {
      issues.push(`Failed to parse .uproject file: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
