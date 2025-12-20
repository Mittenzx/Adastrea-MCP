# Phase 2.1: Editor Communication Layer - User Guide

## Overview

Phase 2.1 introduces the **Editor Communication Layer**, enabling real-time integration with Unreal Engine Editor through the [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director) plugin. This integration provides live editor state access, remote command execution, and real-time asset management capabilities.

## Architecture

### Integration Pattern

```
AI Agent (Claude, VS Code Copilot, etc.)
    ↓
Adastrea-MCP Server (Node.js)
    ├─→ Static Analysis (always available)
    │   ├── Project structure parsing
    │   ├── C++ code analysis
    │   └── Asset cataloging
    └─→ EditorBridge
         └─→ DirectorClient
              └─→ Adastrea-Director MCP Server (Python)
                   └─→ UE Editor Plugin (C++)
                        └─→ Unreal Engine (running)
```

### Component Responsibilities

**Adastrea-MCP** (this project):
- Static analysis (works without UE running)
- Project metadata and documentation
- Cross-project capabilities
- Local caching and fallback

**Adastrea-Director**:
- Live UE Editor integration
- Real-time asset and actor manipulation
- Python code execution in UE
- Console command execution

### Graceful Degradation

The EditorBridge automatically falls back to local static analysis when:
- Adastrea-Director is not running
- UE Editor is not open
- Network connection fails

This ensures the MCP server remains functional even without live editor access.

## Configuration

### Environment Variables

Set the Director connection URL via environment variable:

```bash
export DIRECTOR_URL=http://localhost:3001
```

Default: `http://localhost:3001`

### Bridge Configuration

The EditorBridge is configured in `src/index.ts`:

```typescript
const editorBridge = new EditorBridge({
  enableDirector: true,              // Enable Director integration
  fallbackToLocal: true,              // Fall back to local analysis
  directorConfig: {
    baseUrl: 'http://localhost:3001', // Director MCP server URL
    timeout: 10000,                    // Request timeout (ms)
    autoReconnect: true,               // Auto-reconnect on disconnect
    healthCheckInterval: 30000,        // Health check interval (ms)
  },
});
```

## New Resources

### `unreal://editor/state`

**Description:** Current state of the Unreal Engine Editor  
**Availability:** Requires Adastrea-Director connection  
**Format:** JSON

**Example Response:**
```json
{
  "isRunning": true,
  "currentLevel": "/Game/Maps/MainLevel",
  "selectedActors": [
    "/Game/Maps/MainLevel.MainLevel:PersistentLevel.PlayerStart_0"
  ],
  "editingContext": {
    "mode": "LevelEditor"
  },
  "viewport": {
    "cameraLocation": [1000.0, 2000.0, 500.0],
    "cameraRotation": [0.0, 45.0, 0.0],
    "viewMode": "Lit"
  }
}
```

### `unreal://editor/capabilities`

**Description:** Available capabilities based on Director connection status  
**Availability:** Always available  
**Format:** JSON

**Example Response:**
```json
{
  "hasDirector": true,
  "hasLocalAnalysis": true,
  "canExecuteCommands": true,
  "canExecutePython": true,
  "canGetLiveAssets": true
}
```

## New Tools

### `execute_console_command`

Execute a console command in the running Unreal Engine Editor.

**Requirements:** Adastrea-Director must be running and connected to UE Editor

**Parameters:**
- `command` (string, required): Console command to execute

**Examples:**
```json
{
  "command": "stat fps"
}
```

```json
{
  "command": "ke * list"
}
```

**Response:**
```json
{
  "command": "stat fps",
  "output": "FPS display enabled",
  "success": true,
  "executionTime": 45
}
```

### `run_python_script`

Execute Python code in the Unreal Engine Editor using the embedded Python interpreter.

**Requirements:** Adastrea-Director must be running and connected to UE Editor

**Parameters:**
- `code` (string, required): Python code to execute

**Example:**
```json
{
  "code": "import unreal\nprint(unreal.SystemLibrary.get_project_directory())"
}
```

**Response:**
```json
{
  "code": "import unreal\nprint(unreal.SystemLibrary.get_project_directory())",
  "output": "C:/Projects/MyGame/",
  "success": true,
  "executionTime": 120
}
```

### `get_live_project_info`

Get live project information from the running Unreal Engine Editor. Prefers live data from Director over cached local data.

**Requirements:** Optional - falls back to local analysis

**Parameters:** None

**Response:**
```json
{
  "projectName": "MyGame",
  "projectPath": "C:/Projects/MyGame",
  "engineVersion": "5.6",
  "isLoaded": true
}
```

### `list_assets_live`

List assets from the running Unreal Engine Editor in real-time. Prefers live data from Director over cached local data.

**Requirements:** Optional - falls back to local analysis

**Parameters:**
- `filter` (string, optional): Filter string to search for specific assets

**Example:**
```json
{
  "filter": "Material"
}
```

**Response:**
```json
[
  {
    "assetName": "M_BaseColor",
    "assetPath": "/Game/Materials/M_BaseColor",
    "assetClass": "Material",
    "assetType": "Material",
    "packageName": "M_BaseColor"
  },
  {
    "assetName": "M_Glass",
    "assetPath": "/Game/Materials/M_Glass",
    "assetClass": "Material",
    "assetType": "Material",
    "packageName": "M_Glass"
  }
]
```

