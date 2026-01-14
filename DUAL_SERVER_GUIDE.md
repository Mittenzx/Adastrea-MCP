# Dual MCP Server Setup Guide

**Using Adastrea-MCP and Adastrea-Director Together**

## Overview

Adastrea-MCP and Adastrea-Director are complementary MCP servers that work together to provide comprehensive Unreal Engine development assistance:

- **Adastrea-MCP**: Static analysis, code generation, UE5.6+ knowledge
- **Adastrea-Director**: Runtime execution, autonomous monitoring, AI planning

## Quick Start

### 1. Install Both Servers

**Adastrea-MCP** (Static Analysis):
```bash
cd /path/to/Adastrea-MCP
npm install
npm run build
```

**Adastrea-Director** (Runtime Operations):
```bash
cd /path/to/Adastrea-Director
pip install -r requirements.txt
# Optional: Populate game repository for context
python ingest_game_repo.py
```

### 2. Configure Your MCP Client

Add both servers to your MCP client configuration (e.g., Claude Desktop, 5ire, Cline, Zed):

```json
{
  "mcpServers": {
    "adastrea-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/Adastrea-MCP/build/index.js"]
    },
    "adastrea-director": {
      "command": "python",
      "args": ["/absolute/path/to/Adastrea-Director/mcp_server/server.py"]
    }
  }
}
```

**Note**: Use absolute paths for both server locations.

### 3. Start Using Both Servers

Your MCP client will automatically connect to both servers. Use the appropriate tools based on your task:

## When to Use Which Server

| Task | Server | Example Tools |
|------|--------|---------------|
| **Parse .uproject file** | Adastrea-MCP | `scan_unreal_project` |
| **Analyze C++ code** | Adastrea-MCP | `search_code`, `get_class_hierarchy` |
| **Search Blueprints** | Adastrea-MCP | `search_assets` |
| **Generate C++ class** | Adastrea-MCP | `generate_uclass`, `generate_game_mode` |
| **Query UE knowledge** | Adastrea-MCP | `query_ue_knowledge`, `get_ue_system` |
| **Execute Python in UE** | Adastrea-Director | `unreal_execute_python` |
| **List assets from live editor** | Adastrea-Director | `unreal_list_assets` |
| **Spawn actors** | Adastrea-Director | `unreal_create_actor` |
| **Run console commands** | Adastrea-Director | `unreal_execute_console` |
| **Monitor performance** | Adastrea-Director | Autonomous agents |
| **Detect bugs** | Adastrea-Director | Autonomous agents |

## Example Workflows

### Workflow 1: Create and Spawn a Custom Actor

1. **Generate C++ Actor Class** (Adastrea-MCP):
   ```
   Use generate_uclass tool:
   - className: "AMyCustomActor"
   - parentClass: "AActor"
   - blueprintable: true
   ```

2. **Add Custom Properties** (Adastrea-MCP):
   ```
   Use generate_blueprint_compatible_class:
   - Add UPROPERTY for Speed, Health, etc.
   ```

3. **Compile in UE Editor** (Manual or via Director's Python API)

4. **Spawn Instance** (Adastrea-Director):
   ```
   Use unreal_create_actor:
   - class_path: "/Game/MyCustomActor"
   - location: {"x": 0, "y": 0, "z": 100}
   ```

### Workflow 2: Analyze and Optimize Project

1. **Scan Project Structure** (Adastrea-MCP):
   ```
   Use scan_unreal_project:
   - Analyze all C++ classes
   - Find Blueprint assets
   - Check plugin dependencies
   ```

2. **Query Best Practices** (Adastrea-MCP):
   ```
   Use query_ue_knowledge:
   - "performance optimization techniques"
   - "rendering best practices"
   ```

3. **Monitor Live Performance** (Adastrea-Director):
   ```
   Start autonomous agents:
   - Performance profiling agent
   - Code quality monitoring
   ```

4. **Apply Fixes** (Both):
   - Generate optimized code with Adastrea-MCP
   - Test in live editor with Adastrea-Director

### Workflow 3: Add Networking to Actor

1. **Generate Replication Code** (Adastrea-MCP):
   ```
   Use generate_replication_code:
   - className: "AMyActor"
   - properties: [Health, Score]
   - rpcs: [ServerTakeDamage]
   ```

2. **Test in PIE** (Adastrea-Director):
   ```
   Use unreal_execute_python:
   - Start multi-player PIE session
   - Verify replication working
   ```

3. **Monitor Network Performance** (Adastrea-Director):
   ```
   Use autonomous agents:
   - Check for network bottlenecks
   ```

## Complementary Capabilities

### Adastrea-MCP Strengths
- ✅ Works offline (no UE Editor needed)
- ✅ Fast static analysis
- ✅ Comprehensive code generation
- ✅ UE5.6+ knowledge database
- ✅ Blueprint metadata parsing

### Adastrea-Director Strengths
- ✅ Live UE Editor integration
- ✅ Python script execution in UE
- ✅ Autonomous monitoring
- ✅ RAG-based documentation Q&A
- ✅ AI-powered planning
- ✅ Real-time asset operations

## Configuration Tips

### MCP Client Settings

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "adastrea-mcp": {
      "command": "node",
      "args": ["/Users/yourname/Projects/Adastrea-MCP/build/index.js"]
    },
    "adastrea-director": {
      "command": "python",
      "args": ["/Users/yourname/Projects/Adastrea-Director/mcp_server/server.py"]
    }
  }
}
```

**5ire/Cline/Zed**: Similar configuration in their respective settings files.

### Environment Variables

Both servers support environment variables for configuration:

**Adastrea-MCP**:
```bash
export DIRECTOR_URL=http://localhost:3001  # Optional, for future REST integration
```

**Adastrea-Director**:
```bash
export GEMINI_KEY="your-api-key"           # For LLM queries
export GITHUB_TOKEN="your-token"           # For repository ingestion
```

## Troubleshooting

### Server Not Connecting

**Check 1**: Verify paths are absolute
```bash
# Wrong
"args": ["./build/index.js"]

