# GitHub Copilot Agent Deployment Test Guide

This guide helps you verify that the Unreal Engine GitHub Copilot agent can be successfully deployed across multiple repositories.

## Prerequisites

- GitHub Copilot subscription with custom agents feature enabled
- Access to one or more Unreal Engine repositories
- GitHub Copilot enabled in your IDE (VS Code, Rider, etc.)

## Test Scenarios

### Test 1: Single Repository Deployment

**Objective:** Verify agent works in a single repository

**Steps:**

1. **Clone or navigate to an Unreal Engine project:**
   ```bash
   cd /path/to/your/unreal-project
   ```

2. **Copy agent files:**
   ```bash
   mkdir -p .github/agents
   cp /path/to/Adastrea-MCP/.github/agents/unreal-engine.md .github/agents/
   ```

3. **Commit and push:**
   ```bash
   git add .github/agents/
   git commit -m "Add GitHub Copilot Unreal Engine agent"
   git push
   ```

4. **Restart your IDE** (if already open)

5. **Test agent in GitHub Copilot:**
   - Open Copilot Chat
   - Try: `@unreal_engine What naming conventions should I use for Actor classes?`
   - Expected: Agent responds with Epic Games naming conventions (prefix with A)

**Success Criteria:**
- ✅ Agent appears in available agents list
- ✅ Agent responds to queries
- ✅ Agent follows Epic Games coding standards
- ✅ Agent mentions UCLASS, UPROPERTY, etc.

### Test 2: Organization-Wide Deployment

**Objective:** Verify agent works across all repositories in an organization

**Steps:**

1. **Navigate to organization's `.github` repository:**
   ```bash
   cd /path/to/your-org/.github
   # Or create it if it doesn't exist (use --private for internal standards):
   # gh repo create your-org/.github --private --confirm
   ```

2. **Copy agent files:**
   ```bash
   mkdir -p agents
   cp /path/to/Adastrea-MCP/.github/agents/unreal-engine.md agents/
   ```

3. **Commit and push:**
   ```bash
   git add agents/
   git commit -m "Add organization-wide Unreal Engine Copilot agent"
   git push
   ```

4. **Wait for synchronization** (may take a few minutes)

5. **Test in multiple repositories:**
   - Open different Unreal Engine projects in your organization
   - Try the agent in each project
   - Verify it works consistently

**Success Criteria:**
- ✅ Agent available in all organization repositories
- ✅ No need to copy files to individual repos
- ✅ Consistent behavior across repositories
- ✅ Updates to org agent reflect in all repos

### Test 3: Agent with Adastrea-MCP Integration

**Objective:** Verify agent can use MCP tools for project analysis

**Prerequisites:**
- Adastrea-MCP server running
- MCP client configured

**Steps:**

1. **Start Adastrea-MCP server** (if not already running)

2. **Open an Unreal Engine project** with the agent deployed

3. **Test MCP tool usage:**
   ```
   @unreal_engine Please analyze my project structure using scan_unreal_project
   ```

4. **Test knowledge queries:**
   ```
   @unreal_engine Query the knowledge database about Lumen rendering
   ```

5. **Test code analysis:**
   ```
   @unreal_engine Find all Actor classes in my project
   ```

**Success Criteria:**
- ✅ Agent successfully calls MCP tools
- ✅ Agent provides project-specific insights
- ✅ Agent references scanned project data
- ✅ Agent queries knowledge database when appropriate

### Test 4: Code Generation Quality

**Objective:** Verify agent generates Unreal Engine compliant code

**Steps:**

1. **Test Actor class creation:**
   ```
   @unreal_engine Create a simple pickup actor that can be collected by players
   ```

2. **Verify generated code includes:**
   - ✅ Proper class prefix (APickupActor)
   - ✅ UCLASS macro with appropriate specifiers
   - ✅ GENERATED_BODY() macro
   - ✅ Constructor implementation
   - ✅ BeginPlay override
   - ✅ Proper header structure with #pragma once
   - ✅ .generated.h include as last include

3. **Test Component creation:**
   ```
   @unreal_engine Create a health component with replication support
   ```

4. **Verify generated code includes:**
   - ✅ Proper class prefix (UHealthComponent)
   - ✅ Replication setup with GetLifetimeReplicatedProps
   - ✅ DOREPLIFETIME macros
   - ✅ Blueprint-callable functions with UFUNCTION
   - ✅ Proper property replication

5. **Test Blueprint integration:**
   ```
   @unreal_engine Make this function callable from Blueprints:
   void DealDamage(float Amount);
   ```

6. **Verify generated code includes:**
   - ✅ UFUNCTION(BlueprintCallable) macro
   - ✅ Category specified
   - ✅ Proper parameter naming

**Success Criteria:**
- ✅ All generated code compiles
- ✅ Code follows Epic Games standards
- ✅ Proper use of Unreal macros
- ✅ Blueprint integration works correctly

### Test 5: Multi-Version Support

**Objective:** Verify agent works with different Unreal Engine versions

**Steps:**

1. **Test with UE 5.6 project:**
   ```
   @unreal_engine How do I use Iris replication in UE 5.6?
   ```

2. **Test with UE 5.3 project:**
   ```
   @unreal_engine Create a character class for UE 5.3
   ```

