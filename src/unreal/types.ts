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
