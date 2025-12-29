# GitHub Copilot Agents for Unreal Engine

This directory contains GitHub Copilot custom agent configurations designed for Unreal Engine development. These agents can be deployed across all your Unreal Engine repositories to provide consistent, expert-level AI assistance.

## Available Agents

### 🎮 Unreal Engine Agent (`unreal-engine.md`)

Expert Unreal Engine 5.6+ specialist for C++ and Blueprint development.

**Capabilities:**
- C++ development with Unreal Engine macros (UCLASS, USTRUCT, UENUM, etc.)
- Blueprint visual scripting and Blueprint-C++ interaction
- Comprehensive knowledge of UE5.6+ systems (Lumen, Nanite, Chaos, etc.)
- Integration with Adastrea-MCP for project analysis
- Epic Games coding standards enforcement
- Performance optimization guidance
- Networking and replication best practices
- Gameplay Ability System (GAS) expertise

**Use Cases:**
- Creating new Actor classes and Components
- Implementing gameplay systems
- Blueprint-C++ integration
- Performance optimization
- Debugging and error handling
- Architecture decisions

## How to Use These Agents

### Option 1: Repository-Level Deployment (Recommended for Individual Repos)

Copy the entire `.github/agents/` directory to your Unreal Engine project repository:

```bash
# From your Unreal project root
mkdir -p .github/agents
cp /path/to/Adastrea-MCP/.github/agents/*.md .github/agents/
```

The agents will automatically be available in GitHub Copilot for that repository.

### Option 2: Organization-Level Deployment (Recommended for Multiple Repos)

For deploying across all repositories in your organization:

1. **Create an organization-wide repository** (e.g., `my-org/.github`)
2. **Copy agents to organization repo:**
   ```bash
   # In your organization's .github repository
   mkdir -p agents
   cp /path/to/Adastrea-MCP/.github/agents/*.md agents/
   ```
3. **Commit and push** - All repositories in your organization will now have access to these agents

### Option 3: Private Organization Configuration

For private organization-wide agents:

1. **Create `my-org/.github-private` repository**
2. **Copy agents:**
   ```bash
   mkdir -p agents
   cp /path/to/Adastrea-MCP/.github/agents/*.md agents/
   ```
3. **Set appropriate access controls** in repository settings

## Using Agents with Adastrea-MCP

The Unreal Engine agent is designed to work seamlessly with the Adastrea-MCP server. To get the full benefit:

### 1. Install Adastrea-MCP Server

```bash
# Clone and build Adastrea-MCP
git clone https://github.com/Mittenzx/Adastrea-MCP.git
cd Adastrea-MCP
npm install
npm run build
```

### 2. Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop, Cline):

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

### 3. Scan Your Unreal Project

The agent can use MCP tools to understand your project:

```
@unreal_engine Please analyze my project structure
```

The agent will automatically use `scan_unreal_project` to:
- Parse `.uproject` files
- Analyze C++ classes
- Catalog Blueprints
- Index assets
- Understand project architecture

### 4. Query Knowledge Base

The agent has access to comprehensive UE5.6+ knowledge:

```
@unreal_engine How do I implement Lumen global illumination?
@unreal_engine What are the best practices for Gameplay Ability System?
@unreal_engine Help me optimize this actor for multiplayer
```

## Invoking Agents in Your IDE

### Visual Studio Code with GitHub Copilot

1. **Automatic invocation:** The agent will automatically activate for Unreal Engine projects (when `infer: true`)
2. **Manual invocation:** Use the `@` symbol in Copilot Chat:
   ```
   @unreal_engine Create a health component for my character
   ```

### JetBrains Rider

1. Open Copilot Chat
2. Type `@unreal_engine` followed by your request
3. The agent will provide context-aware assistance

### GitHub Copilot CLI

```bash
# Ask the agent for help
gh copilot suggest "@unreal_engine How do I set up replication for this actor?"

# Use in code generation
gh copilot suggest "Create a Blueprint-callable damage function" --agent unreal_engine
```

## Agent Features

### Epic Games Coding Standards

The agent enforces official Epic Games coding standards:
- Proper naming conventions (A, U, F, E, I, T prefixes)
- File organization (Public/Private separation)
- Header file structure with GENERATED_BODY()
- Comments and documentation standards
- Performance best practices

### MCP Integration

The agent leverages Adastrea-MCP tools for:
- **Project Analysis:** `scan_unreal_project`, `validate_project_structure`
- **Code Search:** `search_code`, `find_class_usage`, `get_class_hierarchy`
- **Asset Management:** `search_assets`, `get_asset_dependencies`
- **Live Editor:** `execute_console_command`, `run_python_script`
- **Actor Management:** `spawn_actor`, `modify_actor_properties`
- **Knowledge Queries:** `query_ue_knowledge`, `get_ue_system`

### Comprehensive UE5.6+ Knowledge

The agent includes expertise in:
- **Rendering:** Lumen, Nanite, Virtual Shadow Maps
- **Animation:** Unreal Animation Framework, Motion Trails, MetaHuman
- **Physics:** Chaos Physics, collision detection, vehicles
- **AI:** Behavior Trees, State Trees, Mass Entity
- **Networking:** Iris replication, RPCs
- **Audio:** MetaSounds, procedural audio
- **UI:** UMG, Common UI, MVVM
- **VFX:** Niagara particle system
- **Gameplay:** Gameplay Ability System (GAS)

