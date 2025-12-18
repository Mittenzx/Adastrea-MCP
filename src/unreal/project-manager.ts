/**
 * Unreal Project Manager
 * Main coordinator for all Unreal Engine project analysis
 */

import { UnrealProjectParser } from './project-parser.js';
import { UnrealCodeAnalyzer } from './code-analyzer.js';
import { UnrealAssetAnalyzer } from './asset-analyzer.js';
import { UnrealPluginScanner } from './plugin-scanner.js';
import { BlueprintInspector } from './blueprint-inspector.js';
import { BlueprintModifier } from './blueprint-modifier.js';
import {
  UnrealProjectConfig,
  UnrealClass,
  UnrealFunction,
  AssetInfo,
  BlueprintAsset,
  PluginInfo,
  ModuleInfo,
  ProjectSummary,
  DetailedBlueprintInfo,
  BlueprintVariable,
  BlueprintFunction as BlueprintFunctionType,
  BlueprintNode,
} from './types.js';

export class UnrealProjectManager {
  private projectPath: string;
  private parser: UnrealProjectParser;
  private codeAnalyzer: UnrealCodeAnalyzer;
  private assetAnalyzer: UnrealAssetAnalyzer;
  private pluginScanner: UnrealPluginScanner;
  private blueprintInspector: BlueprintInspector;
  private blueprintModifier: BlueprintModifier;
  
