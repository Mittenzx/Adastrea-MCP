/**
 * Client for communicating with Adastrea-Director
 * 
 * CURRENT STATUS: Placeholder for optional REST API integration
 * 
 * RECOMMENDED APPROACH:
 * - Use Adastrea-Director's MCP server directly (no HTTP bridge needed)
 * - Configure both MCP servers in your MCP client
 * - See INTEGRATION_NOTES.md for MCP-to-MCP setup
 * 
 * OPTIONAL FUTURE USE:
 * If Adastrea-Director adds REST API endpoints, this client can be activated
 * to provide HTTP-based communication as an alternative integration method.
 */

import {
  DirectorConfig,
  DirectorConnectionStatus,
  DirectorResponse,
  DirectorHealthStatus,
  EditorState,
  DirectorProjectInfo,
  DirectorAssetInfo,
  ConsoleCommandResult,
  PythonExecutionResult,
} from './types.js';

export class DirectorClient {
  private config: Required<DirectorConfig>;
  private status: DirectorConnectionStatus = 'disconnected';
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private lastHeartbeat?: Date;
  private isHealthCheckInProgress = false;

  constructor(config: DirectorConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 5000,
      autoReconnect: config.autoReconnect ?? true,
      healthCheckInterval: config.healthCheckInterval ?? 30000,
      reconnectDelay: config.reconnectDelay ?? 5000,
    };
  }

  /**
   * Initialize connection to Director
   */
  async connect(): Promise<boolean> {
    try {
      this.status = 'connecting';
      
      const health = await this.checkHealth();
      
      if (health.status === 'connected') {
        this.status = 'connected';
        this.lastHeartbeat = new Date();
        
        // Start periodic health checks
        if (this.config.autoReconnect && this.config.healthCheckInterval > 0) {
          this.startHealthCheck();
        }
        
        return true;
      }
      
      this.status = 'error';
      return false;
    } catch (error) {
      this.status = 'error';
      console.error('Failed to connect to Director:', error);
      return false;
    }
  }

  /**
   * Disconnect from Director
   */
  disconnect(): void {
    this.stopHealthCheck();
    this.status = 'disconnected';
  }

  /**
   * Check if connected to Director
   */
  isConnected(): boolean {
    return this.status === 'connected';
  }

  /**
   * Get connection status
   */
  getStatus(): DirectorConnectionStatus {
    return this.status;
  }

  /**
   * Check health of Director server
   * 
   * NOTE: This currently returns 'disconnected' as a placeholder.
   * 
   * INTEGRATION OPTIONS:
   * 1. RECOMMENDED: Use Adastrea-Director's MCP server directly (no HTTP needed)
   *    - Configure both MCP servers in your MCP client
   *    - Use Director's MCP tools for runtime operations
   * 
   * 2. OPTIONAL: If Director adds REST API in the future, implement HTTP client here
   *    - Uncomment the example implementation below
   *    - Connect to Director's REST endpoints
   */
  async checkHealth(): Promise<DirectorHealthStatus> {
    try {
      // OPTIONAL: Implement HTTP health check if Director adds REST API
      // Example implementation:
      // const response = await fetch(`${this.config.baseUrl}/health`, {
      //   signal: AbortSignal.timeout(this.config.timeout),
      // });
      // const data = await response.json();
      // return {
      //   status: response.ok ? 'connected' : 'error',
      //   editorConnected: data.editorConnected,
      //   lastHeartbeat: new Date(),
      //   version: data.version,
      //   capabilities: data.capabilities,
      // };
      
      // For now, return disconnected status (use Director's MCP server instead)
      return {
        status: 'disconnected',
        editorConnected: false,
        lastHeartbeat: this.lastHeartbeat,
        version: undefined,
        capabilities: [],
      };
    } catch (error) {
      return {
        status: 'error',
        editorConnected: false,
        lastHeartbeat: this.lastHeartbeat,
      };
    }
  }

  /**
   * Get current editor state
   */
  async getEditorState(): Promise<EditorState | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      // Mock implementation - would make HTTP request to Director
      const response = await this.request<EditorState>('/api/editor/state');
      return response.data ?? null;
    } catch (error) {
      console.error('Failed to get editor state:', error);
      return null;
    }
  }

  /**
   * Get project information from Director
   */
  async getProjectInfo(): Promise<DirectorProjectInfo | null> {
    if (!this.isConnected()) {
      return null;
    }

    try {
      const response = await this.request<DirectorProjectInfo>('/api/project/info');
      return response.data ?? null;
    } catch (error) {
      console.error('Failed to get project info:', error);
      return null;
    }
  }

  /**
   * List assets from Director (live from UE Editor)
   */
  async listAssets(filter?: string): Promise<DirectorAssetInfo[]> {
    if (!this.isConnected()) {
      return [];
    }

    try {
      const response = await this.request<DirectorAssetInfo[]>('/api/assets/list', {
        method: 'POST',
        body: { filter },
      });
      return response.data ?? [];
    } catch (error) {
      console.error('Failed to list assets:', error);
      return [];
    }
  }

  /**
   * Execute a console command in UE Editor
   * 
   * ⚠️ SECURITY WARNING: This method executes arbitrary console commands in the UE Editor
   * with full editor permissions. Only use with trusted commands from trusted sources.
   * Malicious commands could compromise the editor or project.
   */
  async executeConsoleCommand(command: string): Promise<ConsoleCommandResult> {
    if (!this.isConnected()) {
      throw new Error('Not connected to Director');
    }

    try {
      const response = await this.request<ConsoleCommandResult>('/api/console/execute', {
        method: 'POST',
        body: { command },
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Unknown error');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute console command: ${error}`);
    }
  }

  /**
   * Execute Python code in UE Editor
   * 
   * ⚠️ SECURITY WARNING: This method executes arbitrary Python code in the UE Editor's
   * embedded Python interpreter with full access to the Unreal Engine API. Only execute
   * code from trusted sources. Malicious code could damage the project, access sensitive
   * data, or compromise the system.
   */
  async executePythonScript(code: string): Promise<PythonExecutionResult> {
    if (!this.isConnected()) {
      throw new Error('Not connected to Director');
    }

    try {
      const response = await this.request<PythonExecutionResult>('/api/python/execute', {
        method: 'POST',
        body: { code },
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Unknown error');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute Python script: ${error}`);
    }
  }

  /**
   * Make a request to Director server
   * 
   * NOTE: This is a placeholder for optional REST API integration.
   * 
   * RECOMMENDED APPROACH: Use Adastrea-Director's MCP server directly instead.
   * - Configure both MCP servers in your MCP client
   * - Use Director's MCP tools: unreal_execute_python, unreal_list_assets, etc.
   * - See Director's MCP_SERVER_GUIDE.md for available tools
   * 
   * OPTIONAL: If Director adds REST API endpoints in the future, implement HTTP client here.
   */
  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      body?: Record<string, unknown>;
    }
  ): Promise<DirectorResponse<T>> {
    // OPTIONAL: Implement HTTP client if Director adds REST API
    // Example implementation:
    // const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
    //   method: options?.method || 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: options?.body ? JSON.stringify(options.body) : undefined,
    //   signal: AbortSignal.timeout(this.config.timeout),
    // });
    // return await response.json();
    
    return {
      success: false,
      error: `Director HTTP integration not implemented. Use Director's MCP server for runtime operations.`,
    };
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.stopHealthCheck();
    
    this.healthCheckTimer = setInterval(async () => {
      // Prevent overlapping health checks
      if (this.isHealthCheckInProgress) {
        return;
      }
      
      this.isHealthCheckInProgress = true;
      try {
        const health = await this.checkHealth();
        
        if (health.status === 'connected') {
          this.lastHeartbeat = new Date();
          
          // Reconnect if status changed
          if (this.status !== 'connected') {
            this.status = 'connected';
            console.log('Reconnected to Director');
          }
        } else if (this.status === 'connected') {
          // Lost connection
          this.status = 'error';
          console.warn('Lost connection to Director');
          
          // Try to reconnect if auto-reconnect is enabled
          if (this.config.autoReconnect) {
            setTimeout(() => this.connect(), this.config.reconnectDelay);
          }
        }
      } finally {
        this.isHealthCheckInProgress = false;
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health checks
   */
  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }
}