## Example Workflows

### Creating a New Character Class

```
@unreal_engine I need a character class with:
- Health system with replication
- Sprint ability
- Damage handling
- Blueprint-callable functions for UI
```

The agent will:
1. Search for similar implementations
2. Create proper header and implementation files
3. Follow Epic Games naming conventions
4. Add replication support
5. Include Blueprint-callable functions
6. Add proper logging and error handling

### Implementing a Gameplay System

```
@unreal_engine Implement a quest system with:
- Quest tracking
- Objective completion
- Rewards
- Save/load support
```

The agent will:
1. Query knowledge base for best practices
2. Design component-based architecture
3. Implement with proper serialization
4. Add Blueprint integration points
5. Include networking support if needed

### Optimizing Performance

```
@unreal_engine This actor is causing performance issues in multiplayer
[paste actor code]
```

The agent will:
1. Analyze tick usage
2. Check replication setup
3. Review memory allocations
4. Suggest optimizations
5. Provide refactored code

## Customization

You can customize these agents for your specific needs:

### Adding Project-Specific Rules

Edit the agent file and add to the "Boundaries and Safety" section:

```markdown
### Project-Specific Rules:
- ✅ Use our custom base classes (AMyGameCharacter, AMyGameActor)
- ✅ All gameplay code must use our GAS implementation
- ✅ Follow our module structure: Core, Gameplay, UI, Systems
- ❌ Don't modify shared plugin code without team approval
```

### Adding Custom MCP Tools

If you extend Adastrea-MCP with custom tools:

```markdown
### Custom Tools:
- `my_custom_tool` - Description of what it does
  ```
  Use when: Specific scenario
  Example: my_custom_tool --param value
  ```
```

### Version-Specific Configuration

For projects on different UE versions:

```yaml
---
name: unreal_engine_53
description: "UE 5.3 specialist (without UE 5.6 features)"
metadata:
  unreal_version: "5.3"
---
```

## Troubleshooting

### Agent Not Appearing

1. **Check file location:** Must be in `.github/agents/` directory
2. **Verify YAML frontmatter:** Must be valid YAML between `---` markers
3. **Restart IDE:** Some IDEs need restart to detect new agents
4. **Check GitHub Copilot:** Ensure you have access to custom agents feature

### Agent Not Using MCP Tools

1. **Verify MCP server is running:** Check your MCP client configuration
2. **Test MCP connection:** Try invoking tools manually
3. **Check tool availability:** Use `list_tools` in MCP client
4. **Review agent configuration:** Ensure `tools` includes `unreal-mcp`

### Agent Giving Incorrect Advice

1. **Provide more context:** Include relevant code snippets
2. **Specify UE version:** Mention if using a specific Unreal Engine version
3. **Reference documentation:** Ask agent to query knowledge base first
4. **Update agent:** Ensure you have the latest version of the agent file

## Best Practices

### When to Use the Agent

✅ **Good Use Cases:**
- Creating new classes following UE conventions
- Implementing gameplay systems
- Setting up replication
- Blueprint-C++ integration
- Understanding UE5.6+ features
- Performance optimization guidance
- Architecture decisions

❌ **Avoid Using For:**
- Debugging complex engine bugs (use UE documentation/forums)
- Legal/licensing questions (consult Epic Games terms)
- Specific project business logic (without proper context)
- Production deployment decisions (consult team)

### Providing Context

Always provide relevant context:
```
@unreal_engine I'm working on a multiplayer FPS using UE 5.6.
The project uses GAS for abilities. I need to create a weapon component
that can be attached to characters and replicated to all clients.
```

### Iterating with the Agent

Work iteratively:
1. Start with high-level design questions
2. Get implementation guidance
3. Review and refine code
4. Ask for optimization suggestions
5. Request documentation help

## Contributing

To improve these agents:

1. **Fork the Adastrea-MCP repository**
2. **Edit agent files** in `.github/agents/`
3. **Test thoroughly** in real Unreal Engine projects
4. **Submit a pull request** with description of improvements
5. **Include examples** of how the changes help

## Resources

- **Adastrea-MCP Repository:** https://github.com/Mittenzx/Adastrea-MCP
- **Adastrea-Director Plugin:** https://github.com/Mittenzx/Adastrea-Director
- **GitHub Copilot Docs:** https://docs.github.com/en/copilot
- **Custom Agents Guide:** https://docs.github.com/en/copilot/reference/custom-agents-configuration
- **Unreal Engine Docs:** https://docs.unrealengine.com/

## License

MIT License - See LICENSE file in the Adastrea-MCP repository

## Support

For issues or questions:
- **GitHub Issues:** https://github.com/Mittenzx/Adastrea-MCP/issues
- **Discussions:** https://github.com/Mittenzx/Adastrea-MCP/discussions

---

**Note:** These agents are designed to work best with the Adastrea-MCP server but can also provide valuable assistance as standalone agents for any Unreal Engine project.
