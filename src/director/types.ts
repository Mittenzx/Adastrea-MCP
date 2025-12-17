/**
 * Type definitions for Adastrea-Director integration
 * 
 * Adastrea-Director is a comprehensive UE plugin that provides:
 * - C++ UE Editor Plugin for live engine integration
 * - Python Backend with IPC communication
 * - MCP Server for remote execution and asset management
 * - RAG System for intelligent document understanding
 * - Planning Agents for autonomous task decomposition
 */

/**
 * Configuration for connecting to Adastrea-Director
 */
export interface DirectorConfig {
  /** Base URL for the Director MCP server (e.g., "http://localhost:3001") */
  baseUrl: string;
  
  /** Timeout for requests in milliseconds */
  timeout?: number;
  
  /** Whether to automatically reconnect on connection loss */
  autoReconnect?: boolean;
  
  /** Interval for health checks in milliseconds */
  healthCheckInterval?: number;
  
  /** Delay before attempting reconnection in milliseconds (default: 5000) */
  reconnectDelay?: number;
}

/**
 * Connection status for Director
 */
export type DirectorConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

/**
 * Current state of the Unreal Editor from Director
 */
export interface EditorState {
  /** Whether the editor is currently running */
  isRunning: boolean;
  
  /** Current level/map loaded in the editor */
  currentLevel?: string;
  
  /** Selected actors in the editor */
  selectedActors?: string[];
  
  /** Current editing context */
  editingContext?: {
    mode: string;
    /** 
     * Additional context-specific details. May include properties like:
     * - selectedTool: string (e.g., "Select", "Translate", "Rotate")
     * - editingMode: string (e.g., "Landscape", "Foliage", "Modeling")
     * - viewportName: string (e.g., "Top", "Front", "Perspective")
     */
    details?: Record<string, any>;
  };
  
  /** Editor viewport state */
  viewport?: {
    cameraLocation?: [number, number, number];
    cameraRotation?: [number, number, number];
    viewMode?: string;
  };
}

/**
 * MCP Tool definition from Director
 */
export interface DirectorTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

/**
 * MCP Resource definition from Director
 */
export interface DirectorResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Response from Director MCP server
 */
export interface DirectorResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * Project information from Director
 */
export interface DirectorProjectInfo {
  projectName: string;
  projectPath: string;
  engineVersion: string;
  isLoaded: boolean;
}

/**
 * Asset information from Director (live)
 */
export interface DirectorAssetInfo {
  assetName: string;
  assetPath: string;
  assetClass: string;
  assetType: string;
  packageName: string;
}

/**
 * Result of executing a console command
 */
export interface ConsoleCommandResult {
  command: string;
  output: string;
  success: boolean;
  executionTime?: number;
}

/**
 * Result of executing Python code
 */
export interface PythonExecutionResult {
  code: string;
  output: string;
  error?: string;
  success: boolean;
  executionTime?: number;
}

/**
 * Director health status
 */
export interface DirectorHealthStatus {
  status: DirectorConnectionStatus;
  editorConnected: boolean;
  lastHeartbeat?: Date;
  version?: string;
  capabilities?: string[];
}
