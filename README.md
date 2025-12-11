# Adastrea-MCP

A Model Context Protocol (MCP) server for managing game project information. This server allows AI agents and tools to store, retrieve, and manage comprehensive details about your game development project.

## Features

- **Centralized Game Project Information**: Store all details about your game project in one place
- **MCP Resources**: Access project information through standardized MCP resources
- **MCP Tools**: Update and manage project information using built-in tools
- **Flexible Schema**: Support for standard fields and custom fields for project-specific needs
- **Team Management**: Track team members and their roles
- **Timeline Tracking**: Monitor project milestones and progress
- **Technical Documentation**: Store technical specifications and architecture details

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server

Add this to your MCP client configuration (e.g., Claude Desktop, Cline, or other MCP-compatible tools):

```json
{
  "mcpServers": {
    "adastrea": {
      "command": "node",
      "args": ["/path/to/Adastrea-MCP/build/index.js"]
    }
  }
}
```

### Available Resources

- `game://project/info` - Complete project information in JSON format
- `game://project/summary` - Human-readable project summary

### Available Tools

#### update_game_info

Update or add game project information. Supports partial updates - only provide the fields you want to change.

**Parameters:**
- `name` (string): The name of the game
- `description` (string): A detailed description of the game
- `genre` (string): The game's genre (e.g., RPG, FPS, Strategy)
- `platform` (array): Target platforms (e.g., ["PC", "Console", "Mobile"])
- `engine` (string): Game engine being used (e.g., Unity, Unreal, Godot)
- `status` (string): Current development status (e.g., Planning, In Development, Testing, Released)
- `team` (array): Team members and their roles
- `features` (array): Key features of the game
- `technical_details` (object): Technical specifications and architecture details
- `timeline` (object): Project timeline information with milestones
- `custom_fields` (object): Any additional custom fields

**Example:**
```json
{
  "name": "Epic Adventure",
  "genre": "RPG",
  "engine": "Unity",
  "status": "In Development",
  "platform": ["PC", "Console"],
  "features": [
    "Open world exploration",
    "Dynamic combat system",
    "Branching storylines"
  ]
}
```

#### get_game_info

Retrieve the current game project information in JSON format.

#### clear_game_info

Clear all game project information and start fresh.

**Parameters:**
- `confirm` (boolean, required): Must be set to `true` to confirm deletion

## Example Workflow

1. **Initialize Project Information:**
   ```
   Use update_game_info to set:
   - name: "Mystic Quest"
   - genre: "Action RPG"
   - engine: "Unreal Engine 5"
   - status: "Planning"
   ```

2. **Add Team Information:**
   ```
   Use update_game_info to add team:
   - [{name: "Alice", role: "Lead Developer"},
      {name: "Bob", role: "Artist"}]
   ```

3. **Access Project Info:**
   - AI agents can read `game://project/info` resource
   - Get human-readable summary from `game://project/summary`
   - Use get_game_info tool for programmatic access

## Data Storage

Project information is stored in `game-project-data.json` in the package root directory. This file is automatically created when you first update project information.

## Benefits for AI Agents

When agents have access to this MCP server, they can:
- Understand the complete context of your game project
- Make informed suggestions based on your tech stack
- Respect your project's architecture and conventions
- Track progress against milestones
- Work consistently with your team's structure and roles

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

## License

MIT