#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GameProjectStorage, GameProject } from "./storage.js";
import { UnrealProjectManager } from "./unreal/index.js";
import { EditorBridge } from "./director/index.js";

// Initialize storage
const storage = new GameProjectStorage();

// Initialize Unreal project manager (will be set if project path is provided)
let unrealManager: UnrealProjectManager | null = null;

// Initialize Editor Bridge for Adastrea-Director integration
const editorBridge = new EditorBridge({
  enableDirector: true,
  fallbackToLocal: true,
  directorConfig: {
    baseUrl: process.env.DIRECTOR_URL || 'http://localhost:3001',
    timeout: 10000,
    autoReconnect: true,
    healthCheckInterval: 30000,
  },
});

// Initialize bridge on startup
editorBridge.initialize().catch((err: unknown) => {
  let errorType = 'Unknown error';
  let errorCode: string | number | undefined;

  if (err && typeof err === 'object') {
    const anyErr = err as { name?: string; code?: string | number };
    if (anyErr.name) {
      errorType = anyErr.name;
    } else if ((anyErr as any).constructor && (anyErr as any).constructor.name) {
      errorType = (anyErr as any).constructor.name;
    }
    errorCode = anyErr.code;
  }

  const details =
    errorCode !== undefined
      ? ` [type=${errorType}, code=${errorCode}]`
      : ` [type=${errorType}]`;

  console.warn(
    'Failed to initialize Director bridge (this is expected if Adastrea-Director is not running)' +
      details +
      ':',
    err,
  );
  console.warn('The MCP server will continue to operate using local analysis only.');
});

