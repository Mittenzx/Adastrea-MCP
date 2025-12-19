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
import { ActorManager } from './actor-manager.js';
import { ActorTemplateManager } from './actor-template-manager.js';
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
  LevelActor,
  SpawnActorConfig,
  SpawnActorResult,
  ModifyActorPropertiesConfig,
  ModifyActorPropertiesResult,
  ComponentHierarchy,
  ListActorsResponse,
  ActorTemplate,
  CreateTemplateConfig,
  InstantiateTemplateConfig,
} from './types.js';

export class UnrealProjectManager {
  private projectPath: string;
  private parser: UnrealProjectParser;
  private codeAnalyzer: UnrealCodeAnalyzer;
  private assetAnalyzer: UnrealAssetAnalyzer;
  private pluginScanner: UnrealPluginScanner;
  private blueprintInspector: BlueprintInspector;
  private blueprintModifier: BlueprintModifier;
  private actorManager: ActorManager;
  private actorTemplateManager: ActorTemplateManager;
  
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
    this.actorManager = new ActorManager(projectPath);
    this.actorTemplateManager = new ActorTemplateManager(projectPath);
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

  // ========================
  // Actor Management Methods
  // ========================

  /**
   * Get all actors in the currently loaded level
   */
  async getActorsInLevel(): Promise<ListActorsResponse> {
    return await this.actorManager.getActorsInLevel();
  }

  /**
   * Spawn a new actor in the level
   */
  async spawnActor(config: SpawnActorConfig): Promise<SpawnActorResult> {
    return await this.actorManager.spawnActor(config);
  }

  /**
   * Modify properties of an existing actor
   */
  async modifyActorProperties(config: ModifyActorPropertiesConfig): Promise<ModifyActorPropertiesResult> {
    return await this.actorManager.modifyActorProperties(config);
  }

  /**
   * Get component hierarchy for an actor
   */
  async getActorComponents(actorPath: string): Promise<ComponentHierarchy> {
    return await this.actorManager.getActorComponents(actorPath);
  }

  /**
   * Search for actors by class name, tag, or name pattern
   */
  async searchActors(query: string): Promise<LevelActor[]> {
    return await this.actorManager.searchActors(query);
  }

  /**
   * Get detailed information about a specific actor
   */
  async getActorDetails(actorPath: string): Promise<LevelActor | null> {
    return await this.actorManager.getActorDetails(actorPath);
  }

  // ================================
  // Actor Template Management Methods
  // ================================

  /**
   * Create a new template from an existing actor
   */
  async createTemplateFromActor(config: CreateTemplateConfig): Promise<ActorTemplate> {
    return await this.actorTemplateManager.createTemplateFromActor(config);
  }

  /**
   * Create a template manually (for testing or data-driven setup)
   */
  async createTemplateManually(template: Omit<ActorTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActorTemplate> {
    return await this.actorTemplateManager.createTemplateManually(template);
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): ActorTemplate | undefined {
    return this.actorTemplateManager.getTemplate(templateId);
  }

  /**
   * List all templates
   */
  listTemplates(filter?: { category?: string; tags?: string[] }): ActorTemplate[] {
    return this.actorTemplateManager.listTemplates(filter);
  }

  /**
   * Update an existing template
   */
  async updateTemplate(templateId: string, updates: Partial<Omit<ActorTemplate, 'id' | 'createdAt'>>): Promise<ActorTemplate> {
    return await this.actorTemplateManager.updateTemplate(templateId, updates);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    return await this.actorTemplateManager.deleteTemplate(templateId);
  }

  /**
   * Instantiate an actor from a template
   */
  async instantiateFromTemplate(config: InstantiateTemplateConfig): Promise<SpawnActorResult> {
    return await this.actorTemplateManager.instantiateFromTemplate(config);
  }

  /**
   * Get template categories
   */
  getTemplateCategories(): string[] {
    return this.actorTemplateManager.getCategories();
  }

  /**
   * Get all template tags
   */
  getTemplateTags(): string[] {
    return this.actorTemplateManager.getTags();
  }

  /**
   * Get template usage statistics
   */
  getTemplateUsageStats() {
    return this.actorTemplateManager.getUsageStats();
  }

  /**
   * Export templates to a JSON file
   */
  async exportTemplates(outputPath: string): Promise<void> {
    return await this.actorTemplateManager.exportTemplates(outputPath);
  }

  /**
   * Import templates from a JSON file
   */
  async importTemplates(inputPath: string, options?: { overwrite?: boolean }): Promise<number> {
    return await this.actorTemplateManager.importTemplates(inputPath, options);
  }
}
