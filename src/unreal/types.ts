/**
 * Type definitions for Unreal Engine 5.6 project structures
 * 
 * These types represent the structures used in Unreal Engine 5.6,
 * including .uproject files, Blueprints, assets, and actor systems.
 * 
 * UE5.6 introduces enhanced Blueprint tooling, improved asset management,
 * and new actor component system features that are reflected in these types.
 */

/**
 * UE5.6 .uproject file structure
 * 
 * Represents the structure of an Unreal Engine 5.6 project file (.uproject).
 * This is the primary configuration file that defines engine association,
 * modules, plugins, and project metadata.
 */
export interface UProjectFile {
  FileVersion: number;
  EngineAssociation: string;
  Category?: string;
  Description?: string;
  Modules: UProjectModule[];
  Plugins?: UProjectPlugin[];
  TargetPlatforms?: string[];
  EpicSampleNameHash?: string;
  AdditionalPluginDirectories?: string[];
  AdditionalRootDirectories?: string[];
}

export interface UProjectModule {
  Name: string;
  Type: string;
  LoadingPhase: string;
  AdditionalDependencies?: string[];
}

export interface UProjectPlugin {
  Name: string;
  Enabled: boolean;
  MarketplaceURL?: string;
  SupportedTargetPlatforms?: string[];
  TargetAllowList?: string[];
  Optional?: boolean;
}

export interface UnrealClass {
  name: string;
  type: 'UCLASS' | 'USTRUCT' | 'UENUM' | 'UINTERFACE';
  module?: string;
  parentClass?: string;
  specifiers?: string[];
  blueprintType?: boolean;
  blueprintable?: boolean;
  file?: string;
  lineNumber?: number;
}

export interface UnrealFunction {
  name: string;
  className: string;
  returnType: string;
  parameters: Array<{
    name: string;
    type: string;
  }>;
  specifiers?: string[];
  blueprintCallable?: boolean;
  file?: string;
  lineNumber?: number;
}

export interface BlueprintAsset {
  name: string;
  path: string;
  type: string;
  parentClass?: string;
  interfaces?: string[];
  variables?: Array<{
    name: string;
    type: string;
  }>;
  functions?: string[];
}

/**
 * Blueprint variable definition for UE5.6
 * 
 * UE5.6 supports enhanced variable properties including improved
 * replication options and editor visibility controls.
 */
export interface BlueprintVariable {
  name: string;
  type: string;
  category?: string;
  defaultValue?: unknown;
  isExposed?: boolean; // Exposed to cinematics/blueprints
  isEditable?: boolean; // Editable on instance
  tooltip?: string;
  replication?: 'None' | 'Replicated' | 'ReplicatedUsing';
  replicationCondition?: string;
}

export interface BlueprintFunctionParameter {
  name: string;
  type: string;
  isReference?: boolean;
  isConst?: boolean;
  defaultValue?: unknown;
}

export interface BlueprintFunction {
  name: string;
  category?: string;
  returnType?: string;
  parameters: BlueprintFunctionParameter[];
  isEvent?: boolean;
  isPure?: boolean;
  isConst?: boolean;
  accessSpecifier?: 'Public' | 'Protected' | 'Private';
  keywords?: string[]; // BlueprintCallable, BlueprintPure, etc.
  tooltip?: string;
  nodes?: BlueprintNode[];
}

export interface BlueprintNode {
  id: string;
  type: string; // Node type (FunctionCall, VariableGet, Branch, etc.)
  className?: string; // For function calls
  functionName?: string; // For function calls
  variableName?: string; // For variable access
  position?: { x: number; y: number };
  pins?: BlueprintPin[];
}

export interface BlueprintPin {
  id: string;
  name: string;
  type: string;
  direction: 'Input' | 'Output';
  isExecution?: boolean; // Execution pin vs data pin
  defaultValue?: unknown;
  connections?: string[]; // IDs of connected pins
}

export interface BlueprintGraph {
  name: string;
  type: 'EventGraph' | 'Function' | 'Macro' | 'ConstructionScript';
  nodes: BlueprintNode[];
}