// Helper function for deep merging objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      if (Array.isArray(source[key])) {
        // For arrays, replace entirely
        output[key] = source[key];
      } else {
        // For objects, recursively merge
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

// Validation function for GameProject fields
function validateGameProject(data: any): void {
  if (data.platform !== undefined && !Array.isArray(data.platform)) {
    throw new Error("Field 'platform' must be an array");
  }
  
  if (data.team !== undefined) {
    if (!Array.isArray(data.team)) {
      throw new Error("Field 'team' must be an array");
    }
    data.team.forEach((member: any, index: number) => {
      if (!member.name || !member.role) {
        throw new Error(`Team member at index ${index} must have 'name' and 'role' properties`);
      }
    });
  }
  
  if (data.features !== undefined && !Array.isArray(data.features)) {
    throw new Error("Field 'features' must be an array");
  }
  
  if (data.timeline !== undefined) {
    if (typeof data.timeline !== 'object' || Array.isArray(data.timeline)) {
      throw new Error("Field 'timeline' must be an object");
    }
    if (data.timeline.milestones !== undefined && !Array.isArray(data.timeline.milestones)) {
      throw new Error("Field 'timeline.milestones' must be an array");
    }
  }
}

// Create server instance
const server = new Server(
  {
    name: "adastrea-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = [
    {
      uri: "game://project/info",
      name: "Game Project Information",
      description: "Complete information about the current game project",
      mimeType: "application/json",
    },
    {
      uri: "game://project/summary",
      name: "Game Project Summary",
      description: "A human-readable summary of the game project",
      mimeType: "text/plain",
    },
  ];

  // Add Unreal-specific resources if a project is loaded
  if (unrealManager) {
    resources.push(
      {
        uri: "unreal://project/config",
        name: "Unreal Project Configuration",
        description: "Complete Unreal Engine project configuration from .uproject file",
        mimeType: "application/json",
      },
      {
        uri: "unreal://project/modules",
        name: "Unreal Project Modules",
        description: "List of all modules and their dependencies",
        mimeType: "application/json",
      },
      {
        uri: "unreal://project/plugins",
        name: "Unreal Project Plugins",
        description: "Inventory of installed plugins",
        mimeType: "application/json",
      },
      {
        uri: "unreal://project/classes",
        name: "C++ Class Registry",
        description: "All UCLASS, USTRUCT, UENUM, and UINTERFACE definitions",
        mimeType: "application/json",
      },
      {
        uri: "unreal://project/blueprints",
        name: "Blueprint Assets",
        description: "List of all Blueprint assets in the project",
        mimeType: "application/json",
      },
      {
        uri: "unreal://project/assets",
        name: "Asset Registry",
        description: "Complete asset catalog with types and paths",
        mimeType: "application/json",
      },
      {
        uri: "unreal://build/config",
        name: "Build Configurations",
        description: "Available build configurations and target platforms",
        mimeType: "application/json",
      }
    );
  }

  // Add Director-specific resources when Director is actively connected
  if (editorBridge.isDirectorAvailable()) {
    resources.push(
      {
        uri: "unreal://editor/state",
        name: "Editor State",
        description: "Current state of the Unreal Engine Editor (requires Adastrea-Director)",
        mimeType: "application/json",
      },
      {
        uri: "unreal://editor/capabilities",
        name: "Editor Capabilities",
        description: "Available capabilities based on Director connection status",
        mimeType: "application/json",
      }
    );
  }

  return { resources };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "game://project/info") {
    const project = await storage.getProject();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(project, null, 2),
        },
      ],
    };
  }

  if (uri === "game://project/summary") {
    const project = await storage.getProject();
    const summary = formatProjectSummary(project);
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: summary,
        },
      ],
    };
  }

  // Unreal Engine resources
  if (unrealManager) {
    if (uri === "unreal://project/config") {
      const config = unrealManager.getProjectConfig();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(config, null, 2),
          },
        ],
      };
    }

    if (uri === "unreal://project/modules") {
      const modules = unrealManager.getModules();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(modules, null, 2),
          },
        ],
      };
    }

    if (uri === "unreal://project/plugins") {
      const plugins = unrealManager.getPlugins();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(plugins, null, 2),
          },
        ],
      };
    }

    if (uri === "unreal://project/classes") {
      const classes = unrealManager.getClasses();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(classes, null, 2),
          },
        ],
      };
    }

    if (uri === "unreal://project/blueprints") {
      const blueprints = unrealManager.getBlueprints();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(blueprints, null, 2),
          },
        ],
      };
    }

    if (uri === "unreal://project/assets") {
      const assets = unrealManager.getAssets();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(assets, null, 2),
          },
        ],
      };
    }

    if (uri === "unreal://build/config") {
      const config = unrealManager.getProjectConfig();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(config?.buildConfigurations || [], null, 2),
          },
        ],
      };
    }
  }

  // Director-specific resources
  if (uri === "unreal://editor/state") {
    const state = await editorBridge.getEditorState();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(state || { isRunning: false }, null, 2),
        },
      ],
    };
  }

  if (uri === "unreal://editor/capabilities") {
    const capabilities = editorBridge.getCapabilities();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(capabilities, null, 2),
        },
      ],
    };
  }

  throw new McpError(
    ErrorCode.InvalidRequest,
    `Unknown resource: ${uri}`
  );
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "update_game_info",
        description: "Update or add game project information. Can update individual fields or multiple fields at once.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the game",
            },
            description: {
              type: "string",
              description: "A detailed description of the game",
            },
            genre: {
              type: "string",
              description: "The game's genre (e.g., RPG, FPS, Strategy)",
            },
            platform: {
              type: "array",
              items: { type: "string" },
              description: "Target platforms (e.g., PC, Console, Mobile)",
            },
            engine: {
              type: "string",
              description: "Game engine being used (e.g., Unity, Unreal, Godot)",
            },
            status: {
              type: "string",
              description: "Current development status (e.g., Planning, In Development, Testing, Released)",
            },
            repository_url: {
              type: "string",
              description: "URL to the game's source code repository (e.g., GitHub URL)",
            },
            team: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string" },
                },
              },
              description: "Team members and their roles",
            },
            features: {
              type: "array",
              items: { type: "string" },
              description: "Key features of the game",
            },
            technical_details: {
              type: "object",
              description: "Technical specifications and architecture details",
            },
            timeline: {
              type: "object",
              properties: {
                started: { type: "string" },
                estimated_completion: { type: "string" },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      date: { type: "string" },
                      status: { type: "string" },
                    },
                  },
                },
              },
              description: "Project timeline information",
            },
            custom_fields: {
              type: "object",
              description: "Any additional custom fields for project-specific information",
            },
          },
        },
      },
      {
        name: "get_game_info",
        description: "Retrieve the current game project information",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "clear_game_info",
        description: "Clear all game project information and start fresh",
        inputSchema: {
          type: "object",
          properties: {
            confirm: {
              type: "boolean",
              description: "Must be set to true to confirm deletion",
            },
          },
          required: ["confirm"],
        },
      },
      {
        name: "scan_unreal_project",
        description: "Perform a deep scan of an Unreal Engine project structure, analyzing .uproject files, modules, plugins, C++ classes, and assets",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Absolute path to the Unreal Engine project directory (containing the .uproject file)",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "validate_project_structure",
        description: "Validate an Unreal Engine project structure and check for common issues",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Absolute path to the Unreal Engine project directory",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "search_code",
        description: "Search for C++ classes, structs, enums, or interfaces in the scanned Unreal project",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (class name, type, etc.)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "find_class_usage",
        description: "Find all usages of a specific C++ class in the project",
        inputSchema: {
          type: "object",
          properties: {
            class_name: {
              type: "string",
              description: "Name of the class to find usages for",
            },
          },
          required: ["class_name"],
        },
      },
      {
        name: "get_class_hierarchy",
        description: "Get the inheritance hierarchy for a specific C++ class",
        inputSchema: {
          type: "object",
          properties: {
            class_name: {
              type: "string",
              description: "Name of the class",
            },
          },
          required: ["class_name"],
        },
      },
      {
        name: "search_assets",
        description: "Search for assets in the scanned Unreal project by name, type, or path",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (asset name, type, or path)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_asset_dependencies",
        description: "Get dependencies for a specific asset (placeholder for future implementation)",
        inputSchema: {
          type: "object",
          properties: {
            asset_path: {
              type: "string",
              description: "Path to the asset",
            },
          },
          required: ["asset_path"],
        },
      },
      {
        name: "execute_console_command",
        description: "Execute a console command in the Unreal Engine Editor (requires Adastrea-Director to be running)",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "Console command to execute (e.g., 'stat fps', 'ke * list')",
            },
          },
          required: ["command"],
        },
      },
      {
        name: "run_python_script",
        description: "Execute Python code in the Unreal Engine Editor (requires Adastrea-Director to be running)",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Python code to execute in the UE Editor",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "get_live_project_info",
        description: "Get live project information from the running Unreal Engine Editor via Adastrea-Director (prefers live data over cached)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_assets_live",
        description: "List assets from the running Unreal Engine Editor in real-time via Adastrea-Director (prefers live data over cached)",
        inputSchema: {
          type: "object",
          properties: {
            filter: {
              type: "string",
              description: "Optional filter string to search for specific assets",
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "update_game_info") {
    // Validate input arguments
    try {
      validateGameProject(args || {});
    } catch (validationError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid input: ${validationError instanceof Error ? validationError.message : String(validationError)}`
      );
    }
    
    const project = await storage.getProject();
    const updatedProject = deepMerge(project, args || {});
    await storage.saveProject(updatedProject);
    
    return {
      content: [
        {
          type: "text",
          text: `Game project information updated successfully.\n\nUpdated fields: ${Object.keys(args || {}).join(", ")}\n\nCurrent project summary:\n${formatProjectSummary(updatedProject)}`,
        },
      ],
    };
  }

  if (name === "get_game_info") {
    const project = await storage.getProject();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(project, null, 2),
        },
      ],
    };
  }

  if (name === "clear_game_info") {
    if (!args || args.confirm !== true) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Must set confirm=true to clear game information"
      );
    }
    
    await storage.clearProject();
    return {
      content: [
        {
          type: "text",
          text: "Game project information has been cleared.",
        },
      ],
    };
  }

  // Unreal Engine tools
  if (name === "scan_unreal_project") {
    if (!args || !args.project_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "project_path is required"
      );
    }

    try {
      unrealManager = new UnrealProjectManager(args.project_path as string);
      await unrealManager.scanProject();
      
      // Set the unrealManager in the bridge for fallback operations.
      // NOTE: This enables fallback functionality for Director integration tools
      // (like list_assets_live, get_live_project_info) when Director is unavailable.
      // Without calling scan_unreal_project first, these tools won't have local data to fall back to.
      editorBridge.setUnrealManager(unrealManager);
      
      const summary = unrealManager.getProjectSummary();
      
      return {
        content: [
          {
            type: "text",
            text: `Unreal Engine project scanned successfully!\n\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to scan project: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "validate_project_structure") {
    if (!args || !args.project_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "project_path is required"
      );
    }

    try {
      unrealManager = new UnrealProjectManager(args.project_path as string);
      const validation = await unrealManager.validateProject();
      
      let resultText = validation.valid 
        ? "✅ Project structure is valid!" 
        : "❌ Project structure has issues:";
      
      if (validation.issues.length > 0) {
        resultText += "\n\n" + validation.issues.map(issue => `- ${issue}`).join("\n");
      }
      
      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to validate project: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "search_code") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.query) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "query is required"
      );
    }

    const results = unrealManager.searchClasses(args.query as string);
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} matching classes:\n\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    };
  }

  if (name === "find_class_usage") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.class_name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "class_name is required"
      );
    }

    const usage = unrealManager.findClassUsage(args.class_name as string);
    
    return {
      content: [
        {
          type: "text",
          text: `Class "${args.class_name}" is used in ${usage.count} files:\n\n${usage.files.join("\n")}`,
        },
      ],
    };
  }

  if (name === "get_class_hierarchy") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.class_name) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "class_name is required"
      );
    }

    const hierarchy = unrealManager.getClassHierarchy(args.class_name as string);
    
    return {
      content: [
        {
          type: "text",
          text: `Class hierarchy for "${args.class_name}":\n\n${hierarchy.join(" -> ")}`,
        },
      ],
    };
  }

  if (name === "search_assets") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.query) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "query is required"
      );
    }

    const results = unrealManager.searchAssets(args.query as string);
    
    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} matching assets:\n\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    };
  }

  if (name === "get_asset_dependencies") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.asset_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "asset_path is required"
      );
    }

    // Placeholder for future implementation
    return {
      content: [
        {
          type: "text",
          text: `Asset dependency tracking is planned for a future release. Currently showing basic asset info for: ${args.asset_path}`,
        },
      ],
    };
  }

  // Helper function for Director tool error handling
  const handleDirectorToolCall = async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<{ content: Array<{ type: string; text: string }> }> => {
    try {
      const result = await operation();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Director integration tools
  if (name === "execute_console_command") {
    if (!args || typeof args.command !== 'string') {
      throw new McpError(
        ErrorCode.InvalidParams,
        "command is required and must be a string"
      );
    }

    return handleDirectorToolCall(
      () => editorBridge.executeConsoleCommand(args.command as string),
      "Failed to execute console command"
    );
  }

  if (name === "run_python_script") {
    if (!args || typeof args.code !== 'string') {
      throw new McpError(
        ErrorCode.InvalidParams,
        "code is required and must be a string"
      );
    }

    return handleDirectorToolCall(
      () => editorBridge.executePythonScript(args.code as string),
      "Failed to execute Python script"
    );
  }

  if (name === "get_live_project_info") {
    return handleDirectorToolCall(
      () => editorBridge.getProjectInfo(),
      "Failed to get project info"
    );
  }

  if (name === "list_assets_live") {
    const filter = args?.filter as string | undefined;
    return handleDirectorToolCall(
      () => editorBridge.listAssets(filter),
      "Failed to list assets"
    );
  }

  throw new McpError(
    ErrorCode.MethodNotFound,
    `Unknown tool: ${name}`
  );
});

