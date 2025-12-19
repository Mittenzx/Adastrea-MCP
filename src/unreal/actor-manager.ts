/**
 * Actor Manager - Manages actors and components in Unreal Engine levels
 * 
 * This module provides functionality to:
 * - List actors in the current level
 * - Spawn new actors
 * - Modify actor properties
 * - Inspect component hierarchies
 */

import {
  LevelActor,
  ActorComponent,
  SpawnActorConfig,
  SpawnActorResult,
  ModifyActorPropertiesConfig,
  ModifyActorPropertiesResult,
  ComponentHierarchy,
  ListActorsResponse,
} from './types.js';

export class ActorManager {
  private projectPath: string;
  private directorBridge?: any; // Reference to Adastrea-Director bridge

  constructor(projectPath: string, directorBridge?: any) {
    this.projectPath = projectPath;
    this.directorBridge = directorBridge;
  }

  /**
   * Set the Director bridge for live actor operations
   */
  setDirectorBridge(bridge: any): void {
    this.directorBridge = bridge;
  }

  /**
   * Get all actors in the currently loaded level
   * This is a placeholder that returns static data when Director is not available.
   * In a real implementation, this would query the UE Editor via Director.
   */
  async getActorsInLevel(): Promise<ListActorsResponse> {
    // This is a placeholder implementation
    // Real implementation would use Adastrea-Director to get live actor data
    // via Python: unreal.EditorLevelLibrary.get_all_level_actors()
    
    return {
      levelName: 'Unknown',
      levelPath: '',
      actors: [],
      totalCount: 0,
      source: 'local',
    };
  }

  /**
   * Spawn a new actor in the level
   * Requires Adastrea-Director integration for live spawning.
   */
  async spawnActor(config: SpawnActorConfig): Promise<SpawnActorResult> {
    // Validate configuration
    if (!config.className) {
      return {
        success: false,
        message: 'className is required',
        error: 'Missing className in spawn configuration',
      };
    }

    // This is a placeholder implementation
    // Real implementation would use Adastrea-Director to spawn actors via Python:
    // actor = unreal.EditorLevelLibrary.spawn_actor_from_class(actor_class, location, rotation)
    
    return {
      success: false,
      message: 'Actor spawning requires Adastrea-Director to be running and connected to UE Editor',
      error: 'Director integration required',
    };
  }

  /**
   * Modify properties of an existing actor
   * Requires Adastrea-Director integration for live modification.
   */
  async modifyActorProperties(
    config: ModifyActorPropertiesConfig
  ): Promise<ModifyActorPropertiesResult> {
    // Validate configuration
    if (!config.actorPath) {
      return {
        success: false,
        message: 'actorPath is required',
        error: 'Missing actorPath in configuration',
      };
    }

    if (!config.properties && !config.transform && !config.tags) {
      return {
        success: false,
        message: 'At least one of properties, transform, or tags must be provided',
        error: 'No modifications specified',
      };
    }

    // This is a placeholder implementation
    // Real implementation would use Adastrea-Director to modify actors via Python:
    // actor = unreal.EditorLevelLibrary.get_actor_reference(actor_path)
    // actor.set_editor_property(property_name, value)
    // actor.set_actor_location(location)
    // etc.
    
    return {
      success: false,
      message: 'Actor property modification requires Adastrea-Director to be running and connected to UE Editor',
      error: 'Director integration required',
    };
  }

  /**
   * Get component hierarchy for an actor
   * This provides a structured view of all components and their relationships.
   */
  async getActorComponents(actorPath: string): Promise<ComponentHierarchy> {
    // This is a placeholder implementation
    // Real implementation would use Adastrea-Director to query components via Python:
    // actor = unreal.EditorLevelLibrary.get_actor_reference(actor_path)
    // components = actor.get_components_by_class(unreal.ActorComponent)
    // root = actor.get_root_component()
    
    return {
      rootComponent: undefined,
      components: [],
      hierarchy: [],
    };
  }

  /**
   * Search for actors by class name, tag, or name pattern
   */
  async searchActors(query: string): Promise<LevelActor[]> {
    // This is a placeholder implementation
    // Real implementation would filter actors from getActorsInLevel()
    // or use Director to query with filters
    
    return [];
  }

  /**
   * Get detailed information about a specific actor
   */
  async getActorDetails(actorPath: string): Promise<LevelActor | null> {
    // This is a placeholder implementation
    // Real implementation would use Director to get detailed actor info
    
    return null;
  }

  // ========================================
  // Private helper methods (reserved for future Director integration)
  // ========================================

  /**
   * Build component hierarchy tree from flat component list
   * Reserved for future use when Director integration is complete.
   */
  private buildComponentHierarchy(
    components: ActorComponent[],
    parentName?: string
  ): ComponentHierarchy['hierarchy'] {
    const children = components.filter(
      (c) => c.attachedTo === parentName || (!parentName && c.isRootComponent)
    );

    return children.map((component) => ({
      component,
      children: this.buildComponentHierarchy(components, component.name),
    }));
  }

  /**
   * Validate actor class name format
   * Reserved for future use when Director integration is complete.
   */
  private validateClassName(className: string): boolean {
    // Check if it's a C++ class (starts with A, U, F, etc.)
    // or a Blueprint class (ends with _C or contains /Game/)
    const cppClassPattern = /^[AUFS][A-Z][a-zA-Z0-9_]*$/;
    const blueprintPattern = /^\/Game\/.*\.[^.]+_C$|^BP_[A-Z][a-zA-Z0-9_]*_C$/;
    
    return cppClassPattern.test(className) || blueprintPattern.test(className);
  }

  /**
   * Format actor path for Unreal Engine
   * Reserved for future use when Director integration is complete.
   */
  private formatActorPath(levelPath: string, actorName: string): string {
    // Format: /Game/Maps/Level.Level:PersistentLevel.ActorName
    // Note: This method uses string operations instead of path.basename/extname
    // to avoid importing 'path' module for a simple string operation
    const lastSlash = levelPath.lastIndexOf('/');
    const levelNameWithExt = lastSlash >= 0 ? levelPath.substring(lastSlash + 1) : levelPath;
    const lastDot = levelNameWithExt.lastIndexOf('.');
    const levelName = lastDot >= 0 ? levelNameWithExt.substring(0, lastDot) : levelNameWithExt;
    return `${levelPath}.${levelName}:PersistentLevel.${actorName}`;
  }
}
