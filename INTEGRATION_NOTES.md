# Adastrea-Director Integration Notes

This document provides implementation notes for integrating Adastrea-MCP with Adastrea-Director.

## Current Status

**Phase 2.1 Implementation**: ✅ Complete (Infrastructure layer)

The Editor Communication Layer has been fully implemented with:
- DirectorClient class for HTTP communication
- EditorBridge for coordinating local and remote operations
- 4 new MCP tools for live editor interaction
- 2 new MCP resources for editor state
- Graceful degradation and fallback logic
- Comprehensive documentation and testing

**Adastrea-Director Current State** (as of January 2026):
- ✅ **P3 Complete**: Autonomous agents for performance profiling, bug detection, and code quality monitoring
- ✅ **Built-in MCP Server**: 84+ tests, provides AI agent access to Unreal Engine (unreal_mcp_cli.py)
- ✅ **UE Python API Integration**: 25+ tests for asset operations, actor management, editor automation
- ✅ **Plugin Mode**: Weeks 1-6 complete (basic UI + RAG integration)
- 🚀 **In Progress**: Plugin Weeks 7-16 (Planning agent integration and UI/UX improvements)

## Architecture Overview

```
MCP Client (Claude, VS Code, 5ire, Cline)
    ↓
Adastrea-MCP Server (Node.js) [THIS PROJECT]
    ├── Static Analysis (always available)
    │   ├── .uproject parsing, C++ analysis
    │   ├── Blueprint metadata extraction
    │   ├── Code generation (8 tools)
    │   └── UE5.6+ knowledge database
    │
    └── EditorBridge [IMPLEMENTED]
         └── DirectorClient [AVAILABLE FOR INTEGRATION]
              ↓ 
              Integration Options:
              
              Option 1: Via Adastrea-Director MCP Server (Recommended)
              ↓ MCP Protocol
              Adastrea-Director MCP Server (Python)
                   ├── UE Python API (unreal module)
                   ├── Asset operations
                   ├── Actor operations
                   ├── Console commands
                   └── Editor automation
                        ↓
                        Unreal Engine Editor
              
              Option 2: Via Director's Python Backend (If REST API is added)
              ↓ HTTP/REST
              Adastrea-Director Python Backend
                   ↓ IPC
                   UE C++ Plugin
                        ↓
                        Unreal Engine Editor
```

## Integration Approaches

### Recommended: MCP-to-MCP Integration

Since Adastrea-Director now has its own MCP server, the cleanest integration is **MCP-to-MCP**:

1. **Client Configuration**: Configure MCP client to use both servers
   ```json
   {
     "mcpServers": {
       "adastrea-mcp": {
         "command": "node",
         "args": ["/path/to/Adastrea-MCP/build/index.js"]
       },
       "adastrea-director": {
         "command": "python",
         "args": ["/path/to/Adastrea-Director/mcp_server/server.py"]
       }
     }
   }
   ```

2. **Benefits**:
   - No HTTP layer needed
   - Both servers work independently
   - Clear separation of concerns
   - Adastrea-MCP: Static analysis, code generation, knowledge
   - Adastrea-Director: Runtime execution, autonomous agents, live editor

3. **Use Cases**:
   - Use Adastrea-MCP tools for code scaffolding and project analysis
   - Use Adastrea-Director tools for live editor manipulation and monitoring

### Alternative: REST API Integration

If Adastrea-Director adds REST endpoints in the future, the existing DirectorClient can be activated:

### REST API Integration (If Director Adds HTTP Endpoints)

**File**: `src/director/client.ts`

Replace the placeholder `request()` method with actual HTTP client:

```typescript
private async request<T>(
  endpoint: string,
  options?: {
    method?: string;
    body?: any;
  }
): Promise<DirectorResponse<T>> {
  const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
    method: options?.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(this.config.timeout),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
```

### 2. Implement Health Check Endpoint (REST API Option)

**File**: `src/director/client.ts`

Replace placeholder in `checkHealth()` method:

```typescript
async checkHealth(): Promise<DirectorHealthStatus> {
  try {
    const response = await fetch(`${this.config.baseUrl}/health`, {
      signal: AbortSignal.timeout(this.config.timeout),
    });
    
    const data = await response.json();
    
    return {
      status: response.ok ? 'connected' : 'error',
      editorConnected: data.editorConnected,
      lastHeartbeat: new Date(),
      version: data.version,
      capabilities: data.capabilities,
    };
  } catch (error) {
    return {
      status: 'error',
      editorConnected: false,
      lastHeartbeat: this.lastHeartbeat,
    };
  }
}
```

