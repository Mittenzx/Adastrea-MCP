# VibeUE Integration Guide

**Integrating Adastrea-MCP with VibeUE for Enhanced Unreal Engine Development**

## Overview

[VibeUE](https://github.com/kevinpbuckley/VibeUE) is an AI-powered Unreal Engine plugin that brings AI directly into the editor with 27 built-in tools for Blueprint lifecycle management, UMG widgets, materials, and assets. Adastrea-MCP complements VibeUE by providing:

- **Static Analysis**: Parse .uproject files, analyze C++ code, scan assets offline
- **Code Generation**: Generate UClasses, GameModes, Characters, replication code, data assets
- **UE5.6+ Knowledge Database**: Query best practices, system information, related systems
- **Project Intelligence**: Deep project structure understanding and validation

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Unreal Engine 5.7+ Editor                                   │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ VibeUE Plugin (In-Editor AI Chat)                     │  │
│  │ • 27 Built-in Tools                                   │  │
│  │ • Blueprint Management                                │  │
│  │ • UMG Widget Creation                                 │  │
│  │ • Material Control                                    │  │
│  │ • Actor Manipulation                                  │  │
│  │ • Python Execution                                    │  │
│  │                                                        │  │
│  │ External MCP Servers (vibeue.mcp.json):               │  │
│  │ ├─── Adastrea-MCP ✨                                  │  │
│  │ │    • Static analysis                                │  │
│  │ │    • Code generation                                │  │
│  │ │    • UE knowledge                                   │  │
│  │ │                                                      │  │
│  │ └─── Adastrea-Director (optional)                     │  │
│  │      • Autonomous agents                              │  │
│  │      • Performance monitoring                         │  │
│  │      • RAG system                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Install VibeUE

Follow the [VibeUE installation guide](https://github.com/kevinpbuckley/VibeUE):

```bash
cd /path/to/YourUnrealProject/Plugins
git clone https://github.com/kevinpbuckley/VibeUE.git
# Run BuildPlugin.bat (Windows) or build manually
# Enable plugin in Unreal Editor (Edit > Plugins)
```

### 2. Install Adastrea-MCP

```bash
cd /path/to/Adastrea-MCP
npm install
npm run build
```

### 3. Configure VibeUE to Use Adastrea-MCP

Edit `Plugins/VibeUE/Config/vibeue.mcp.json`:

```json
{
  "servers": {
    "adastrea-mcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/absolute/path/to/Adastrea-MCP/build/index.js"
      ],
      "cwd": "/absolute/path/to/Adastrea-MCP",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Important**: Use absolute paths for both `args` and `cwd`.

### 4. Restart Unreal Editor

After modifying `vibeue.mcp.json`, restart Unreal Editor for changes to take effect.

### 5. Verify Integration

1. Open **Window > VibeUE > AI Chat**
2. Click the **Tool Manager** button
3. You should see Adastrea-MCP tools listed alongside VibeUE's built-in tools
4. Try a test command: "Use Adastrea-MCP to scan my unreal project"

## When to Use Which Tool

### VibeUE Tools (Real-time Editor Manipulation)

Use VibeUE's built-in tools for:
- Creating/modifying Blueprints in real-time
- Designing UMG widgets and styling
- Managing materials and material instances
- Spawning/modifying actors in the level
- Executing Python scripts in the editor
- Filesystem operations

**Example Commands**:
- "Create a new Actor Blueprint called BP_EnemySpawner"
- "Add a button to my main menu widget and style it blue"
- "List all actors in the current level"
- "Create a material instance based on M_Master"

### Adastrea-MCP Tools (Static Analysis & Code Generation)

Use Adastrea-MCP tools for:
- Parsing .uproject files and project structure
- Analyzing C++ code (classes, functions, inheritance)
- Generating C++ code following UE conventions
- Querying UE5.6+ knowledge and best practices
- Offline project validation
- Code scaffolding and templates

**Example Commands**:
- "Use Adastrea-MCP to scan my project and list all C++ classes"
- "Generate a replicated Actor class with health and damage properties"
- "What are the best practices for Lumen in UE5.6?"
- "Create a GameMode class with proper setup"
- "Analyze the inheritance hierarchy of AMyCharacter"

## Powerful Workflows

### Workflow 1: Create and Test New Actor

**Scenario**: Create a new enemy actor with health system

1. **Generate C++ Class** (Adastrea-MCP):
   ```
   "Use Adastrea-MCP to generate a character class called AEnemyCharacter 
    with health component"
   ```

2. **Compile in Editor** (Manual or VibeUE Python):
   ```
   "Compile the project"
   ```

3. **Create Blueprint** (VibeUE):
   ```
   "Create a Blueprint based on AEnemyCharacter called BP_Enemy_Grunt"
   ```

4. **Spawn Instance** (VibeUE):
   ```
   "Spawn BP_Enemy_Grunt at location 0,0,100"
   ```

### Workflow 2: UI Development with Best Practices

**Scenario**: Create main menu following UE best practices

1. **Query Best Practices** (Adastrea-MCP):
   ```
   "What are UMG best practices for main menus in UE5.6?"
   ```

2. **Create Widget** (VibeUE):
   ```
   "Create a UMG widget called WBP_MainMenu with buttons for 
    New Game, Load Game, Settings, and Quit"
   ```

3. **Style Widget** (VibeUE):
   ```
   "Style the main menu with a dark theme, blue accents, 
    and proper spacing"
   ```

4. **Generate Controller Code** (Adastrea-MCP):
   ```
   "Generate a PlayerController class that manages the main menu"
   ```

### Workflow 3: Network Replication Setup

**Scenario**: Add multiplayer support to existing actor

1. **Generate Replication Code** (Adastrea-MCP):
   ```
   "Generate replication code for AMyActor with replicated Health 
    property and Server_TakeDamage RPC"
   ```

2. **Update Blueprint** (VibeUE):
   ```
   "Open BP_MyActor and update it to use the new replication properties"
   ```

3. **Test in PIE** (VibeUE):
   ```
   "Start a PIE session with 2 clients to test replication"
   ```

### Workflow 4: Performance Analysis and Optimization

**Scenario**: Analyze project and optimize rendering

1. **Scan Project** (Adastrea-MCP):
   ```
   "Scan the project and identify all materials and textures"
   ```

2. **Query Optimization** (Adastrea-MCP):
   ```
   "What are Nanite and Lumen optimization techniques for UE5.6?"
   ```

3. **Apply Material Changes** (VibeUE):
   ```
   "Update all landscape materials to use Nanite-compatible settings"
   ```

4. **Test Performance** (VibeUE Python):
   ```
   "Run stat fps and stat unit commands"
   ```

### Workflow 5: Asset Management and Organization

**Scenario**: Reorganize project assets following conventions

1. **Analyze Current Structure** (Adastrea-MCP):
   ```
   "Analyze my project's asset structure and identify organization issues"
   ```

2. **Get Recommendations** (Adastrea-MCP):
   ```
   "What are Epic's recommended folder structures for UE5 projects?"
   ```

3. **Move Assets** (VibeUE):
   ```
   "Move all character blueprints to /Content/Characters/Blueprints/"
   ```

4. **Validate Changes** (Adastrea-MCP):
   ```
   "Validate the project structure and check for broken references"
   ```

## Complementary Capabilities

### Adastrea-MCP Strengths

✅ **Offline Operation**: Works without UE Editor running  
✅ **Deep C++ Analysis**: Parse classes, functions, macros, inheritance  
✅ **Code Generation**: 8 specialized generators following UE conventions  
✅ **Knowledge Database**: 12+ UE5.6+ systems with best practices  
✅ **Project Validation**: Automated structure and configuration checks  
✅ **Fast Static Analysis**: Quick parsing and searching  

### VibeUE Strengths

✅ **In-Editor Integration**: Native UE plugin, no external setup  
✅ **Real-time Manipulation**: Create/modify Blueprints instantly  
✅ **Visual Workflows**: UMG widget creation and styling  
✅ **Material Management**: Material instances and parameters  
✅ **Actor Control**: Spawn, modify, query level actors  
✅ **Python Integration**: Execute Python scripts in UE  
✅ **27 Built-in Tools**: Comprehensive editor automation  

### Combined Power

When used together:
- **Design Phase**: Use Adastrea-MCP for architecture, code generation, best practices
- **Implementation**: Use VibeUE for rapid prototyping, Blueprint creation, UI design
- **Iteration**: Combine both for quick changes and testing
- **Optimization**: Use Adastrea-MCP for analysis, VibeUE for implementation

## Advanced Configuration

### Triple MCP Setup (Maximum Power)

For the ultimate UE development environment, connect all three:

```json
{
  "servers": {
    "adastrea-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/Adastrea-MCP/build/index.js"]
    },
    "adastrea-director": {
      "type": "stdio",
      "command": "python",
      "args": ["/path/to/Adastrea-Director/mcp_server/server.py"]
    }
  }
}
```

**Capabilities**:
- **VibeUE**: Real-time editor control (27 tools)
- **Adastrea-MCP**: Static analysis, code generation, UE knowledge (37 tools)
- **Adastrea-Director**: Autonomous monitoring, RAG system, AI planning (84+ tests)

### Custom Instructions for VibeUE

Add project-specific context to help VibeUE's AI understand your conventions:

Create `Plugins/VibeUE/Config/Instructions/adastrea-conventions.md`:

```markdown
# Adastrea Project Conventions

