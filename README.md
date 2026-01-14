# Adastrea-MCP

A Model Context Protocol (MCP) server for managing game project information for **Adastrea**. This server allows AI agents and tools to store, retrieve, and manage comprehensive details about the Adastrea game development project.

**🚀 Vision:** Building the world's best Unreal Engine MCP server. See our [ROADMAP.md](./ROADMAP.md) for the strategic plan.

**📊 Current Status (v1.0.0):** Phases 1, 2.1, 2.2, 2.3, and 3.1 complete! The server includes comprehensive Unreal Engine integration with 30+ tools, 15+ resources, live editor communication, Blueprint interaction, actor management, intelligent code generation, and a complete UE5.6+ knowledge database.

## About Adastrea

This MCP server is specifically designed for the Adastrea game project, providing a centralized way for AI agents to understand and work with all aspects of the game's development.

**Game Repository:** https://github.com/Mittenzx/Adastrea

**🔗 Repository Access:** This MCP server has full GitHub API access to the Adastrea repository for comprehensive project understanding.

**Pre-populated Project Data:** The MCP server comes with comprehensive information about the Adastrea project already loaded, including:
- Complete game description and features (22 major systems)
- Technical details (33,000+ lines of C++ code)
- Development timeline and milestones
- Python automation tools and YAML templates
- Current project status (Alpha 1.0.0-alpha, Phase 4 in progress)
- Reality check: Code 85% complete, Content 10% complete

The pre-populated data combined with live repository access ensures AI agents have immediate and up-to-date context about Adastrea without manual configuration.

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
- **Adastrea-Director Integration**: Seamless connection to [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director) 
  - Director is now a comprehensive UE plugin with autonomous agents (P3 complete)
  - Includes built-in MCP server for AI agent access (84+ tests)
  - UE Python API integration with 25+ tests
  - Performance profiling, bug detection, and code quality monitoring
- **Live Editor State**: Real-time access to UE Editor state and current level information
- **Console Command Execution**: Run UE console commands remotely via MCP
- **Python Script Execution**: Execute Python code in UE Editor's embedded interpreter
- **Live Asset Management**: Real-time asset list with fallback to local cache
- **Graceful Degradation**: Automatic fallback to local analysis when Director unavailable

### Phase 2.2: Blueprint Interaction Tools (✅ Completed)
- **Blueprint Inspection**: Deep inspection of Blueprint structure, variables, functions, and graphs
- **Blueprint Node Search**: Find specific node types within Blueprints
- **Blueprint Modification**: Add variables and functions, modify properties (requires Director)
- **Component Analysis**: Inspect Blueprint component hierarchies
- **Graph Analysis**: Analyze Blueprint event graphs and function graphs

### Phase 2.3: Actor & Component System (✅ Completed)
- **Level Actor Registry**: List and search actors in the current level
- **Actor Spawning**: Create new actors programmatically with full configuration
- **Actor Modification**: Modify actor properties, transforms, and tags
- **Component Inspection**: Analyze actor component hierarchies and relationships
- **Actor Templates**: Save and reuse common actor configurations
- **Template Management**: Create, list, instantiate, and manage actor templates

### UE5.6+ Knowledge Database (✅ Completed)
- **Comprehensive Systems Library**: Detailed information on 12+ core Unreal Engine 5.6+ systems including:
  - Core Architecture (modules, subsystems, asset management)
  - Gameplay Framework (actors, components, game modes)
  - Rendering System (Lumen, Nanite, Virtual Shadow Maps)
  - Animation System (UAF, Motion Trails, MetaHuman)
  - Physics System (Chaos, collision, vehicles)
  - AI System (Behavior Trees, State Trees, Mass Entity)
  - Networking System (Iris replication, RPCs)
  - Audio System (MetaSounds, procedural audio)
  - UI System (UMG, Common UI, MVVM)
  - Niagara VFX System (particles, fluids)
  - Gameplay Ability System (GAS)
  - Material System (PBR, node-based editor)
- **Rich Metadata**: Each system includes features, best practices, version info, related systems, and official references
- **Searchable Knowledge**: Query by keywords, tags, or system IDs
- **Web-Sourced Information**: Curated from official documentation, community forums, tutorials, and expert resources
- **MCP Resources & Tools**: Access via resources (`unreal://knowledge/*`) and query tools

