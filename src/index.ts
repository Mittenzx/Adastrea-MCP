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
      },
      {
        uri: "unreal://level/actors",
        name: "Level Actors",
        description: "All actors in the current level with component hierarchies",
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

    if (uri === "unreal://level/actors") {
      const actorsResponse = await unrealManager.getActorsInLevel();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(actorsResponse, null, 2),
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
      {
        name: "inspect_blueprint",
        description: "Get full Blueprint structure including variables, functions, graphs, and components",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset (e.g., 'Blueprints/BP_Character.uasset')",
            },
          },
          required: ["blueprint_path"],
        },
      },
      {
        name: "search_blueprint_nodes",
        description: "Find specific node types within a Blueprint (e.g., FunctionCall, Branch, ForLoop)",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset",
            },
            node_type: {
              type: "string",
              description: "Optional node type to search for (e.g., 'FunctionCall', 'Branch', 'ForLoop')",
            },
          },
          required: ["blueprint_path"],
        },
      },
      {
        name: "get_blueprint_variables",
        description: "List all variables in a Blueprint with their types, categories, and properties",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset",
            },
          },
          required: ["blueprint_path"],
        },
      },
      {
        name: "get_blueprint_functions",
        description: "List all functions in a Blueprint with their signatures, parameters, and properties",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset",
            },
          },
          required: ["blueprint_path"],
        },
      },
      {
        name: "add_blueprint_variable",
        description: "Add a new variable to a Blueprint (requires Adastrea-Director integration)",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset",
            },
            variable: {
              type: "object",
              description: "Variable definition",
              properties: {
                name: {
                  type: "string",
                  description: "Variable name",
                },
                type: {
                  type: "string",
                  description: "Variable type (e.g., 'int32', 'float', 'FString', 'AActor*')",
                },
                category: {
                  type: "string",
                  description: "Optional category for organization",
                },
                defaultValue: {
                  description: "Optional default value",
                },
                isExposed: {
                  type: "boolean",
                  description: "Whether the variable is exposed to cinematics",
                },
                isEditable: {
                  type: "boolean",
                  description: "Whether the variable is editable on instances",
                },
                tooltip: {
                  type: "string",
                  description: "Optional tooltip description",
                },
              },
              required: ["name", "type"],
            },
          },
          required: ["blueprint_path", "variable"],
        },
      },
      {
        name: "add_blueprint_function",
        description: "Create a new function in a Blueprint (requires Adastrea-Director integration)",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset",
            },
            function: {
              type: "object",
              description: "Function definition",
              properties: {
                name: {
                  type: "string",
                  description: "Function name",
                },
                category: {
                  type: "string",
                  description: "Optional category for organization",
                },
                returnType: {
                  type: "string",
                  description: "Optional return type",
                },
                parameters: {
                  type: "array",
                  description: "Function parameters",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      isReference: { type: "boolean" },
                      defaultValue: {},
                    },
                    required: ["name", "type"],
                  },
                },
                isPure: {
                  type: "boolean",
                  description: "Whether the function is pure (no side effects)",
                },
                tooltip: {
                  type: "string",
                  description: "Optional tooltip description",
                },
              },
              required: ["name", "parameters"],
            },
          },
          required: ["blueprint_path", "function"],
        },
      },
      {
        name: "modify_blueprint_property",
        description: "Change the default value of a Blueprint variable (requires Adastrea-Director integration)",
        inputSchema: {
          type: "object",
          properties: {
            blueprint_path: {
              type: "string",
              description: "Relative path to the Blueprint asset",
            },
            property_name: {
              type: "string",
              description: "Name of the property/variable to modify",
            },
            new_value: {
              description: "New default value for the property",
            },
          },
          required: ["blueprint_path", "property_name", "new_value"],
        },
      },
      {
        name: "spawn_actor",
        description: "Spawn a new actor in the current level (requires Adastrea-Director integration)",
        inputSchema: {
          type: "object",
          properties: {
            className: {
              type: "string",
              description: "Actor class to spawn (e.g., 'AStaticMeshActor', '/Game/Blueprints/BP_Character.BP_Character_C')",
            },
            location: {
              type: "object",
              description: "World location to spawn the actor",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" },
              },
            },
            rotation: {
              type: "object",
              description: "World rotation for the actor",
              properties: {
                pitch: { type: "number" },
                yaw: { type: "number" },
                roll: { type: "number" },
              },
            },
            scale: {
              type: "object",
              description: "World scale for the actor",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" },
              },
            },
            name: {
              type: "string",
              description: "Optional custom name for the actor instance",
            },
            properties: {
              type: "object",
              description: "Initial property values for the actor",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags to assign to the actor",
            },
            folder: {
              type: "string",
              description: "Level folder to place actor in",
            },
          },
          required: ["className"],
        },
      },
      {
        name: "modify_actor_properties",
        description: "Modify properties of an existing actor in the level (requires Adastrea-Director integration)",
        inputSchema: {
          type: "object",
          properties: {
            actorPath: {
              type: "string",
              description: "Full path to the actor (e.g., '/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0')",
            },
            properties: {
              type: "object",
              description: "Properties to modify with their new values",
            },
            transform: {
              type: "object",
              description: "Transform modifications",
              properties: {
                location: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" },
                  },
                },
                rotation: {
                  type: "object",
                  properties: {
                    pitch: { type: "number" },
                    yaw: { type: "number" },
                    roll: { type: "number" },
                  },
                },
                scale: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" },
                  },
                },
              },
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags to assign to the actor",
            },
          },
          required: ["actorPath"],
        },
      },
      {
        name: "get_actor_components",
        description: "Get component hierarchy for an actor",
        inputSchema: {
          type: "object",
          properties: {
            actorPath: {
              type: "string",
              description: "Full path to the actor",
            },
          },
          required: ["actorPath"],
        },
      },
      {
        name: "create_actor_template",
        description: "Save an actor as a reusable template",
        inputSchema: {
          type: "object",
          properties: {
            actorPath: {
              type: "string",
              description: "Path to the actor to save as template (requires Adastrea-Director for live actors)",
            },
            templateName: {
              type: "string",
              description: "Name for the template",
            },
            description: {
              type: "string",
              description: "Optional description of the template",
            },
            category: {
              type: "string",
              description: "Optional category for organization",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional tags for the template",
            },
          },
          required: ["actorPath", "templateName"],
        },
      },
      {
        name: "list_actor_templates",
        description: "List all available actor templates",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Optional category filter",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional tags filter",
            },
          },
        },
      },
      {
        name: "instantiate_template",
        description: "Create an actor from a template (requires Adastrea-Director integration)",
        inputSchema: {
          type: "object",
          properties: {
            templateId: {
              type: "string",
              description: "ID of the template to instantiate",
            },
            location: {
              type: "object",
              description: "World location to spawn the actor",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" },
              },
            },
            rotation: {
              type: "object",
              description: "World rotation for the actor",
              properties: {
                pitch: { type: "number" },
                yaw: { type: "number" },
                roll: { type: "number" },
              },
            },
            scale: {
              type: "object",
              description: "World scale for the actor",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                z: { type: "number" },
              },
            },
            name: {
              type: "string",
              description: "Optional custom name for the spawned actor",
            },
            folder: {
              type: "string",
              description: "Level folder to place actor in",
            },
          },
          required: ["templateId"],
        },
      },
      {
        name: "delete_actor_template",
        description: "Delete an actor template",
        inputSchema: {
          type: "object",
          properties: {
            templateId: {
              type: "string",
              description: "ID of the template to delete",
            },
          },
          required: ["templateId"],
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

  // Blueprint Inspection Tools
  if (name === "inspect_blueprint") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path is required"
      );
    }

    try {
      const blueprintInfo = await unrealManager.inspectBlueprint(args.blueprint_path as string);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(blueprintInfo, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to inspect blueprint: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "search_blueprint_nodes") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path is required"
      );
    }

    try {
      const nodeType = args.node_type as string | undefined;
      const nodes = await unrealManager.searchBlueprintNodes(
        args.blueprint_path as string,
        nodeType
      );
      
      return {
        content: [
          {
            type: "text",
            text: `Found ${nodes.length} node(s)${nodeType ? ` of type "${nodeType}"` : ''}:\n\n${JSON.stringify(nodes, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search blueprint nodes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "get_blueprint_variables") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path is required"
      );
    }

    try {
      const variables = await unrealManager.getBlueprintVariables(args.blueprint_path as string);
      return {
        content: [
          {
            type: "text",
            text: `Blueprint has ${variables.length} variable(s):\n\n${JSON.stringify(variables, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get blueprint variables: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "get_blueprint_functions") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path is required"
      );
    }

    try {
      const functions = await unrealManager.getBlueprintFunctions(args.blueprint_path as string);
      return {
        content: [
          {
            type: "text",
            text: `Blueprint has ${functions.length} function(s):\n\n${JSON.stringify(functions, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get blueprint functions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Blueprint Modification Tools
  if (name === "add_blueprint_variable") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path || !args.variable) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path and variable are required"
      );
    }

    try {
      const result = await unrealManager.addBlueprintVariable(
        args.blueprint_path as string,
        args.variable as any
      );
      
      return {
        content: [
          {
            type: "text",
            text: result.success 
              ? `✅ ${result.message}` 
              : `⚠️ ${result.message}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to add blueprint variable: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "add_blueprint_function") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path || !args.function) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path and function are required"
      );
    }

    try {
      const result = await unrealManager.addBlueprintFunction(
        args.blueprint_path as string,
        args.function as any
      );
      
      return {
        content: [
          {
            type: "text",
            text: result.success 
              ? `✅ ${result.message}` 
              : `⚠️ ${result.message}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to add blueprint function: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "modify_blueprint_property") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.blueprint_path || !args.property_name || args.new_value === undefined) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "blueprint_path, property_name, and new_value are required"
      );
    }

    try {
      const result = await unrealManager.modifyBlueprintProperty(
        args.blueprint_path as string,
        args.property_name as string,
        args.new_value
      );
      
      return {
        content: [
          {
            type: "text",
            text: result.success 
              ? `✅ ${result.message}` 
              : `⚠️ ${result.message}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to modify blueprint property: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Actor Management Tools
  if (name === "spawn_actor") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.className) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "className is required"
      );
    }

    try {
      const result = await unrealManager.spawnActor(args as any);
      return {
        content: [
          {
            type: "text",
            text: result.success 
              ? `✅ ${result.message}\n\n${JSON.stringify(result.actor, null, 2)}` 
              : `⚠️ ${result.message}${result.error ? `\nError: ${result.error}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to spawn actor: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "modify_actor_properties") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.actorPath) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "actorPath is required"
      );
    }

    try {
      const result = await unrealManager.modifyActorProperties(args as any);
      return {
        content: [
          {
            type: "text",
            text: result.success 
              ? `✅ ${result.message}\nModified properties: ${result.modifiedProperties?.join(', ')}` 
              : `⚠️ ${result.message}${result.error ? `\nError: ${result.error}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to modify actor properties: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "get_actor_components") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.actorPath) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "actorPath is required"
      );
    }

    try {
      const hierarchy = await unrealManager.getActorComponents(args.actorPath as string);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(hierarchy, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get actor components: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Actor Template Management Tools
  if (name === "create_actor_template") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.actorPath || !args.templateName) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "actorPath and templateName are required"
      );
    }

    try {
      const template = await unrealManager.createTemplateFromActor(args as any);
      return {
        content: [
          {
            type: "text",
            text: `✅ Template created successfully:\n\n${JSON.stringify(template, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create actor template: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "list_actor_templates") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    try {
      const filter = args ? {
        category: args.category as string | undefined,
        tags: args.tags as string[] | undefined,
      } : undefined;
      
      const templates = unrealManager.listTemplates(filter);
      return {
        content: [
          {
            type: "text",
            text: `Found ${templates.length} template(s):\n\n${JSON.stringify(templates, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list actor templates: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "instantiate_template") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.templateId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "templateId is required"
      );
    }

    try {
      const result = await unrealManager.instantiateFromTemplate(args as any);
      return {
        content: [
          {
            type: "text",
            text: result.success 
              ? `✅ ${result.message}\n\n${JSON.stringify(result.actor, null, 2)}` 
              : `⚠️ ${result.message}${result.error ? `\nError: ${result.error}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to instantiate template: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (name === "delete_actor_template") {
    if (!unrealManager) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "No Unreal project loaded. Use scan_unreal_project first."
      );
    }

    if (!args || !args.templateId) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "templateId is required"
      );
    }

    try {
      const deleted = await unrealManager.deleteTemplate(args.templateId as string);
      return {
        content: [
          {
            type: "text",
            text: deleted 
              ? `✅ Template deleted successfully` 
              : `⚠️ Template not found`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete template: ${error instanceof Error ? error.message : String(error)}`
      );
    }
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