### 3. Required REST Endpoints (If Director Implements HTTP API)

The following REST endpoints would need to be implemented in Adastrea-Director if REST integration is desired:

**Note**: This is optional as Director already provides an MCP server for runtime operations.

#### Health Check
- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "editorConnected": true,
    "version": "1.0.0",
    "capabilities": ["console", "python", "assets"]
  }
  ```

#### Editor State
- **Endpoint**: `GET /api/editor/state`
- **Response**:
  ```json
  {
    "isRunning": true,
    "currentLevel": "/Game/Maps/MainLevel",
    "selectedActors": ["..."],
    "editingContext": { "mode": "LevelEditor" },
    "viewport": { ... }
  }
  ```

#### Project Info
- **Endpoint**: `GET /api/project/info`
- **Response**:
  ```json
  {
    "projectName": "MyGame",
    "projectPath": "C:/Projects/MyGame",
    "engineVersion": "5.6",
    "isLoaded": true
  }
  ```

#### List Assets
- **Endpoint**: `POST /api/assets/list`
- **Request Body**:
  ```json
  {
    "filter": "Material"
  }
  ```
- **Response**:
  ```json
  [
    {
      "assetName": "M_Base",
      "assetPath": "/Game/Materials/M_Base",
      "assetClass": "Material",
      "assetType": "Material",
      "packageName": "M_Base"
    }
  ]
  ```

#### Console Command
- **Endpoint**: `POST /api/console/execute`
- **Request Body**:
  ```json
  {
    "command": "stat fps"
  }
  ```
- **Response**:
  ```json
  {
    "command": "stat fps",
    "output": "FPS display enabled",
    "success": true,
    "executionTime": 45
  }
  ```

#### Python Execution
- **Endpoint**: `POST /api/python/execute`
- **Request Body**:
  ```json
  {
    "code": "import unreal\nprint('Hello')"
  }
  ```
- **Response**:
  ```json
  {
    "code": "import unreal\nprint('Hello')",
    "output": "Hello",
    "error": null,
    "success": true,
    "executionTime": 120
  }
  ```

### 4. Testing Integration

**For MCP-to-MCP Integration** (Recommended):

1. **Configure Both Servers**:
   - Add both servers to your MCP client configuration
   - Start Adastrea-Director: `python /path/to/Adastrea-Director/mcp_server/server.py`
   - Start Adastrea-MCP: `node /path/to/Adastrea-MCP/build/index.js`

2. **Test Static Analysis** (via Adastrea-MCP):
   ```bash
   # Use Adastrea-MCP tools
   scan_unreal_project
   generate_uclass
   query_ue_knowledge
   ```

3. **Test Runtime Operations** (via Adastrea-Director):
   ```bash
   # Use Director's MCP tools (see Director's MCP_SERVER_GUIDE.md)
   unreal_execute_python
   unreal_list_assets
   unreal_create_actor
   ```

**For REST API Integration** (if implemented):

1. **Update Configuration**:
   ```bash
   export DIRECTOR_URL=http://localhost:3001
   ```

2. **Start Services**:
   - Start Adastrea-Director with REST API
   - Open UE project with Director plugin
   - Start Adastrea-MCP server

3. **Verify Connection**:
   ```bash
   # Read capabilities resource
   # Should show hasDirector: true
   ```

4. **Test Tools**:
   ```bash
   # Try execute_console_command
   # Try run_python_script
   # Try list_assets_live
   ```

### 5. Dependencies

Add fetch polyfill if targeting older Node.js versions:

```bash
npm install node-fetch
```

Or require Node.js 18+ which has native fetch support.

### 6. Error Handling

The current implementation handles these error cases:
- Director not running: Falls back to local analysis
- Connection timeout: Returns error after configured timeout
- Invalid response: Returns error with message
- Network error: Automatic reconnection attempt

### 7. Configuration Options

Current configuration is in `src/index.ts`:

```typescript
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
```

Adjust these values based on Director's actual requirements.

## Architecture Overview

```
MCP Client (Claude, VS Code)
    ↓