### GitHub Copilot Agent (✨ New)
- **Custom Unreal Engine Agent**: Pre-configured GitHub Copilot agent for UE5.6+ development
- **Epic Games Standards**: Enforces official Epic Games coding conventions and best practices
- **MCP Integration**: Leverages all Adastrea-MCP tools for intelligent project analysis
- **Comprehensive Knowledge**: Built-in expertise in all major UE5.6+ systems
- **Multi-Repository Deployment**: Can be rolled out across all your Unreal Engine repositories
- **Reusable**: Works with any Unreal Engine project, not just Adastrea
### Phase 3.1: AI-Enhanced Development Tools (✅ Completed)
- **Intelligent Code Generation**: Generate UE-compliant C++ code following best practices
- **Unreal-Aware Templates**: Create UClasses, Blueprints-compatible classes, common patterns
- **GameMode Generation**: Generate GameMode classes with proper setup
- **Character Generation**: Create Character classes with health system
- **Component Generation**: Generate ActorComponent classes for reusable functionality
- **Replication Code**: Generate network replication code for properties and RPCs
- **Data Assets**: Create UDataAsset classes for configuration data
- **Data Tables**: Generate USTRUCT row structures for Data Tables
- **8 New Code Generation Tools**: Comprehensive code scaffolding for UE development

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

#### Actor & Component Resources (Phase 2.3)
- `unreal://level/actors` - All actors in the current level with component hierarchies

#### UE5.6+ Knowledge Database Resources
- `unreal://knowledge/summary` - Overview of the UE5.6+ knowledge database with system counts and categories
- `unreal://knowledge/systems` - Complete catalog of all UE5.6+ systems with detailed information, features, best practices, and references
- `unreal://knowledge/tags` - All available tags for categorizing and searching UE5.6+ systems

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
    "engineVersion": "5.6",
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

### Actor & Component Tools (Phase 2.3)

#### spawn_actor

Spawn a new actor in the current level (requires Adastrea-Director integration).

**Parameters:**
- `className` (string, required): Actor class to spawn (e.g., 'AStaticMeshActor', '/Game/Blueprints/BP_Character.BP_Character_C')
- `location` (object, optional): World location {x, y, z}
- `rotation` (object, optional): World rotation {pitch, yaw, roll}
- `scale` (object, optional): World scale {x, y, z}
- `name` (string, optional): Custom name for the actor instance
- `properties` (object, optional): Initial property values
- `tags` (array, optional): Tags to assign to the actor
- `folder` (string, optional): Level folder to place actor in

**Example:**
```json
{
  "className": "AStaticMeshActor",
  "location": {"x": 0, "y": 0, "z": 100},
  "rotation": {"pitch": 0, "yaw": 0, "roll": 0},
  "name": "MyStaticMesh"
}
```

#### modify_actor_properties

Modify properties of an existing actor in the level (requires Adastrea-Director integration).

**Parameters:**
- `actorPath` (string, required): Full path to the actor
- `properties` (object, optional): Properties to modify
- `transform` (object, optional): Transform modifications (location, rotation, scale)
- `tags` (array, optional): Tags to assign

**Example:**
```json
{
  "actorPath": "/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0",
  "transform": {
    "location": {"x": 100, "y": 200, "z": 50}
  },
  "properties": {
    "bHidden": false
  }
}
```

#### get_actor_components

Get the component hierarchy for an actor.

**Parameters:**
- `actorPath` (string, required): Full path to the actor

**Example:**
```json
{
  "actorPath": "/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0"
}
```

#### create_actor_template

Save an actor as a reusable template.

**Parameters:**
- `actorPath` (string, required): Path to the actor to save as template
- `templateName` (string, required): Name for the template
- `description` (string, optional): Description of the template
- `category` (string, optional): Category for organization
- `tags` (array, optional): Tags for the template

**Example:**
```json
{
  "actorPath": "/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0",
  "templateName": "Lamp Post Standard",
  "category": "Environment",
  "tags": ["lighting", "street"]
}
```

#### list_actor_templates

List all available actor templates.

**Parameters:**
- `category` (string, optional): Filter by category
- `tags` (array, optional): Filter by tags

**Example:**
```json
{
  "category": "Environment"
}
```

#### instantiate_template

Create an actor from a template (requires Adastrea-Director integration).

**Parameters:**
- `templateId` (string, required): ID of the template to instantiate
- `location` (object, optional): World location
- `rotation` (object, optional): World rotation
- `scale` (object, optional): World scale
- `name` (string, optional): Custom name for the spawned actor
- `folder` (string, optional): Level folder