3. **Verify agent:**
   - ✅ Provides version-appropriate answers
   - ✅ Mentions version-specific features
   - ✅ Warns about version differences when relevant
   - ✅ Generates compatible code

**Success Criteria:**
- ✅ Agent handles version queries correctly
- ✅ Generated code appropriate for specified version
- ✅ No UE 5.6-only features suggested for 5.3

### Test 6: IDE Integration

**Objective:** Verify agent works in different IDEs

**Test in VS Code:**
1. Open Copilot Chat panel
2. Type `@unreal_engine`
3. Verify agent appears in autocomplete
4. Test a query

**Test in JetBrains Rider:**
1. Open Copilot tool window
2. Type `@unreal_engine`
3. Verify agent appears
4. Test a query

**Test in GitHub CLI:**
```bash
gh copilot suggest "@unreal_engine Create a game mode class"
```

**Success Criteria:**
- ✅ Agent available in all supported IDEs
- ✅ Consistent behavior across platforms
- ✅ Proper syntax highlighting
- ✅ Agent suggestions work correctly

## Troubleshooting

### Agent Not Appearing

**Symptoms:**
- Agent not in autocomplete list
- `@unreal_engine` not recognized

**Solutions:**
1. Restart IDE
2. Check file location: `.github/agents/unreal-engine.md`
3. Verify YAML frontmatter is valid
4. Check GitHub Copilot subscription includes custom agents
5. Clear IDE cache and restart

### Agent Not Using MCP Tools

**Symptoms:**
- Agent doesn't scan project
- No project-specific insights
- Generic answers only

**Solutions:**
1. Verify Adastrea-MCP server is running
2. Check MCP client configuration
3. Test MCP connection directly
4. Review agent tools list in frontmatter
5. Ensure `unreal-mcp` is in tools list

### Incorrect Code Generation

**Symptoms:**
- Code doesn't compile
- Missing Unreal macros
- Wrong naming conventions

**Solutions:**
1. Provide more context in query
2. Specify Unreal Engine version
3. Include example code
4. Ask agent to follow Epic Games standards explicitly
5. Report issue if problem persists

### Organization Deployment Not Working

**Symptoms:**
- Agent not available in org repos
- Different behavior than local deployment

**Solutions:**
1. Verify `.github` repository is public (or accessible)
2. Check organization permissions
3. Wait for sync (can take several minutes)
4. Verify file path: `agents/unreal-engine.md`
5. Check organization settings allow custom agents

## Validation Checklist

Use this checklist to validate a complete deployment:

### Configuration
- [ ] Agent file located in `.github/agents/unreal-engine.md`
- [ ] YAML frontmatter is valid
- [ ] All required fields present (name, description, target)
- [ ] Tools list includes necessary tools
- [ ] Markdown content is well-formatted

### Functionality
- [ ] Agent appears in IDE autocomplete
- [ ] Agent responds to queries
- [ ] Generates valid Unreal Engine code
- [ ] Follows Epic Games coding standards
- [ ] Uses proper Unreal macros (UCLASS, UPROPERTY, etc.)
- [ ] Provides version-appropriate advice

### MCP Integration (if applicable)
- [ ] Agent can call MCP tools
- [ ] Scans project structure successfully
- [ ] Queries knowledge database
- [ ] Provides project-specific insights
- [ ] Uses live editor data when available

### Deployment
- [ ] Works in single repository
- [ ] Works in organization-wide deployment
- [ ] Consistent across multiple repositories
- [ ] Updates propagate correctly
- [ ] No conflicts with other agents

### IDE Support
- [ ] Works in VS Code
- [ ] Works in JetBrains Rider
- [ ] Works in GitHub CLI
- [ ] Consistent behavior across IDEs
- [ ] Proper syntax highlighting

## Reporting Issues

If you encounter issues:

1. **Check this guide** for troubleshooting steps
2. **Verify prerequisites** are met
3. **Collect diagnostic information:**
   - IDE version
   - GitHub Copilot version
   - Unreal Engine version
   - Error messages
   - Steps to reproduce

4. **Report issue:**
   - GitHub Issues: https://github.com/Mittenzx/Adastrea-MCP/issues
   - Include diagnostic information
   - Describe expected vs actual behavior
   - Attach screenshots if applicable

## Success Confirmation

After completing tests, you should have:

✅ **Agent deployed and working** in at least one repository
✅ **Code generation tested** and producing valid Unreal Engine code
✅ **MCP integration verified** (if using Adastrea-MCP)
✅ **Multiple repositories tested** (if organization-wide)
✅ **IDE integration confirmed** in your preferred development environment

Once all tests pass, the agent is ready for production use across all your Unreal Engine repositories!

## Next Steps

1. **Deploy to all repositories** using your chosen method
2. **Train your team** on using the agent effectively
3. **Customize the agent** for project-specific needs (optional)
4. **Monitor usage** and gather feedback
5. **Update agent** as needed for new Unreal Engine versions

## Resources

- **Agent Documentation:** [.github/agents/README.md](.github/agents/README.md)
- **Adastrea-MCP Repository:** https://github.com/Mittenzx/Adastrea-MCP
- **GitHub Copilot Docs:** https://docs.github.com/en/copilot
- **Custom Agents Guide:** https://docs.github.com/en/copilot/reference/custom-agents-configuration
