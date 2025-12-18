/**
 * Type definitions for Unreal Engine project structures
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

// Detailed Blueprint structures for inspection and modification
export interface BlueprintVariable {
  name: string;
  type: string;
  category?: string;
  defaultValue?: any;
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
  defaultValue?: any;
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
  defaultValue?: any;
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
  engineVersion: string; // Engine version / association, mirroring Unreal's "EngineAssociation" (e.g., "5.3", "5.2", a GUID like "{00000000-0000-0000-0000-000000000000}", or a custom name)
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