## Usage Workflows

### Workflow 1: Static Analysis + Live Editing

**Scenario:** Analyze project structure, then execute commands in editor

```
1. Use scan_unreal_project to analyze project structure locally
2. Use search_code to find specific classes
3. Use execute_console_command to open relevant asset in editor
4. Use run_python_script to manipulate the asset
5. Use get_live_project_info to verify changes
```

### Workflow 2: Asset Discovery and Manipulation

**Scenario:** Find assets and modify them in editor

```
1. Use list_assets_live with filter to find assets
2. Use run_python_script to load and modify asset properties
3. Use execute_console_command to save changes
4. Use search_assets to verify changes in local cache
```

### Workflow 3: Editor Automation

**Scenario:** Automate repetitive editor tasks

```
1. Check unreal://editor/capabilities to verify Director is available
2. Read unreal://editor/state to get current editor context
3. Use run_python_script to execute automation script
4. Use execute_console_command to trigger builds or tests
5. Read unreal://editor/state again to verify results
```

## Error Handling

### Director Not Available

When Director is not running or not connected:

```
Error: Console commands require Adastrea-Director to be running and connected
```

**Solution:** 
1. Start Adastrea-Director plugin in UE Editor
2. Verify Director MCP server is running
3. Check DIRECTOR_URL environment variable

### Fallback Behavior

Tools that support fallback will automatically use local cached data:
- `get_live_project_info` → falls back to local .uproject data
- `list_assets_live` → falls back to local asset scan

Tools that require Director will throw an error:
- `execute_console_command` → requires Director
- `run_python_script` → requires Director

## Integration with Adastrea-Director

### Prerequisites

1. Clone and install [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director)
2. Install the UE plugin in your project
3. Start the Director MCP server
4. Open your Unreal project in UE Editor

### Verifying Connection

Check connection status:

1. Read `unreal://editor/capabilities` resource
2. Look for `"hasDirector": true`
3. If false, check Director server logs

### Available Director Tools

Through Adastrea-Director, you also gain access to:
- `project-info` - Live project information
- `list-assets` - Real-time asset registry
- `console` - Console command execution
- `run-python` - Python script execution
- RAG-based documentation search
- Planning agents for task decomposition

## Troubleshooting

### Connection Issues

**Problem:** Director shows as disconnected

**Solutions:**
1. Verify Director MCP server is running on port 3001
2. Check firewall settings
3. Verify DIRECTOR_URL is correct
4. Check Director server logs for errors

### Command Execution Failures

**Problem:** Console commands fail to execute

**Solutions:**
1. Verify UE Editor is open and project is loaded
2. Check command syntax (UE console commands are case-sensitive)
3. Verify Director plugin is enabled in UE
4. Check UE Editor output log for errors

### Python Execution Failures

**Problem:** Python scripts fail to execute

**Solutions:**
1. Verify Python is enabled in UE Editor
2. Check Python script syntax
3. Verify required modules are available
4. Check UE Editor Python log for errors

## Performance Considerations

### Health Checks

- Health checks run every 30 seconds by default
- Minimal performance impact
- Can be adjusted via `healthCheckInterval`

### Request Timeouts

- Default timeout: 10 seconds
- Long-running Python scripts may need longer timeout
- Adjust via `timeout` configuration

### Caching

- Local analysis results are cached
- Live data is fetched on each request
- Balance between freshness and performance

## Security Considerations

### Remote Execution

- Console commands have full UE Editor permissions
- Python scripts have full Python interpreter access
- Only connect to trusted Director instances
- Use firewall rules to restrict Director access

### Network Security

- Director uses HTTP by default (not encrypted)
- Consider using SSH tunneling for remote access
- Restrict Director port (3001) to localhost in production

## Future Enhancements

### Planned for Phase 2.2-2.3

- Blueprint node manipulation
- Actor spawning and modification
- Level management
- Asset import/export automation
- Build and packaging automation
- Test execution and reporting

## Changelog

### Version 1.1.0 (Phase 2.1 - December 2025)

- ✅ Added DirectorClient for communication with Adastrea-Director
- ✅ Implemented EditorBridge with graceful degradation
- ✅ Added 2 new MCP resources for editor state
- ✅ Added 4 new MCP tools for editor control
- ✅ Integrated with existing scan_unreal_project workflow
- ✅ Comprehensive error handling and fallback logic

## Support

For issues related to:
- **Adastrea-MCP**: Open issue on [Adastrea-MCP GitHub](https://github.com/Mittenzx/Adastrea-MCP)
- **Adastrea-Director**: Open issue on [Adastrea-Director GitHub](https://github.com/Mittenzx/Adastrea-Director)
- **Integration**: Check both repositories for similar issues

## References

- [Adastrea-Director Plugin](https://github.com/Mittenzx/Adastrea-Director)
- [Adastrea-MCP Roadmap](./ROADMAP.md)
- [Phase 1 Completion Summary](./PHASE1_COMPLETION_SUMMARY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
