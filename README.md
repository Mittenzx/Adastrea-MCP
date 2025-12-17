# Adastrea-MCP

A Model Context Protocol (MCP) server for managing game project information for **Adastrea**. This server allows AI agents and tools to store, retrieve, and manage comprehensive details about the Adastrea game development project.

**🚀 Vision:** Building the world's best Unreal Engine MCP server. See our [ROADMAP.md](./ROADMAP.md) for the strategic plan.

## About Adastrea

This MCP server is specifically designed for the Adastrea game project, providing a centralized way for AI agents to understand and work with all aspects of the game's development.

**Game Repository:** https://github.com/Mittenzx/Adastrea

**Pre-populated Project Data:** The MCP server comes with comprehensive information about the Adastrea project already loaded, including:
- Complete game description and features (22 major systems)
- Technical details (33,000+ lines of C++ code)
- Development timeline and milestones
- Python automation tools and YAML templates
- Current project status (Alpha phase, code 85% complete)

The pre-populated data ensures AI agents have immediate context about Adastrea without manual configuration.

## Features

### Core Features
- **Centralized Game Project Information**: Store all details about your game project in one place
- **MCP Resources**: Access project information through standardized MCP resources
- **MCP Tools**: Update and manage project information using built-in tools
- **Flexible Schema**: Support for standard fields and custom fields for project-specific needs
- **Team Management**: Track team members and their roles
- **Timeline Tracking**: Monitor project milestones and progress
- **Technical Documentation**: Store technical specifications and architecture details

### Phase 1: Foundation Enhancement (✅ Completed)
- **Unreal Project File Parser**: Parse `.uproject` files to extract engine version, modules, and plugins
- **C++ Code Analysis**: Detect and catalog UCLASS, USTRUCT, UENUM, and UINTERFACE definitions
- **Blueprint Detection**: Identify Blueprint assets and their metadata
- **Asset Management**: Scan and categorize project assets (Meshes, Materials, Textures, etc.)
- **Plugin Scanner**: Inventory and analyze installed plugins
- **Build Configuration**: Detect available build configurations and target platforms
- **Code Intelligence**: Search capabilities for classes, functions, and assets
- **Project Validation**: Automated checks for common project structure issues

### Phase 2.1: Editor Communication Layer (✅ Completed)
- **Adastrea-Director Integration**: Seamless connection to [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director) plugin
- **Live Editor State**: Real-time access to UE Editor state and current level information
- **Console Command Execution**: Run UE console commands remotely via MCP
- **Python Script Execution**: Execute Python code in UE Editor's embedded interpreter
- **Live Asset Management**: Real-time asset list with fallback to local cache
- **Graceful Degradation**: Automatic fallback to local analysis when Director unavailable

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
      "args": ["/absolute/path/to/Adastrea-MCP/build/index.js"]
    }
  }
}
```

### Available Resources

#### Game Project Resources
- `game://project/info` - Complete project information in JSON format
- `game://project/summary` - Human-readable project summary

#### Unreal Engine Resources (Phase 1)
- `unreal://project/config` - Complete Unreal Engine project configuration from .uproject file
- `unreal://project/modules` - List of all modules and their dependencies
- `unreal://project/plugins` - Inventory of installed plugins with metadata
- `unreal://project/classes` - All UCLASS, USTRUCT, UENUM, and UINTERFACE definitions
- `unreal://project/blueprints` - List of all Blueprint assets in the project
- `unreal://project/assets` - Complete asset catalog with types and paths
- `unreal://build/config` - Available build configurations and target platforms

#### Editor Integration Resources (Phase 2.1)
- `unreal://editor/state` - Current state of UE Editor (requires Adastrea-Director)
- `unreal://editor/capabilities` - Available capabilities based on Director connection status

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
- `repository_url` (string): URL to the game's source code repository
- `team` (array): Team members and their roles
- `features` (array): Key features of the game
- `technical_details` (object): Technical specifications and architecture details
- `timeline` (object): Project timeline information with milestones
- `custom_fields` (object): Any additional custom fields