**Example:**
```json
{
  "templateId": "template_1234567890_abc123xyz",
  "location": {"x": 500, "y": 300, "z": 0}
}
```

#### delete_actor_template

Delete an actor template.

**Parameters:**
- `templateId` (string, required): ID of the template to delete

**Example:**
```json
{
  "templateId": "template_1234567890_abc123xyz"
}
```

### UE5.6+ Knowledge Database Tools

#### query_ue_knowledge

Search the UE5.6+ knowledge database for information about Unreal Engine systems, features, and best practices.

**Parameters:**
- `query` (string, required): Search query (keywords, system names, or tags)

**Example:**
```json
{
  "query": "rendering"
}
```

#### get_ue_system

Get detailed information about a specific Unreal Engine system by ID.

**Parameters:**
- `systemId` (string, required): System ID (e.g., 'rendering-system', 'gameplay-framework', 'animation-system')

**Example:**
```json
{
  "systemId": "rendering-system"
}
```

#### get_ue_systems_by_tag

Get all Unreal Engine systems that match a specific tag.

**Parameters:**
- `tag` (string, required): Tag to filter by (e.g., 'rendering', 'gameplay', 'animation', 'networking')

**Example:**
```json
{
  "tag": "gameplay"
}
```

#### get_related_ue_systems

Get systems related to a specific Unreal Engine system.

**Parameters:**
- `systemId` (string, required): System ID to find related systems for

**Example:**
```json
{
  "systemId": "gameplay-ability-system"
}
```

### Phase 3.1: Intelligent Code Generation Tools

#### generate_uclass

Generate a UClass following Unreal Engine conventions. Creates header and source files for a basic C++ class.

**Parameters:**
- `className` (string, required): Name of the class (e.g., 'AMyActor', 'UMyObject')
- `parentClass` (string, optional): Parent class (e.g., 'AActor', 'UObject'). Default: 'UObject'
- `module` (string, optional): Module name. Default: 'YourProject'
- `blueprintType` (boolean, optional): Whether this class can be used as a Blueprint type
- `blueprintable` (boolean, optional): Whether Blueprints can be derived from this class
- `abstract` (boolean, optional): Whether this is an abstract class
- `config` (string, optional): Config category (e.g., 'Game', 'Engine')

**Example:**
```json
{
  "className": "AMyCustomActor",
  "parentClass": "AActor",
  "module": "MyGame",
  "blueprintable": true,
  "blueprintType": true
}
```

#### generate_blueprint_compatible_class

Generate a Blueprint-compatible C++ class with properties and functions exposed to Blueprints.

**Parameters:**
- `className` (string, required): Name of the class
- `parentClass` (string, optional): Parent class. Default: 'UObject'
- `module` (string, optional): Module name. Default: 'YourProject'
- `properties` (array, optional): Properties to expose to Blueprints
- `functions` (array, optional): Functions to expose to Blueprints

**Example:**
```json
{
  "className": "UMyComponent",
  "parentClass": "UActorComponent",
  "module": "MyGame",
  "properties": [
    {
      "name": "Speed",
      "type": "float",
      "category": "Movement",
      "editAnywhere": true,
      "blueprintReadWrite": true,
      "defaultValue": "600.0f",
      "tooltip": "Movement speed"
    }
  ],
  "functions": [
    {
      "name": "GetSpeed",
      "returnType": "float",
      "category": "Movement",
      "blueprintPure": true,
      "isConst": true
    }
  ]
}
```

#### generate_game_mode

Generate a GameMode class following UE best practices.

**Parameters:**
- `className` (string, required): Name of the GameMode class (e.g., 'AMyGameMode')
- `module` (string, optional): Module name. Default: 'YourProject'

**Example:**
```json
{
  "className": "AMyGameMode",
  "module": "MyGame"
}
```

#### generate_character_class

Generate a Character class with health system and common functionality.

**Parameters:**
- `className` (string, required): Name of the Character class (e.g., 'AMyCharacter')
- `module` (string, optional): Module name. Default: 'YourProject'

**Example:**
```json
{
  "className": "AMyCharacter",
  "module": "MyGame"
}
```

#### generate_actor_component

Generate an ActorComponent class for reusable functionality.

