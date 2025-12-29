# Quick Start: Deploy GitHub Copilot Agent to Your Unreal Engine Projects

Get the Unreal Engine expert agent running in your projects in just 5 minutes!

## Prerequisites

✅ GitHub Copilot subscription with custom agents feature  
✅ Access to your Unreal Engine repository  
✅ IDE with GitHub Copilot (VS Code, Rider, etc.)

## Choose Your Deployment Method

### 🚀 Method 1: Single Repository (Fastest)

Perfect for testing or single-project use.

```bash
# 1. Navigate to your Unreal Engine project
cd /path/to/your/UnrealProject

# 2. Copy the agent (or download manually for security verification)
mkdir -p .github/agents
# Option A: Direct download
curl -o .github/agents/unreal-engine.md https://raw.githubusercontent.com/Mittenzx/Adastrea-MCP/main/.github/agents/unreal-engine.md
# Option B: Clone and copy (recommended for verification)
# git clone https://github.com/Mittenzx/Adastrea-MCP.git /tmp/adastrea-mcp
# cp /tmp/adastrea-mcp/.github/agents/unreal-engine.md .github/agents/

# 3. Commit and push
git add .github/agents/
git commit -m "Add Unreal Engine Copilot agent"
git push

# 4. Restart your IDE
```

**Done!** Try it: `@unreal_engine Create a character class`

---

### 🏢 Method 2: Organization-Wide (Best for Multiple Repos)

Deploy once, use across ALL your Unreal Engine repositories!

```bash
# 1. Navigate to your organization's .github repo
# (Create it if it doesn't exist)
cd your-org/.github
# or: gh repo create your-org/.github --public --confirm

# 2. Copy the agent
mkdir -p agents
curl -o agents/unreal-engine.md https://raw.githubusercontent.com/Mittenzx/Adastrea-MCP/main/.github/agents/unreal-engine.md

# 3. Commit and push
git add agents/
git commit -m "Add organization-wide Unreal Engine agent"
git push

# 4. Wait 2-3 minutes for sync, then restart IDE
```

**Done!** Agent is now available in ALL your organization's repositories!

---

### 📦 Method 3: Manual Download

If you prefer manual control:

1. **Download the agent file:**
   - Go to: https://github.com/Mittenzx/Adastrea-MCP/blob/main/.github/agents/unreal-engine.md
   - Click "Raw"
   - Save as `unreal-engine.md`

2. **Place in your repository:**
   ```
   YourUnrealProject/
   └── .github/
       └── agents/
           └── unreal-engine.md  ← Place here
   ```

3. **Commit and push:**
   ```bash
   git add .github/agents/unreal-engine.md
   git commit -m "Add Unreal Engine Copilot agent"
   git push
   ```

4. **Restart IDE**

---

## Quick Test

After deployment, test the agent:

### In VS Code / Rider:
```
@unreal_engine What's the proper naming convention for Actor classes?
```

**Expected Response:** Should mention "A" prefix (e.g., AMyActor)

### Test Code Generation:
```
@unreal_engine Create a simple pickup actor that can be collected by players
```

**Expected Result:** Generates C++ header and implementation with:
- ✅ Proper class name (APickupActor)
- ✅ UCLASS macro
- ✅ GENERATED_BODY()
- ✅ Epic Games style formatting

---

## Optional: Add Adastrea-MCP Integration

For enhanced project analysis and live editor features:

### 1. Install Adastrea-MCP Server

```bash
git clone https://github.com/Mittenzx/Adastrea-MCP.git
cd Adastrea-MCP
npm install
npm run build
```

### 2. Configure Your MCP Client

Add to your MCP configuration (Claude Desktop, Cline, etc.):

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

### 3. Test Enhanced Features

```
@unreal_engine Scan my project structure and find all Actor classes
```

The agent will use MCP tools to analyze your project!

---

## Example Use Cases

### Creating Actor Classes
```
@unreal_engine Create a character class with health, stamina, and sprint ability
```

### Blueprint Integration
```
@unreal_engine Make this C++ function callable from Blueprints:
void TakeDamage(float Amount);
```

### System Implementation
```
@unreal_engine Implement a quest system with:
- Quest tracking
- Objective completion
- Save/load support
```

### Performance Help
```
@unreal_engine This actor is causing performance issues. How can I optimize it?
[paste your code]
```

### Knowledge Queries
```
@unreal_engine How do I implement Lumen global illumination?
@unreal_engine What are best practices for Gameplay Ability System?
@unreal_engine Explain Chaos Physics collision detection
```

---

## Troubleshooting

### Agent Not Appearing?

1. **Check file location:** Must be `.github/agents/unreal-engine.md`
2. **Restart IDE:** Sometimes required to detect new agents
3. **Verify subscription:** Custom agents require GitHub Copilot subscription
4. **Check YAML:** First few lines should be valid YAML between `---` markers

### Agent Not Using Project Context?

1. **Install Adastrea-MCP** (see Optional section above)
2. **Provide more context** in your queries
3. **Mention project specifics** (e.g., "In my UE 5.6 multiplayer project...")

### Code Doesn't Compile?

1. **Specify Unreal version:** "For UE 5.6..."
2. **Include more context:** Show relevant code
3. **Ask for corrections:** "@unreal_engine This doesn't compile, please fix"

---

## What's Included

The agent includes expertise in:

- ✅ **C++ & Blueprints:** Complete knowledge of both systems
- ✅ **Epic Standards:** Enforces official Epic Games coding conventions
- ✅ **UE5.6+ Features:** Lumen, Nanite, Chaos, Iris, etc.
- ✅ **Gameplay Systems:** GAS, Actors, Components, Game Modes
- ✅ **Networking:** Replication, RPCs, multiplayer best practices
- ✅ **Performance:** Optimization tips and patterns
- ✅ **Best Practices:** Industry-standard Unreal Engine patterns

---

## Next Steps

1. ✅ **Deploy the agent** using one of the methods above
2. 📚 **Read full docs:** [.github/agents/README.md](.github/agents/README.md)
3. 🧪 **Run tests:** [.github/agents/DEPLOYMENT_TEST.md](.github/agents/DEPLOYMENT_TEST.md)
4. 🎮 **Start coding:** Use `@unreal_engine` in your IDE!
5. ⭐ **Star the repo:** https://github.com/Mittenzx/Adastrea-MCP

---

## Support

- 📖 **Full Documentation:** [Agents README](.github/agents/README.md)
- 🐛 **Report Issues:** https://github.com/Mittenzx/Adastrea-MCP/issues
- 💬 **Discussions:** https://github.com/Mittenzx/Adastrea-MCP/discussions
- 🔗 **Main Repo:** https://github.com/Mittenzx/Adastrea-MCP

---

**Happy coding with your new Unreal Engine expert! 🎮✨**