  private config?: UnrealProjectConfig;
  private classes: UnrealClass[] = [];
  private functions: UnrealFunction[] = [];
  private assets: AssetInfo[] = [];
  private plugins: PluginInfo[] = [];

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.parser = new UnrealProjectParser(projectPath);
    this.codeAnalyzer = new UnrealCodeAnalyzer(projectPath);
    this.assetAnalyzer = new UnrealAssetAnalyzer(projectPath);
    this.pluginScanner = new UnrealPluginScanner(projectPath);
    this.blueprintInspector = new BlueprintInspector(projectPath);
    this.blueprintModifier = new BlueprintModifier(projectPath);
  }

  /**
   * Perform a full project scan
   */
  async scanProject(): Promise<void> {
    // Parse project configuration
    this.config = await this.parser.getProjectConfig();

    // Scan all modules for C++ code
    for (const module of this.config.modules) {
      if (module.path) {
        const { classes, functions } = await this.codeAnalyzer.scanModule(module.path);
        this.classes.push(...classes);
        this.functions.push(...functions);
        module.classes = classes.map(c => c.name);
      }
    }

    // Scan assets
    this.assets = await this.assetAnalyzer.scanAssets();

    // Scan plugins
    this.plugins = await this.pluginScanner.scanPlugins();
  }

  /**
   * Get project configuration
   */
  getProjectConfig(): UnrealProjectConfig | undefined {
    return this.config;
  }

  /**
   * Get all classes
   */
  getClasses(): UnrealClass[] {
    return this.classes;
  }

  /**
   * Get classes by type
   */
  getClassesByType(type: string): UnrealClass[] {
    return this.classes.filter(c => c.type === type);
  }

  /**
   * Get all functions
   */
  getFunctions(): UnrealFunction[] {
    return this.functions;
  }

  /**
   * Get Blueprint-callable functions
   */
  getBlueprintCallableFunctions(): UnrealFunction[] {
    return this.functions.filter(f => f.blueprintCallable);
  }

  /**
   * Get all assets
   */
  getAssets(): AssetInfo[] {
    return this.assets;
  }

  /**
   * Get assets by type
   */
  getAssetsByType(type: string): AssetInfo[] {
    return this.assetAnalyzer.getAssetsByType(type);
  }

  /**
   * Get all blueprints
   */
  getBlueprints(): BlueprintAsset[] {
    return this.assetAnalyzer.getBlueprints();
  }

  /**
   * Get all plugins
   */
  getPlugins(): PluginInfo[] {
    return this.plugins;
  }

  /**
   * Get modules
   */
  getModules(): ModuleInfo[] {
    return this.config?.modules || [];
  }

  /**
   * Search for classes
   */
  searchClasses(query: string): UnrealClass[] {
    return this.codeAnalyzer.searchClasses(query);
  }

  /**
   * Search for assets
   */
  searchAssets(query: string): AssetInfo[] {
    return this.assetAnalyzer.searchAssets(query);
  }

  /**
   * Get class hierarchy
   */
  getClassHierarchy(className: string): string[] {
    return this.codeAnalyzer.getClassHierarchy(className);
  }

  /**
   * Find class usage (where it's referenced)
   */
  findClassUsage(className: string): { files: string[]; count: number } {
    const files = new Set<string>();
    
    // Check in other classes
    for (const cls of this.classes) {
      if (cls.parentClass === className && cls.file) {
        files.add(cls.file);
      }
    }

    // Check in functions
    for (const func of this.functions) {
      if (func.returnType.includes(className) && func.file) {
        files.add(func.file);
      }
      for (const param of func.parameters) {
        if (param.type.includes(className) && func.file) {
          files.add(func.file);
        }
      }
    }

    return {
      files: Array.from(files),
      count: files.size
    };
  }

  /**
   * Validate project structure
   */
  async validateProject(): Promise<{ valid: boolean; issues: string[] }> {
    return await this.parser.validateProjectStructure();
  }

  /**
   * Get project summary
   */
  getProjectSummary(): ProjectSummary {
    const assetStats = this.assetAnalyzer.getAssetStatistics();
    const pluginStats = this.pluginScanner.getPluginStatistics();

    return {
      projectName: this.config?.projectName,
      engineVersion: this.config?.engineVersion,
      modules: {
        total: this.config?.modules.length || 0,
        list: this.config?.modules.map(m => m.name) || []
      },
      classes: {
        total: this.classes.length,
        byType: {
          UCLASS: this.getClassesByType('UCLASS').length,
          USTRUCT: this.getClassesByType('USTRUCT').length,
          UENUM: this.getClassesByType('UENUM').length,
          UINTERFACE: this.getClassesByType('UINTERFACE').length
        }
      },
      functions: {
        total: this.functions.length,
        blueprintCallable: this.getBlueprintCallableFunctions().length
      },
      assets: {
        total: this.assets.length,
        byType: assetStats,
        totalSize: this.assetAnalyzer.getTotalContentSize()
      },
      blueprints: {
        total: this.getBlueprints().length
      },
      plugins: {
        total: pluginStats.total,
        enabled: pluginStats.enabled,
        categories: pluginStats.categories
      },
      platforms: this.config?.targetPlatforms || []
    };
  }

  // Blueprint Inspection Methods

  /**
   * Inspect a Blueprint and return detailed information
   */
  async inspectBlueprint(blueprintPath: string): Promise<DetailedBlueprintInfo> {
    return await this.blueprintInspector.inspectBlueprint(blueprintPath);
  }

  /**
   * Get all variables from a Blueprint
   */
  async getBlueprintVariables(blueprintPath: string): Promise<BlueprintVariable[]> {
    return await this.blueprintInspector.getBlueprintVariables(blueprintPath);
  }

  /**
   * Get all functions from a Blueprint
   */
  async getBlueprintFunctions(blueprintPath: string): Promise<BlueprintFunctionType[]> {
    return await this.blueprintInspector.getBlueprintFunctions(blueprintPath);
  }

  /**
   * Search for specific node types within a Blueprint
   */
  async searchBlueprintNodes(blueprintPath: string, nodeType?: string): Promise<BlueprintNode[]> {
    return await this.blueprintInspector.searchBlueprintNodes(blueprintPath, nodeType);
  }

  /**
   * Search for Blueprints matching a query
   */
  searchBlueprints(query: string): BlueprintAsset[] {
    const blueprints = this.getBlueprints();
    return this.blueprintInspector.searchBlueprints(blueprints, query);
  }

  /**
   * Get Blueprint statistics
   */
  getBlueprintStatistics() {
    const blueprints = this.getBlueprints();
    return this.blueprintInspector.getBlueprintStatistics(blueprints);
  }

  // Blueprint Modification Methods

  /**
   * Add a new variable to a Blueprint
   */
  async addBlueprintVariable(blueprintPath: string, variable: BlueprintVariable) {
    return await this.blueprintModifier.addBlueprintVariable(blueprintPath, variable);
  }

  /**
   * Add a new function to a Blueprint
   */
  async addBlueprintFunction(blueprintPath: string, functionDef: BlueprintFunctionType) {
    return await this.blueprintModifier.addBlueprintFunction(blueprintPath, functionDef);
  }

  /**
   * Modify a Blueprint property (variable default value)
   */
  async modifyBlueprintProperty(blueprintPath: string, propertyName: string, newValue: any) {
    return await this.blueprintModifier.modifyBlueprintProperty(blueprintPath, propertyName, newValue);
  }

  /**
   * Execute a UE Editor command for advanced Blueprint manipulation
   */
  async executeBlueprintCommand(command: string) {
    return await this.blueprintModifier.executeBlueprintCommand(command);
  }

  /**
   * Set the Director bridge for Blueprint modifications
   */
  setDirectorBridge(bridge: any): void {
    this.blueprintModifier.setDirectorBridge(bridge);
  }
}
