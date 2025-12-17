/**
 * Editor Bridge - Coordinates between Adastrea-MCP and Adastrea-Director
 * 
 * This bridge manages:
 * - Tool delegation (local static analysis vs remote live execution)
 * - State synchronization between MCP server and UE Editor
 * - Graceful degradation when Director is unavailable
 * - Resource routing
 */

import { DirectorClient } from './client.js';
import { DirectorConfig, EditorState } from './types.js';
import { UnrealProjectManager } from '../unreal/index.js';

/**
 * Configuration for the Editor Bridge
 */
export interface BridgeConfig {
  /** Configuration for Director connection */
  directorConfig?: DirectorConfig;
  
  /** Whether to enable Director integration */
  enableDirector?: boolean;
  
  /** Whether to fall back to local analysis when Director unavailable */
  fallbackToLocal?: boolean;
}

/**
 * Bridge between Adastrea-MCP and Adastrea-Director
 */
export class EditorBridge {
  private directorClient?: DirectorClient;
  private unrealManager?: UnrealProjectManager;
  private config: BridgeConfig & { enableDirector: boolean; fallbackToLocal: boolean };
  private editorState?: EditorState;

  constructor(config: BridgeConfig = {}) {
    this.config = {
      directorConfig: config.directorConfig,
      enableDirector: config.enableDirector ?? true,
      fallbackToLocal: config.fallbackToLocal ?? true,
    };

    // Initialize Director client if enabled
    if (this.config.enableDirector && this.config.directorConfig) {
      this.directorClient = new DirectorClient(this.config.directorConfig);
    }
  }

  /**
   * Initialize the bridge
   */
  async initialize(): Promise<void> {
    // Attempt to connect to Director
    if (this.directorClient) {
      const connected = await this.directorClient.connect();
      if (connected) {
        console.log('Successfully connected to Adastrea-Director');
        await this.syncEditorState();
      } else {
        console.log('Director not available, using local analysis only');
      }
    }
  }

  /**
   * Set the Unreal project manager for local analysis
   */
  setUnrealManager(manager: UnrealProjectManager): void {
    this.unrealManager = manager;
  }

  /**
   * Check if Director is available
   */
  isDirectorAvailable(): boolean {
    return this.directorClient?.isConnected() ?? false;
  }

  /**
   * Check if local analysis is available
   */
  isLocalAnalysisAvailable(): boolean {
    return this.unrealManager !== undefined;
  }

  /**
   * Get current editor state
   */
  async getEditorState(): Promise<EditorState | null> {
    if (!this.directorClient?.isConnected()) {
      return null;
    }

    try {
      this.editorState = (await this.directorClient.getEditorState()) || undefined;
      return this.editorState || null;
    } catch (error) {
      console.error('Failed to get editor state:', error);
      return null;
    }
  }

  /**
   * Get project info - prefers Director (live) over local (cached)
   * 
   * Returns a structured object with the project info and metadata about the source
   * so callers can distinguish between Director results, local results, and errors.
   */
  async getProjectInfo(): Promise<{
    projectInfo: any;
    source: 'director' | 'local' | 'none';
    directorAvailable: boolean;
    localAnalysisAvailable: boolean;
    error?: Error;
  }> {
    const directorAvailable = !!this.directorClient?.isConnected();
    const localAnalysisAvailable = !!(this.unrealManager && this.config.fallbackToLocal);

    // Try Director first for live data
    if (directorAvailable) {
      try {
        const directorInfo = await this.directorClient!.getProjectInfo();
        if (directorInfo) {
          return {
            projectInfo: directorInfo,
            source: 'director',
            directorAvailable,
            localAnalysisAvailable,
          };
        }
      } catch (error) {
        console.warn('Failed to get project info from Director:', error);

        // If Director fails but local analysis is available, fall back to local
        if (localAnalysisAvailable) {
          const localInfo = this.unrealManager!.getProjectConfig();
          return {
            projectInfo: localInfo,
            source: 'local',
            directorAvailable,
            localAnalysisAvailable,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }

        // Director failed and no local analysis available
        return {
          projectInfo: null,
          source: 'none',
          directorAvailable,
          localAnalysisAvailable,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    }

    // Fall back to local analysis if enabled and available
    if (localAnalysisAvailable) {
      const localInfo = this.unrealManager!.getProjectConfig();
      return {
        projectInfo: localInfo,
        source: 'local',
        directorAvailable,
        localAnalysisAvailable,
      };
    }

    // Neither Director nor local analysis can provide project info
    return {
      projectInfo: null,
      source: 'none',
      directorAvailable,
      localAnalysisAvailable,
      error: new Error('Project info unavailable: Director not connected and local analysis disabled or unavailable'),
    };
  }

  /**
   * List assets - prefers Director (live) over local (cached)
   */
  async listAssets(filter?: string): Promise<any[]> {
    // Try Director first for live asset list
    if (this.directorClient?.isConnected()) {
      try {
        const assets = await this.directorClient.listAssets(filter);
        // Director is the authoritative source when available, even if it returns an empty list
        return assets;
      } catch (error) {
        console.warn('Failed to list assets from Director:', error);
      }
    }

    // Fall back to local analysis
    if (this.unrealManager && this.config.fallbackToLocal) {
      const localAssets = this.unrealManager.getAssets();
      
      // Apply filter if provided
      if (filter) {
        const filterLower = filter.toLowerCase();
        return localAssets.filter(
          (asset) =>
            asset.name.toLowerCase().includes(filterLower) ||
            asset.path.toLowerCase().includes(filterLower) ||
            asset.type.toLowerCase().includes(filterLower)
        );
      }
      
      return localAssets;
    }

    return [];
  }

  /**
   * Execute console command - requires Director
   */
  async executeConsoleCommand(command: string): Promise<any> {
    if (!this.directorClient?.isConnected()) {
      throw new Error('Console commands require Adastrea-Director to be running and connected');
    }

    return await this.directorClient.executeConsoleCommand(command);
  }

  /**
   * Execute Python script - requires Director
   */
  async executePythonScript(code: string): Promise<any> {
    if (!this.directorClient?.isConnected()) {
      throw new Error('Python execution requires Adastrea-Director to be running and connected');
    }

    return await this.directorClient.executePythonScript(code);
  }

  /**
   * Sync editor state from Director
   */
  private async syncEditorState(): Promise<void> {
    try {
      const state = await this.directorClient?.getEditorState();
      this.editorState = state || undefined;
    } catch (error) {
      console.error('Failed to sync editor state:', error);
    }
  }

  /**
   * Get capabilities based on what's available
   */
  getCapabilities(): {
    hasDirector: boolean;
    hasLocalAnalysis: boolean;
    canExecuteCommands: boolean;
    canExecutePython: boolean;
    canGetLiveAssets: boolean;
  } {
    return {
      hasDirector: this.isDirectorAvailable(),
      hasLocalAnalysis: this.isLocalAnalysisAvailable(),
      canExecuteCommands: this.isDirectorAvailable(),
      canExecutePython: this.isDirectorAvailable(),
      canGetLiveAssets: this.isDirectorAvailable(),
    };
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.directorClient) {
      this.directorClient.disconnect();
    }
  }
}