Adastrea-MCP Server (Node.js) [THIS PROJECT]
    ├── Static Analysis (always available)
    │   └── Local file system scanning
    │
    └── EditorBridge [IMPLEMENTED]
         └── DirectorClient [NEEDS REST ENDPOINTS]
              ↓ HTTP/REST
              Adastrea-Director MCP Server (Python)
                   ↓ IPC
                   UE C++ Plugin
                        ↓
                        Unreal Engine Editor
```

## Implementation Checklist

### Completed ✅
- [x] Type definitions for Director integration
- [x] DirectorClient class structure
- [x] EditorBridge coordination logic
- [x] Graceful degradation and fallback
- [x] Error handling and reconnection
- [x] MCP resource handlers
- [x] MCP tool handlers
- [x] Documentation
- [x] Integration testing
- [x] Security scanning

### Current Integration Status ✅
- [x] **Director MCP Server Available**: Adastrea-Director now has built-in MCP server (84+ tests)
- [x] **UE Python API Integration**: Director provides direct Unreal Engine access
- [x] **Autonomous Agents**: P3 complete with performance, bug detection, code quality monitoring
- [x] **Recommended Approach**: MCP-to-MCP integration (both servers running independently)

### Optional - REST API Integration ⏳
If Adastrea-Director adds REST endpoints:
- [ ] Implement actual HTTP client in DirectorClient
- [ ] Implement health check endpoint call
- [ ] Test with live REST API server
- [ ] Verify all tool operations work end-to-end
- [ ] Performance testing under load
- [ ] Update documentation with real examples

## Benefits of Current Implementation

The current implementation provides flexibility for multiple integration approaches:

1. **MCP-to-MCP Integration** (Recommended):
   - Both servers run independently
   - Clean separation of concerns
   - No HTTP layer needed
   - Use Director's MCP server for runtime operations
   - Use Adastrea-MCP for static analysis and code generation

2. **Infrastructure Ready for REST** (If Needed):
   - All classes and logic are in place
   - Type safety with full TypeScript typing
   - Clear contracts through interface definitions
   - Graceful degradation when Director unavailable
   - Easy to activate REST client if endpoints added

3. **Testability**: Can be tested independently
4. **Graceful Degradation**: System works fully in offline mode with local analysis

## Recommended Setup

**For Most Users:**
```json
{
  "mcpServers": {
    "adastrea": {
      "command": "node",
      "args": ["/path/to/Adastrea-MCP/build/index.js"]
    },
    "adastrea-director": {
      "command": "python",
      "args": ["/path/to/Adastrea-Director/mcp_server/server.py"]
    }
  }
}
```

**When to Use Each Server:**
- **Adastrea-MCP**: Project analysis, code scaffolding, UE knowledge queries
- **Adastrea-Director**: Live editor operations, Python execution, autonomous monitoring

## Future Enhancements

Once Director's plugin integration is complete (Weeks 7-16):

1. **Enhanced MCP Integration**: Direct communication between both MCP servers
2. **Event Subscriptions**: Subscribe to Director's autonomous agent events
3. **Shared Knowledge Base**: Cross-pollinate UE knowledge and project-specific learnings
4. **Batch Operations**: Coordinate complex multi-step operations across both servers
5. **State Synchronization**: Share project state between static analysis and live editor
6. **WebSocket Support**: For real-time bidirectional communication (if REST API added)

## Support

For questions about:
- **Adastrea-MCP Integration**: See `PHASE2_1_GUIDE.md` and this document
- **Adastrea-Director**: See [Adastrea-Director repo](https://github.com/Mittenzx/Adastrea-Director)
- **Director's MCP Server**: See [MCP_SERVER_GUIDE.md](https://github.com/Mittenzx/Adastrea-Director/blob/main/mcp_server/MCP_SERVER_GUIDE.md) in Director repo
- **UE Python API**: See [UE_PYTHON_API.md](https://github.com/Mittenzx/Adastrea-Director/blob/main/Plugins/AdastreaDirector/Documentation/features/UE_PYTHON_API.md)

---

**Last Updated**: January 14, 2026  
**Status**: Infrastructure Complete, MCP-to-MCP Integration Recommended  
**Director Status**: P3 Complete (Autonomous Agents), Plugin Weeks 7-16 In Progress  
**Integration Model**: Dual MCP servers with complementary capabilities