**Parameters:**
- `className` (string, required): Name of the ActorComponent class (e.g., 'UMyComponent')
- `module` (string, optional): Module name. Default: 'YourProject'

**Example:**
```json
{
  "className": "UHealthComponent",
  "module": "MyGame"
}
```

#### generate_replication_code

Generate network replication code for properties and RPCs.

**Parameters:**
- `className` (string, required): Name of the class to add replication to
- `properties` (array, required): Properties to replicate
- `rpcs` (array, optional): Remote Procedure Calls to generate

**Example:**
```json
{
  "className": "AMyActor",
  "properties": [
    {
      "name": "Health",
      "type": "float",
      "replicationType": "Replicated"
    },
    {
      "name": "Score",
      "type": "int32",
      "replicationType": "ReplicatedUsing",
      "repNotifyFunction": "OnRep_Score"
    }
  ],
  "rpcs": [
    {
      "name": "ServerTakeDamage",
      "type": "Server",
      "reliable": true,
      "parameters": [
        { "name": "DamageAmount", "type": "float" }
      ]
    }
  ]
}
```

#### generate_data_asset

Generate a UDataAsset class for storing configuration data.

**Parameters:**
- `className` (string, required): Name of the DataAsset class (e.g., 'UMyDataAsset')
- `module` (string, optional): Module name. Default: 'YourProject'
- `properties` (array, required): Properties for the data asset

**Example:**
```json
{
  "className": "UWeaponDataAsset",
  "module": "MyGame",
  "properties": [
    {
      "name": "WeaponName",
      "type": "FString",
      "category": "Weapon",
      "editAnywhere": true,
      "tooltip": "Display name of the weapon"
    },
    {
      "name": "Damage",
      "type": "float",
      "category": "Stats",
      "editAnywhere": true,
      "defaultValue": "10.0f",
      "tooltip": "Base damage"
    }
  ]
}
```

#### generate_data_table

Generate a USTRUCT for use as a DataTable row structure.

**Parameters:**
- `structName` (string, required): Name of the struct (e.g., 'FMyTableRow')
- `module` (string, optional): Module name. Default: 'YourProject'
- `properties` (array, required): Properties for the data table row