# Correct
"args": ["/Users/yourname/Projects/Adastrea-MCP/build/index.js"]
```

**Check 2**: Verify server builds/installs
```bash
# Adastrea-MCP
cd /path/to/Adastrea-MCP && npm run build

# Adastrea-Director
cd /path/to/Adastrea-Director && pip install -r requirements.txt
```

**Check 3**: Check MCP client logs
- Most MCP clients provide logs showing connection attempts and errors

### Tools Not Available

**Symptom**: Can't see tools from one server

**Solution**: Restart your MCP client after configuration changes

### Conflicting Tool Names

Both servers use distinct tool name prefixes:
- Adastrea-MCP: `scan_unreal_project`, `generate_uclass`, etc.
- Adastrea-Director: `unreal_execute_python`, `unreal_list_assets`, etc.

No naming conflicts exist between the servers.

## Performance Considerations

### Memory Usage
- Each server runs as a separate process
- **Adastrea-MCP**: ~50-100MB (TypeScript/Node.js)
- **Adastrea-Director**: ~200-500MB (Python + LLM + RAG)

### Startup Time
- **Adastrea-MCP**: <1 second
- **Adastrea-Director**: 2-5 seconds (loads models and databases)

### Concurrent Operations
Both servers can run operations simultaneously:
- Scan project with MCP while monitoring performance with Director
- Generate code with MCP while testing in live editor with Director

## Best Practices

### 1. Use Offline Analysis When Possible
- If you don't need live editor access, use Adastrea-MCP
- Faster and doesn't require UE Editor running

### 2. Leverage Director for Runtime Tasks
- Anything that needs UE Editor → Use Director
- Python execution, asset queries, actor spawning

### 3. Combine for Complex Workflows
- Generate code with MCP
- Test and iterate with Director
- Monitor quality with Director's autonomous agents

### 4. Cache Director's Knowledge Base
- Run `python ingest_game_repo.py` once
- Both servers can then access game context
- MCP has built-in UE5.6+ knowledge
- Director has RAG for project-specific knowledge

## Advanced Integration

### Custom Workflows

Create bash/Python scripts that use both servers:

```bash
#!/bin/bash
# generate-and-test.sh

# Generate actor with Adastrea-MCP
echo "Generating actor class..."
# (Call MCP tool via your MCP client API)

# Spawn in editor with Adastrea-Director
echo "Spawning test instance..."
# (Call Director tool via MCP client API)

# Monitor with Director
echo "Starting performance monitoring..."
# (Start Director autonomous agent)
```

### CI/CD Integration

```yaml
# .github/workflows/ue-validation.yml
steps:
  - name: Static Analysis
    run: |
      # Use Adastrea-MCP tools for static validation
      
  - name: Runtime Testing
    run: |
      # Use Adastrea-Director for automated testing
```

## Further Reading

- **Adastrea-MCP Documentation**: See [README.md](./README.md)
- **Adastrea-Director Documentation**: See [Adastrea-Director Wiki](https://github.com/Mittenzx/Adastrea-Director/wiki)
- **Director MCP Server Guide**: [MCP_SERVER_GUIDE.md](https://github.com/Mittenzx/Adastrea-Director/blob/main/mcp_server/MCP_SERVER_GUIDE.md)
- **Integration Architecture**: See [INTEGRATION_NOTES.md](./INTEGRATION_NOTES.md)

## Support

For issues or questions:
- **Adastrea-MCP**: [GitHub Issues](https://github.com/Mittenzx/Adastrea-MCP/issues)
- **Adastrea-Director**: [GitHub Issues](https://github.com/Mittenzx/Adastrea-Director/issues)

---

**Last Updated**: January 14, 2026  
**MCP Protocol Version**: 1.0  
**Status**: Production Ready
