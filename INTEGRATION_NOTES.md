# Adastrea-Director Integration Notes

This document provides implementation notes for integrating Adastrea-MCP with the live Adastrea-Director REST API.

## Current Status

**Phase 2.1 Implementation**: ✅ Complete (Infrastructure layer)

The Editor Communication Layer has been fully implemented with:
- DirectorClient class for HTTP communication
- EditorBridge for coordinating local and remote operations
- 4 new MCP tools for live editor interaction
- 2 new MCP resources for editor state
- Graceful degradation and fallback logic
- Comprehensive documentation and testing

**Current Limitation**: The DirectorClient uses placeholder implementations for HTTP requests. These return disconnected status until the actual REST API endpoints are implemented.

## Next Steps for Full Integration

### 1. Implement HTTP Client in DirectorClient

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

### 2. Implement Health Check Endpoint

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

### 3. Required Adastrea-Director REST Endpoints

The following REST endpoints need to be implemented in Adastrea-Director:

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

Once REST endpoints are available:

1. **Update Configuration**:
   ```bash
   export DIRECTOR_URL=http://localhost:3001
   ```

2. **Start Services**:
   - Start Adastrea-Director MCP server
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

### Pending (Requires Adastrea-Director REST API) ⏳
- [ ] Implement actual HTTP client in DirectorClient
- [ ] Implement health check endpoint call
- [ ] Test with live Adastrea-Director server
- [ ] Verify all tool operations work end-to-end
- [ ] Performance testing under load
- [ ] Update documentation with real examples

## Benefits of Current Implementation

Even without live Director connection, the implementation provides:

1. **Complete Infrastructure**: All classes and logic are in place
2. **Type Safety**: Full TypeScript typing ensures correctness
3. **Clear Contracts**: Interface definitions document expectations
4. **Graceful Degradation**: System works fully in offline mode
5. **Easy Integration**: Only needs REST endpoint implementation
6. **Testability**: Can be tested independently

## Future Enhancements

Once basic REST integration works:

1. **WebSocket Support**: For real-time bidirectional communication
2. **Event Subscriptions**: Subscribe to editor events
3. **Batch Operations**: Execute multiple commands efficiently
4. **State Caching**: Cache editor state for faster access
5. **Connection Pooling**: Support multiple Director instances

## Support

For questions about:
- **This integration layer**: See `PHASE2_1_GUIDE.md`
- **Adastrea-Director**: See [Adastrea-Director repo](https://github.com/Mittenzx/Adastrea-Director)
- **REST API design**: Coordinate between both projects

---

**Last Updated**: December 17, 2025  
**Status**: Infrastructure Complete, Awaiting REST Endpoints  
**Next Milestone**: Phase 2.2 Blueprint Interaction Tools