## Use Adastrea-MCP for:
- All C++ code generation
- Project structure analysis
- UE5.6+ knowledge queries
- Build configuration validation

## Naming Conventions
- Actor Blueprints: BP_<Category>_<Name>
- Widgets: WBP_<Name>
- Materials: M_<Surface>_<Variant>

## Architecture
- All gameplay actors inherit from AAdastreaActor
- UI follows MVVM pattern with UMG
- Network replication uses Epic's best practices
```

### Environment Variables

Configure Adastrea-MCP behavior via environment in `vibeue.mcp.json`:

```json
{
  "servers": {
    "adastrea-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/Adastrea-MCP/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "DIRECTOR_URL": "http://localhost:3001"
      }
    }
  }
}
```

## Troubleshooting

### Issue: Adastrea-MCP tools not appearing

**Solution 1**: Check absolute paths in `vibeue.mcp.json`
```bash
# Wrong
"args": ["./build/index.js"]

# Correct
"args": ["C:/Projects/Adastrea-MCP/build/index.js"]
```

**Solution 2**: Verify Adastrea-MCP builds successfully
```bash
cd /path/to/Adastrea-MCP
npm run build
# Should complete without errors
```

**Solution 3**: Restart Unreal Editor after config changes

### Issue: Tools timeout or fail to respond

**Possible causes**:
- Node.js not in PATH
- Adastrea-MCP not built
- Permissions issues

**Solution**: Test manually first:
```bash
node /path/to/Adastrea-MCP/build/index.js
# Should start MCP server
```

### Issue: Conflicting tool names

Both VibeUE and Adastrea-MCP use distinct prefixes:
- **VibeUE**: `manage_*`, `execute_*`, `search_*`
- **Adastrea-MCP**: `scan_unreal_project`, `generate_*`, `query_ue_knowledge`

No naming conflicts should occur.

### Issue: High memory usage

Each MCP server runs as a separate process:
- **VibeUE**: Built into UE Editor
- **Adastrea-MCP**: ~50-100MB (Node.js)
- **Adastrea-Director**: ~200-500MB (Python, optional)

This is expected for running multiple AI-powered tools.

## Performance Tips

### 1. Use Appropriate Tools

- **Fast Operations**: Use VibeUE (in-process, immediate)
- **Analysis Operations**: Use Adastrea-MCP (external, but comprehensive)

### 2. Cache Project Scans

Adastrea-MCP caches project scans. After first scan:
```
"Scan my project"  # First time: 5-10 seconds
"Search for classes" # Subsequent: <1 second (uses cache)
```

### 3. Selective Tool Loading

In VibeUE's Tool Manager, disable tools you don't need to reduce context size for AI.

### 4. Batch Operations

Group related operations:
```
"Use Adastrea-MCP to:
1. Generate APlayerCharacter class
2. Generate AGameMode class  
3. Generate UHealthComponent class"
```

## Best Practices

### 1. Start with Analysis

Before making changes, understand current state:
```
"Use Adastrea-MCP to scan my project and show me all Actor classes"
```

### 2. Query Before Implementing

Leverage UE knowledge:
```
"What's the best way to implement inventory systems in UE5.6?"
# Then use VibeUE to implement
```

### 3. Generate Then Customize

Use Adastrea-MCP for scaffolding, VibeUE for customization:
```
# 1. Generate base class (Adastrea-MCP)
"Generate a data asset class for weapon stats"