export interface DetailedBlueprintInfo {
  name: string;
  path: string;
  parentClass?: string;
  interfaces?: string[];
  variables: BlueprintVariable[];
  functions: BlueprintFunction[];
  graphs: BlueprintGraph[];
  components?: Array<{
    name: string;
    type: string;
    attachedTo?: string;
  }>;
  metadata?: {
    category?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface AssetInfo {
  name: string;
  path: string;
  type: string;
  size?: number;
  dependencies?: string[];
  referencedBy?: string[];
}

export interface ModuleInfo {
  name: string;
  type: string;
  loadingPhase: string;
  dependencies: string[];
  classes: string[];
  path?: string;
}

export interface PluginInfo {
  name: string;
  enabled: boolean;
  version?: string;
  versionName?: string;
  friendlyName?: string;
  description?: string;
  category?: string;
  createdBy?: string;
  marketplaceURL?: string;
  supportURL?: string;
  engineVersion?: string;
  canContainContent?: boolean;
  isBetaVersion?: boolean;
  isExperimentalVersion?: boolean;
  installed?: boolean;
  modules?: UProjectModule[];
  path?: string;
}

export interface BuildConfiguration {
  name: string;
  platform: string;
  configuration: 'Debug' | 'DebugGame' | 'Development' | 'Shipping' | 'Test';
  target?: string;
}

export interface UnrealProjectConfig {
  projectPath: string;
  projectName: string;
  engineVersion: string; // Engine version or association from .uproject file
                         // For UE5.6: typically "5.6" or a GUID like "{00000000-0000-0000-0000-000000000000}"
                         // Can also be a custom engine name for source builds
  modules: ModuleInfo[];
  plugins: PluginInfo[];
  targetPlatforms: string[];
  buildConfigurations: BuildConfiguration[];
}

export interface ProjectSummary {
  projectName?: string;
  engineVersion?: string;
  modules: {
    total: number;
    list: string[];
  };
  classes: {
    total: number;
    byType: {
      UCLASS: number;
      USTRUCT: number;
      UENUM: number;
      UINTERFACE: number;
    };
  };
  functions: {
    total: number;
    blueprintCallable: number;
  };
  assets: {
    total: number;
    byType: Record<string, number>;
    totalSize: number;
  };
  blueprints: {
    total: number;
  };
  plugins: {
    total: number;
    enabled: number;
    categories: Record<string, number>;
  };
  platforms: string[];
}

/**
 * Actor & Component System Types (Phase 2.3)
 */

/** Represents a component attached to an actor */
export interface ActorComponent {
  name: string;
  type: string; // Component class name (e.g., 'UStaticMeshComponent', 'UBoxComponent')
  displayName?: string;
  attachedTo?: string; // Parent component name
  isRootComponent?: boolean;
  properties?: Record<string, any>; // Component property values
  tags?: string[];
  metadata?: {
    relativeLocation?: { x: number; y: number; z: number };
    relativeRotation?: { pitch: number; yaw: number; roll: number };
    relativeScale3D?: { x: number; y: number; z: number };
  };
}

/** Represents an actor in a level */
export interface LevelActor {
  name: string; // Actor instance name in the level
  path: string; // Full path to the actor (e.g., '/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0')
  className: string; // Actor class (e.g., 'AStaticMeshActor', 'ABP_Character_C')
  location?: { x: number; y: number; z: number };
  rotation?: { pitch: number; yaw: number; roll: number };
  scale?: { x: number; y: number; z: number };
  components?: ActorComponent[];
  properties?: Record<string, any>; // Actor property values
  tags?: string[];
  folder?: string; // Level folder path
  layer?: string; // Level layer
  isHidden?: boolean;
  isLocked?: boolean;
}

/** Configuration for spawning a new actor */
export interface SpawnActorConfig {
  className: string; // Class to spawn (e.g., 'AStaticMeshActor', '/Game/Blueprints/BP_Character.BP_Character_C')
  location?: { x: number; y: number; z: number };
  rotation?: { pitch: number; yaw: number; roll: number };
  scale?: { x: number; y: number; z: number };
  name?: string; // Optional custom name for the actor
  properties?: Record<string, any>; // Initial property values
  tags?: string[];
  folder?: string; // Level folder to place actor in
  spawnMethod?: 'Deferred' | 'Always'; // Spawn method
}

/** Result of spawning an actor */
export interface SpawnActorResult {
  success: boolean;
  message: string;
  actor?: LevelActor;
  error?: string;
}

/** Configuration for modifying actor properties */
export interface ModifyActorPropertiesConfig {
  actorPath: string; // Full path to the actor
  properties: Record<string, any>; // Properties to modify
  transform?: {
    location?: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number; roll: number };
    scale?: { x: number; y: number; z: number };
  };
  tags?: string[];
}

/** Result of modifying actor properties */
export interface ModifyActorPropertiesResult {
  success: boolean;
  message: string;
  modifiedProperties?: string[];
  error?: string;
}

/** Component hierarchy for an actor */
export interface ComponentHierarchy {
  rootComponent?: ActorComponent;
  components: ActorComponent[];
  hierarchy: Array<{
    component: ActorComponent;
    children: ComponentHierarchy['hierarchy'];
  }>;
}

/**
 * Actor Template System Types
 */

/** Represents a saved actor template/prefab */
export interface ActorTemplate {
  id: string; // Unique template ID
  name: string; // Template name
  description?: string;
  className: string; // Base actor class
  category?: string; // Organization category
  tags?: string[];
  // Template data
  components: ActorComponent[];
  properties: Record<string, any>;
  defaultTransform?: {
    location?: { x: number; y: number; z: number };
    rotation?: { pitch: number; yaw: number; roll: number };
    scale?: { x: number; y: number; z: number };
  };
  // Metadata
  createdAt: string;
  updatedAt: string;
  usageCount?: number; // Track how often this template is used
  author?: string;
}

/** Configuration for creating a template from an actor */
export interface CreateTemplateConfig {
  actorPath: string; // Path to the actor to save as template
  templateName: string;
  description?: string;
  category?: string;
  tags?: string[];
}

/** Configuration for instantiating an actor from a template */
export interface InstantiateTemplateConfig {
  templateId: string;
  location?: { x: number; y: number; z: number };
  rotation?: { pitch: number; yaw: number; roll: number };
  scale?: { x: number; y: number; z: number };
  name?: string; // Optional custom name for the spawned actor
  folder?: string; // Level folder to place actor in
}

/** Level/Scene information */
export interface LevelInfo {
  name: string;
  path: string;
  isPersistent?: boolean;
  actors: LevelActor[];
  subLevels?: string[];
}

/** Response for listing actors in level */
export interface ListActorsResponse {
  levelName: string;
  levelPath: string;
  actors: LevelActor[];
  totalCount: number;
  source: 'director' | 'local'; // Where the data came from
}
