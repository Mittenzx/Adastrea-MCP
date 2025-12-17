/**
 * Client for communicating with Adastrea-Director MCP server
 * 
 * This client manages the connection to the Adastrea-Director plugin's
 * MCP server, which provides real-time Unreal Engine Editor integration.
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

  constructor(config: DirectorConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 5000,
      autoReconnect: config.autoReconnect ?? true,
      healthCheckInterval: config.healthCheckInterval ?? 30000,
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
   */
  async checkHealth(): Promise<DirectorHealthStatus> {
    try {
      // In a real implementation, this would make an HTTP request to Director's health endpoint
      // For now, we return a mock status indicating disconnected (Director not running)
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
   */
  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      body?: any;
    }
  ): Promise<DirectorResponse<T>> {
    // Mock implementation - in production this would use fetch/axios
    // For now, return a disconnected response
    return {
      success: false,
      error: 'Director not connected - this is a placeholder implementation',
    };
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.stopHealthCheck();
    
    this.healthCheckTimer = setInterval(async () => {
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
          setTimeout(() => this.connect(), 5000);
        }
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
