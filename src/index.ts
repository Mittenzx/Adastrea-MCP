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
import { GameProjectStorage } from "./storage.js";

// Initialize storage
const storage = new GameProjectStorage();

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
  const project = await storage.getProject();
  
  return {
    resources: [
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
    ],
  };
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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "update_game_info") {
    const project = await storage.getProject();
    const updatedProject = { ...project, ...(args || {}) };
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

  throw new McpError(
    ErrorCode.MethodNotFound,
    `Unknown tool: ${name}`
  );
});

// Format project summary for human reading
function formatProjectSummary(project: any): string {
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
  
  if (project.platform && project.platform.length > 0) {
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