# 2. Create instances (VibeUE)  
"Create 5 weapon data assets with different stats"
```

### 4. Validate Regularly

Use both tools for validation:
```
# Adastrea-MCP: Static validation
"Validate my project structure"

# VibeUE: Runtime validation
"Check for compilation errors"
```

### 5. Document Conventions

Add your conventions to VibeUE's Instructions folder so AI understands project-specific patterns.

## Example Session

Here's a complete session showing both tools working together:

```
User: I want to create a new enemy type with health and AI

AI (using Adastrea-MCP): Let me generate the C++ foundation...
[Generates AEnemyBase with health component using generate_character_class]

AI (using Adastrea-MCP): Here are the UE5.6 best practices for AI...
[Queries behavior tree and perception system knowledge]

AI (using VibeUE): Now I'll create the Blueprint...
[Creates BP_Enemy_Grunt inheriting from AEnemyBase]

AI (using VibeUE): Adding behavior tree...
[Creates and configures BT_Enemy with patrol and attack tasks]

AI (using VibeUE): Spawning test instance...
[Spawns enemy in current level for testing]

AI: Enemy created! It has:
- C++ health system (from Adastrea-MCP)
- Blueprint AI logic (from VibeUE)
- Configured behavior tree (from VibeUE)
- Ready to test in PIE
```

## Further Reading

- **VibeUE Documentation**: [GitHub](https://github.com/kevinpbuckley/VibeUE) | [Website](https://vibeue.com)
- **Adastrea-MCP Documentation**: [README.md](./README.md) | [DUAL_SERVER_GUIDE.md](./DUAL_SERVER_GUIDE.md)
- **Adastrea-Director**: [GitHub](https://github.com/Mittenzx/Adastrea-Director) | [Wiki](https://github.com/Mittenzx/Adastrea-Director/wiki)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## Support

For issues or questions:
- **VibeUE**: [GitHub Issues](https://github.com/kevinpbuckley/VibeUE/issues)
- **Adastrea-MCP**: [GitHub Issues](https://github.com/Mittenzx/Adastrea-MCP/issues)
- **MCP Protocol**: [Discord](https://discord.gg/mcp) | [GitHub](https://github.com/modelcontextprotocol)

---

**Last Updated**: January 14, 2026  
**VibeUE Version**: 1.0+ (UE 5.7+)  
**Adastrea-MCP Version**: 1.0.0  
**Status**: Production Ready