**Example:**
```json
{
  "structName": "FWeaponTableRow",
  "module": "MyGame",
  "properties": [
    {
      "name": "WeaponID",
      "type": "int32",
      "editAnywhere": true,
      "tooltip": "Unique weapon identifier"
    },
    {
      "name": "WeaponName",
      "type": "FString",
      "editAnywhere": true,
      "tooltip": "Display name"
    },
    {
      "name": "Damage",
      "type": "float",
      "editAnywhere": true,
      "tooltip": "Base damage"
    }
  ]
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

### Actor & Component Management (Phase 2.3)

1. **List Actors in Level:**
   ```
   Read unreal://level/actors to get:
   - All actors in current level
   - Actor locations, rotations, scales
   - Component hierarchies
   ```

2. **Spawn New Actors:**
   ```
   Use spawn_actor with:
   - className: "AStaticMeshActor"
   - location: {x: 0, y: 0, z: 100}
   Creates a new static mesh actor at specified location
   ```

3. **Modify Actor Properties:**
   ```
   Use modify_actor_properties with:
   - actorPath: "/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0"
   - transform: {location: {x: 100, y: 200, z: 50}}
   Moves the actor to a new location
   ```

4. **Inspect Component Hierarchy:**
   ```
   Use get_actor_components with:
   - actorPath: "/Game/Maps/MainLevel.MainLevel:PersistentLevel.Actor_0"
   Returns tree structure of all components
   ```

5. **Work with Actor Templates:**
   ```
   # Save an actor as a template
   Use create_actor_template with:
   - actorPath: "/Game/Maps/MainLevel.MainLevel:PersistentLevel.MyActor"
   - templateName: "Lamp Post Standard"
   - category: "Environment"
   
   # List available templates
   Use list_actor_templates with:
   - category: "Environment"
   
   # Instantiate from template
   Use instantiate_template with:
   - templateId: "template_1234567890_abc123xyz"
   - location: {x: 500, y: 300, z: 0}
   ```

### UE5.6+ Knowledge Database

1. **Explore Available Systems:**
   ```
   Read unreal://knowledge/summary to get:
   - Total number of systems
   - Systems by version
   - All available tags
   ```

2. **Search for Specific Information:**
   ```
   Use query_ue_knowledge with:
   - query: "rendering"
   Returns all systems related to rendering (Lumen, Nanite, VSM)
   ```

3. **Get Detailed System Info:**
   ```
   Use get_ue_system with:
   - systemId: "gameplay-ability-system"
   Returns complete details including features, best practices, and references
   ```

4. **Find Systems by Category:**
   ```
   Use get_ue_systems_by_tag with:
   - tag: "networking"
   Returns all networking-related systems
   ```

5. **Discover Related Systems:**
   ```
   Use get_related_ue_systems with:
   - systemId: "animation-system"
   Returns related systems like gameplay-framework and metahuman-system
   ```

### Intelligent Code Generation (Phase 3.1)

1. **Generate a Basic Actor Class:**
   ```
   Use generate_uclass with:
   - className: "AMyPickupActor"
   - parentClass: "AActor"
   - module: "MyGame"
   - blueprintable: true
   - blueprintType: true
   Creates header and source files with proper UE conventions
   ```

2. **Generate a Blueprint-Compatible Component:**
   ```
   Use generate_blueprint_compatible_class with:
   - className: "UHealthComponent"
   - parentClass: "UActorComponent"
   - module: "MyGame"
   - properties: [
       { name: "MaxHealth", type: "float", category: "Health", 
         editAnywhere: true, blueprintReadWrite: true, defaultValue: "100.0f" },
       { name: "CurrentHealth", type: "float", category: "Health", 
         blueprintReadOnly: true }
     ]
   - functions: [
       { name: "TakeDamage", returnType: "void", 
         parameters: [{ name: "Amount", type: "float" }],
         category: "Health", blueprintCallable: true }
     ]
   Creates a fully Blueprint-integrated component
   ```

3. **Generate Common Pattern Classes:**
   ```
   # Generate a GameMode
   Use generate_game_mode with:
   - className: "AMyGameMode"
   - module: "MyGame"
   
   # Generate a Character with health system
   Use generate_character_class with:
   - className: "APlayerCharacter"
   - module: "MyGame"
   
   # Generate an ActorComponent
   Use generate_actor_component with:
   - className: "UInventoryComponent"
   - module: "MyGame"
   ```

4. **Add Network Replication:**
   ```
   Use generate_replication_code with:
   - className: "AMyActor"
   - properties: [
       { name: "Health", type: "float", replicationType: "Replicated" },
       { name: "Score", type: "int32", replicationType: "ReplicatedUsing",
         repNotifyFunction: "OnRep_Score" }
     ]
   - rpcs: [
       { name: "ServerDoAction", type: "Server", reliable: true,
         parameters: [{ name: "ActionID", type: "int32" }] }
     ]
   Generates GetLifetimeReplicatedProps and RPC implementations
   ```

5. **Create Data Assets:**
   ```
   Use generate_data_asset with:
   - className: "UWeaponDataAsset"
   - module: "MyGame"
   - properties: [
       { name: "WeaponName", type: "FString", category: "Weapon" },
       { name: "Damage", type: "float", category: "Stats", 
         defaultValue: "10.0f" },
       { name: "FireRate", type: "float", category: "Stats",
         defaultValue: "0.1f" }
     ]
   Creates a data asset class for configuration
   ```

6. **Generate Data Table Structures:**
   ```
   Use generate_data_table with:
   - structName: "FWeaponTableRow"
   - module: "MyGame"
   - properties: [
       { name: "WeaponID", type: "int32", tooltip: "Unique ID" },
       { name: "WeaponName", type: "FString", tooltip: "Display name" },
       { name: "Damage", type: "float", tooltip: "Base damage" },
       { name: "WeaponMesh", type: "TSoftObjectPtr<UStaticMesh>",
         tooltip: "3D mesh asset" }
     ]
   Creates a struct for use in Data Tables
   ```

## Data Storage

- **Project Information**: Stored in `game-project-data.json` in the package root directory. This file is automatically created when you first update project information.
- **Actor Templates**: Stored in `.adastrea/actor-templates.json` in the project root directory. This file is automatically created when you create your first actor template.

## GitHub Copilot Integration

Adastrea-MCP includes a pre-configured GitHub Copilot agent that can be deployed across all your Unreal Engine repositories for consistent, expert-level AI assistance.

### Features

- **Expert UE5.6+ Knowledge**: Comprehensive understanding of modern Unreal Engine systems
- **Epic Games Standards**: Enforces official coding conventions and best practices
- **MCP Tool Integration**: Automatically uses Adastrea-MCP tools for project analysis
- **Smart Context Awareness**: Understands C++, Blueprints, and their interactions
- **Multi-Repository Support**: Deploy once, use across all your Unreal projects

### Quick Start

#### Option 1: Single Repository

Copy the agent configuration to your Unreal project:

```bash
# From your Unreal project root
mkdir -p .github/agents
# Replace /path/to/your/Adastrea-MCP with actual path
cp /path/to/your/Adastrea-MCP/.github/agents/unreal-engine.md .github/agents/
```

#### Option 2: Organization-Wide (Recommended)

Deploy across all repositories in your organization:

1. Create or use your organization's `.github` repository
2. Copy agents to the `agents/` directory
3. All organization repositories automatically get access

See [.github/agents/README.md](.github/agents/README.md) for detailed deployment instructions and usage examples.

### Using the Agent

In your IDE with GitHub Copilot:

```
@unreal_engine Create a health component with replication
@unreal_engine How do I implement Lumen in my level?
@unreal_engine Optimize this actor for multiplayer
```

The agent will:
- Follow Epic Games coding standards
- Use MCP tools to understand your project
- Query the knowledge database for best practices
- Generate production-ready code
- Provide context-aware suggestions

### Example Workflows

**Creating Actor Classes:**
```
@unreal_engine I need a character with health, stamina, and sprint ability
```

**Blueprint Integration:**
```
@unreal_engine Make this C++ function callable from Blueprints
```

**Performance Optimization:**
```
@unreal_engine This actor is causing performance issues [paste code]
```

**System Implementation:**
```
@unreal_engine Implement a quest system with save/load support
```

For complete documentation, see [GitHub Copilot Agent Guide](.github/agents/README.md).

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

- **Phase 1:** ✅ Foundation Enhancement - Deep Unreal project understanding (COMPLETED)
- **Phase 2:** ✅ Deep UE Integration - Leveraging [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director) plugin for real-time editor interaction (COMPLETED: 2.1, 2.2, 2.3)
- **Phase 3:** 🔄 AI-Enhanced Tools - Intelligent code generation and refactoring (COMPLETED: 3.1, IN PROGRESS: 3.2, 3.3)
- **Phase 4:** 📋 Advanced Ecosystem - Multi-project support, marketplace integration (PLANNED)
- **Phase 5:** 📋 Intelligence & Automation - Semantic understanding and predictive assistance (PLANNED)

**🎉 Major Achievements:**
- ✅ 30+ MCP tools for comprehensive UE development
- ✅ 15+ MCP resources for project data access
- ✅ Live UE Editor integration via Adastrea-Director
- ✅ Complete Blueprint interaction system
- ✅ Actor spawning and template management
- ✅ Intelligent C++ code generation (8 tools)
- ✅ UE5.6+ Knowledge Database with 12+ systems
- ✅ GitHub Copilot Agent for multi-repo deployment

📋 **[View Full Roadmap](./ROADMAP.md)** for detailed plans, timelines, and contribution opportunities.

### Integration with Adastrea-Director

Adastrea-MCP works seamlessly with [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director), a comprehensive AI-powered development assistant that provides:
- **UE Editor Plugin** with dockable AI assistant panel (Weeks 1-6 complete)
- **Autonomous Agents (P3 Complete)** for performance profiling, bug detection, and code quality monitoring
- **UE Python API Integration** with 25+ tests for asset operations, actor management, and editor automation
- **Built-in MCP Server** with 84+ tests for AI agent access to Unreal Engine
- **RAG System** for intelligent documentation understanding
- **Planning Agents** for autonomous task decomposition and goal analysis
- **Python Backend** with LLM integration (Google Gemini, OpenAI)

**Complementary Roles:**
- **Adastrea-MCP**: Static analysis, code generation, UE5.6+ knowledge database (37 tools, 13 resources)
- **Adastrea-Director**: Runtime execution, autonomous monitoring, AI-assisted planning, live editor integration

Together, they form a complete AI-assisted game development ecosystem. Director's built-in MCP server handles runtime operations while Adastrea-MCP provides comprehensive static analysis and code scaffolding capabilities.

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, improving documentation, or testing with your Unreal Engine projects, your help is valuable. Check out our [ROADMAP.md](./ROADMAP.md) to see where you can contribute.

## License

MIT