**Example:**
```json
{
  "name": "Adastrea",
  "genre": "RPG",
  "engine": "Unity",
  "status": "In Development",
  "repository_url": "https://github.com/Mittenzx/Adastrea",
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

### Unreal Engine Tools (Phase 1)

#### scan_unreal_project

Perform a deep scan of an Unreal Engine project structure, analyzing .uproject files, modules, plugins, C++ classes, and assets.

**Parameters:**
- `project_path` (string, required): Absolute path to the Unreal Engine project directory (containing the .uproject file)

**Example:**
```json
{
  "project_path": "/path/to/MyUnrealProject"
}
```

#### validate_project_structure

Validate an Unreal Engine project structure and check for common issues.

**Parameters:**
- `project_path` (string, required): Absolute path to the Unreal Engine project directory

#### search_code

Search for C++ classes, structs, enums, or interfaces in the scanned Unreal project.

**Parameters:**
- `query` (string, required): Search query (class name, type, etc.)

#### find_class_usage

Find all usages of a specific C++ class in the project.

**Parameters:**
- `class_name` (string, required): Name of the class to find usages for

#### get_class_hierarchy

Get the inheritance hierarchy for a specific C++ class.

**Parameters:**
- `class_name` (string, required): Name of the class

#### search_assets

Search for assets in the scanned Unreal project by name, type, or path.

**Parameters:**
- `query` (string, required): Search query (asset name, type, or path)

#### get_asset_dependencies

Get dependencies for a specific asset (placeholder for future implementation).

**Parameters:**
- `asset_path` (string, required): Path to the asset

### Editor Integration Tools (Phase 2.1)

#### execute_console_command

Execute a console command in the running Unreal Engine Editor via Adastrea-Director.

**Parameters:**
- `command` (string, required): Console command to execute (e.g., 'stat fps', 'ke * list')

**Example:**
```json
{
  "command": "stat fps"
}
```

#### run_python_script

Execute Python code in the Unreal Engine Editor's embedded Python interpreter.

**Parameters:**
- `code` (string, required): Python code to execute in the UE Editor

**Example:**
```json
{
  "code": "import unreal\nprint(unreal.SystemLibrary.get_project_directory())"
}
```

#### get_live_project_info

Get live project information from the running UE Editor. Prefers live data from Adastrea-Director over cached local data. Falls back to local analysis if Director is unavailable.

**Parameters:** None

**Example Response:**
```json
{
  "projectInfo": {
    "projectName": "MyGame",
    "projectPath": "C:/Projects/MyGame",
    "engineVersion": "5.3",
    "isLoaded": true
  },
  "source": "director",
  "directorAvailable": true,
  "localAnalysisAvailable": true
}
```

#### list_assets_live

List assets from the running UE Editor in real-time. Prefers live data from Adastrea-Director over cached local data.

**Parameters:**
- `filter` (string, optional): Optional filter string to search for specific assets

**Example:**
```json
{
  "filter": "Material"
}
```

## Example Workflows

### Basic Project Information

1. **Initialize Project Information:**
   ```
   Use update_game_info to set:
   - name: "Adastrea"
   - genre: "Action RPG"
   - engine: "Unreal Engine 5"
   - status: "In Development"
   ```

2. **Add Team Information:**
   ```
   Use update_game_info to add team:
   - [{name: "Mittenzx", role: "Lead Developer"}]
   ```

3. **Access Project Info:**
   - AI agents can read `game://project/info` resource
   - Get human-readable summary from `game://project/summary`
   - Use get_game_info tool for programmatic access

### Unreal Engine Project Analysis (Phase 1)

1. **Scan an Unreal Project:**
   ```
   Use scan_unreal_project with:
   - project_path: "/path/to/MyUnrealProject"
   ```
   This will analyze:
   - .uproject file and configuration
   - All modules and their dependencies
   - Installed plugins
   - C++ classes (UCLASS, USTRUCT, UENUM, UINTERFACE)
   - Blueprint assets
   - Project assets

2. **Search for Classes:**
   ```
   Use search_code with:
   - query: "Character"
   ```
   Returns all classes matching the search term

3. **Analyze Class Hierarchy:**
   ```
   Use get_class_hierarchy with:
   - class_name: "AMyCharacter"
   ```
   Shows the full inheritance chain

4. **Find Asset Usage:**
   ```
   Use search_assets with:
   - query: "Material"
   ```
   Lists all materials in the project

5. **Access Unreal Resources:**
   - Read `unreal://project/config` for complete project configuration
   - Read `unreal://project/classes` for all C++ classes
   - Read `unreal://project/assets` for asset catalog

### Live Editor Integration (Phase 2.1)

1. **Check Director Connection:**
   ```
   Read unreal://editor/capabilities to verify:
   - Director is connected
   - Editor commands available
   - Python execution available
   ```

2. **Execute Console Commands:**
   ```
   Use execute_console_command with:
   - command: "stat fps"
   Opens FPS counter in editor
   ```

3. **Run Python Scripts:**
   ```
   Use run_python_script with:
   - code: "import unreal\nprint(unreal.EditorLevelLibrary.get_all_level_actors())"
   Lists all actors in current level
   ```

4. **Get Live Asset List:**
   ```
   Use list_assets_live with:
   - filter: "Blueprint"
   Gets real-time list of Blueprint assets from editor
   ```

5. **Access Editor State:**
   - Read `unreal://editor/state` for current editor context
   - Get current level, selected actors, viewport state
   - Use for context-aware suggestions

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

## Roadmap

We're on a mission to build the world's best Unreal Engine MCP server! Our comprehensive roadmap includes:

- **Phase 1:** Foundation Enhancement - Deep Unreal project understanding
- **Phase 2:** Deep UE Integration - Leveraging [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director) plugin for real-time editor interaction
- **Phase 3:** AI-Enhanced Tools - Intelligent code generation and refactoring
- **Phase 4:** Advanced Ecosystem - Multi-project support, marketplace integration
- **Phase 5:** Intelligence & Automation - Semantic understanding and predictive assistance

📋 **[View Full Roadmap](./ROADMAP.md)** for detailed plans, timelines, and contribution opportunities.

### Integration with Adastrea-Director

Adastrea-MCP works seamlessly with [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director), a comprehensive Unreal Engine plugin that provides:
- **C++ UE Editor Plugin** for live engine integration
- **Python Backend** with IPC communication
- **MCP Server** for remote execution and asset management
- **RAG System** for intelligent document understanding
- **Planning Agents** for autonomous task decomposition

Together, Adastrea-MCP (static analysis and planning) and Adastrea-Director (runtime execution) form a complete AI-assisted game development ecosystem.

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, improving documentation, or testing with your Unreal Engine projects, your help is valuable. Check out our [ROADMAP.md](./ROADMAP.md) to see where you can contribute.

## License

MIT