// Format project summary for human reading
function formatProjectSummary(project: GameProject): string {
  const lines: string[] = [];
  
  if (project.name) {
    lines.push(`# ${project.name}`);
    lines.push("");
  }
  
  if (project.description) {
    lines.push(`## Description`);
    lines.push(project.description);
    lines.push("");
  }
  
  if (project.genre) {
    lines.push(`**Genre:** ${project.genre}`);
  }
  
  if (Array.isArray(project.platform) && project.platform.length > 0) {
    lines.push(`**Platforms:** ${project.platform.join(", ")}`);
  }
  
  if (project.engine) {
    lines.push(`**Engine:** ${project.engine}`);
  }
  
  if (project.status) {
    lines.push(`**Status:** ${project.status}`);
  }
  
  if (project.repository_url) {
    lines.push(`**Repository:** ${project.repository_url}`);
  }
  
  lines.push("");
  
  if (project.team && project.team.length > 0) {
    lines.push(`## Team`);
    project.team.forEach((member: any) => {
      lines.push(`- ${member.name} - ${member.role}`);
    });
    lines.push("");
  }
  
  if (project.features && project.features.length > 0) {
    lines.push(`## Key Features`);
    project.features.forEach((feature: string) => {
      lines.push(`- ${feature}`);
    });
    lines.push("");
  }
  
  if (project.timeline) {
    lines.push(`## Timeline`);
    if (project.timeline.started) {
      lines.push(`**Started:** ${project.timeline.started}`);
    }
    if (project.timeline.estimated_completion) {
      lines.push(`**Estimated Completion:** ${project.timeline.estimated_completion}`);
    }
    if (project.timeline.milestones && project.timeline.milestones.length > 0) {
      lines.push("");
      lines.push("**Milestones:**");
      project.timeline.milestones.forEach((milestone: any) => {
        lines.push(`- ${milestone.name} (${milestone.date}) - ${milestone.status}`);
      });
    }
    lines.push("");
  }
  
  if (Object.keys(project).length === 0) {
    lines.push("No game project information has been set yet.");
    lines.push("");
    lines.push("Use the update_game_info tool to add project details.");
  }
  
  return lines.join("\n");
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Adastrea MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
