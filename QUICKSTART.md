# Quick Start Guide

This guide will help you get started with Adastrea-MCP quickly.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Mittenzx/Adastrea-MCP.git
cd Adastrea-MCP
```

2. Install dependencies and build:
```bash
npm install
```

The build will run automatically during installation.

## Configuration

### For Claude Desktop

1. Find your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the server configuration:
```json
{
  "mcpServers": {
    "adastrea": {
      "command": "node",
      "args": [
        "/full/path/to/Adastrea-MCP/build/index.js"
      ]
    }
  }
}
```

3. Restart Claude Desktop

### For Other MCP Clients

See `mcp-config-example.json` for a template configuration.

## First Steps

Once configured, you can start using the MCP server through your AI assistant:

1. **Set up your project information:**
   ```
   "Can you update the game project information with:
   - name: My Awesome Game
   - genre: Action RPG
   - engine: Unreal Engine 5
   - status: Planning"
   ```

2. **View project information:**
   ```
   "Show me the current game project information"
   ```

3. **Access as a resource:**
   The AI can now read `game://project/info` and `game://project/summary` resources automatically when needed.

## Example Use Cases

### Setting Up a New Project
```
Update the game info with:
- name: "Fantasy Quest"
- description: "An epic fantasy adventure with magic and dragons"
- genre: "Action RPG"
- engine: "Unity"
- platform: ["PC", "PlayStation 5", "Xbox Series X"]
- status: "Planning"
- features: ["Open world", "Magic system", "Dragon riding"]
```

### Adding Team Information
```
Add team members to the project:
- Alice Johnson - Lead Developer
- Bob Smith - Game Designer
- Carol White - 3D Artist
```

### Tracking Milestones
```
Set up project timeline with milestones:
- Started: 2025-01-01
- Estimated completion: 2026-06-30
- Milestones:
  - Prototype (2025-03-01) - In Progress
  - Alpha (2025-09-01) - Planned
  - Beta (2025-12-01) - Planned
  - Release (2026-06-30) - Planned
```

## Verifying Installation

To verify the server is working, check that:
1. The server appears in your MCP client's server list
2. You can call `update_game_info` tool successfully
3. You can read the `game://project/summary` resource

## Troubleshooting

### Server not showing up
- Verify the path in the config is absolute and correct
- Check that `build/index.js` exists
- Restart your MCP client completely

### Permission errors
- Ensure the server has write permissions in its directory
- The data file (`game-project-data.json`) will be created automatically

### Build errors
- Make sure you have Node.js v18 or higher
- Run `npm install` again
- Check for any error messages during build

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore all available fields in the `update_game_info` tool
- Set up custom fields for your specific project needs
- Use the project information to help AI understand your game's context
