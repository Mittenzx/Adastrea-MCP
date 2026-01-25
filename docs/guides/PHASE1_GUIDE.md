# Phase 1: Foundation Enhancement - User Guide

This guide explains how to use the Phase 1 features of Adastrea-MCP, which provide deep Unreal Engine project understanding and analysis capabilities.

## Overview

Phase 1 adds powerful Unreal Engine integration to the MCP server, allowing AI agents to:
- Parse and understand Unreal Engine project structure
- Analyze C++ code for UCLASS, USTRUCT, UENUM, and UINTERFACE definitions
- Detect and catalog Blueprint assets
- Scan and categorize project assets
- Inventory installed plugins
- Search and navigate code and assets

## Getting Started

### 1. Scan Your Unreal Project

Before using any Unreal-specific features, you need to scan your project:

```
Tool: scan_unreal_project
Parameters:
{
  "project_path": "/absolute/path/to/YourUnrealProject"
}
```

**What this does:**
- Locates and parses the .uproject file
- Scans all modules in the Source directory
- Analyzes C++ header files for Unreal classes
- Catalogs Blueprint assets in Content directory
- Inventories installed plugins
- Detects build configurations

**Output:**
A comprehensive project summary including:
- Project name and engine version
- Module count and list
- Class statistics (UCLASS, USTRUCT, UENUM, UINTERFACE)
- Function count (total and Blueprint-callable)
- Asset statistics by type
- Plugin information
- Target platforms

### 2. Validate Project Structure

Check if your project structure follows Unreal Engine conventions:

```
Tool: validate_project_structure
Parameters:
{
  "project_path": "/absolute/path/to/YourUnrealProject"
}
```

**What this checks:**
- .uproject file exists and is valid JSON
- Source directory exists
- Content directory exists
- All modules defined in .uproject have corresponding directories
- Module dependencies are valid

## Using Resources

After scanning a project, you can access various resources:

### Project Configuration

```
Resource: unreal://project/config
```

Returns complete project configuration including:
- Project name and path
- Engine version
- Module definitions
- Plugin list
- Target platforms
- Build configurations

### Modules Information

```
Resource: unreal://project/modules
```

Returns array of modules with:
- Module name
- Type (Runtime, Editor, etc.)
- Loading phase
- Dependencies
- Classes defined in module
- Module path

### Plugins Inventory

```
Resource: unreal://project/plugins
```

Returns array of plugins with:
- Plugin name and friendly name
- Version information
- Description
- Category
- Creator information
- Marketplace URL
- Module dependencies
- Installation path

### C++ Classes Registry

```
Resource: unreal://project/classes
```

Returns array of all detected classes:
- Class name
- Type (UCLASS, USTRUCT, UENUM, UINTERFACE)
- Parent class
- Specifiers (Blueprintable, BlueprintType, etc.)
- File location and line number
- Module membership

### Blueprint Assets

```
Resource: unreal://project/blueprints
```

Returns array of Blueprint assets with:
- Blueprint name
- Asset path
- Type
- Parent class
- Interfaces implemented
- Variables and functions

### Asset Catalog

```
Resource: unreal://project/assets
```

Returns complete asset catalog with:
- Asset name
- Full path
- Type (Material, Mesh, Texture, Blueprint, etc.)
- File size
- Dependencies
- References

### Build Configurations

```
Resource: unreal://build/config
```

Returns available build configurations:
- Configuration name
- Platform (Windows, Linux, etc.)
- Build type (Development, Shipping, DebugGame)
- Target name

## Using Tools

### Search for Code

Find classes, structs, enums, or interfaces:

```
Tool: search_code
Parameters:
{
  "query": "Character"
}
```

**Use cases:**
- Find all classes containing "Character" in name
- Search for specific UCLASS types
- Locate structs or enums

**Returns:**
Array of matching classes with full metadata

### Find Class Usage

Discover where a class is referenced:

```
Tool: find_class_usage
Parameters:
{
  "class_name": "AMyGameCharacter"
}
```

**What it finds:**
- Classes that inherit from the specified class
- Functions that return or take the class as parameter
- Files where the class is referenced

**Returns:**
- List of files containing references
- Total reference count

### Get Class Hierarchy

Understand class inheritance:

```
Tool: get_class_hierarchy
Parameters:
{
  "class_name": "AMyGameCharacter"
}
```

**Returns:**
Complete inheritance chain from the specified class to its ultimate parent

Example output:
```
AMyGameCharacter -> ACharacter -> APawn -> AActor -> UObject
```

### Search Assets

Find assets by name, type, or path:

```
Tool: search_assets
Parameters:
{
  "query": "Material"
}
```

**Use cases:**
- Find all materials in the project
- Search for specific asset by name
- Locate assets in a particular directory

**Returns:**
Array of matching assets with:
- Name and path
- Type
- Size
- Metadata

### Get Asset Dependencies

(Placeholder for future enhancement)

```
Tool: get_asset_dependencies
Parameters:
{
  "asset_path": "/Game/Materials/M_MyMaterial"
}
```

Currently returns placeholder message. Full dependency tracking coming in future phases.

## Practical Examples

### Example 1: Understanding Project Structure

```
1. scan_unreal_project with project path
2. Read unreal://project/config
3. Read unreal://project/modules
4. validate_project_structure
```

Result: Complete understanding of project organization

### Example 2: Analyzing Game Characters

```
1. scan_unreal_project with project path
2. search_code with query: "Character"
3. For each character class:
   - get_class_hierarchy to understand inheritance
   - find_class_usage to see where it's used
```

Result: Complete picture of character system

### Example 3: Asset Inventory

```
1. scan_unreal_project with project path
2. Read unreal://project/assets
3. search_assets with query: "Blueprint"
4. search_assets with query: "Material"
```

Result: Comprehensive asset catalog organized by type

### Example 4: Plugin Audit

```
1. scan_unreal_project with project path
2. Read unreal://project/plugins
3. Review plugin categories and versions
```

Result: Complete plugin inventory with metadata

## Asset Type Detection

The asset analyzer automatically categorizes assets based on:

### By File Extension
- `.umap` → Level
- `.uplugin` → Plugin

### By Naming Convention
- `BP_*` → Blueprint
- `M_*` → Material
- `T_*` → Texture
- `SM_*` / `SK_*` → Mesh (Static/Skeletal)
- `A_*` / `AM_*` → Animation
- `W_*` / `WBP_*` → Widget (UI)
- `P_*` → Particle System

### By Directory
- `/Blueprints/` → Blueprint
- `/Materials/` → Material
- `/Textures/` → Texture
- `/Meshes/` → Mesh
- `/Animations/` → Animation
- `/Audio/` or `/Sound/` → Audio
- `/Particles/` → Particle System
- `/UI/` → Widget

## Performance Considerations

### Initial Scan Time
- Small projects (< 100 files): < 1 second
- Medium projects (100-1000 files): 1-5 seconds
- Large projects (> 1000 files): 5-30 seconds

### Resource Access
- All resources return cached data after initial scan
- Response time: < 100ms for most resources
- Re-scan only when project changes

### Memory Usage
- Efficient in-memory caching of parsed data
- Minimal memory footprint for typical projects
- Lazy loading of detailed asset information

## Limitations and Future Enhancements

### Current Limitations

1. **Blueprint Parsing**: Basic metadata only. Full Blueprint node graph analysis requires UE Asset API.

2. **Asset Dependencies**: Dependency tracking is placeholder. Full implementation requires binary asset parsing.

3. **C++ Parsing**: Custom regex-based parser. Some complex C++ constructs may not be detected.

4. **Live Updates**: Changes to project require re-scan. Real-time monitoring planned for Phase 2.

### Coming in Phase 2

- Live Unreal Editor integration via Adastrea-Director plugin
- Real-time project state synchronization
- Blueprint node graph analysis
- Actor and component manipulation
- Remote editor control
- Automation test execution

## Troubleshooting

### "No .uproject file found"
- Ensure project_path points to directory containing .uproject file
- Check path is absolute, not relative
- Verify file permissions

### "Failed to parse .uproject file"
- Validate .uproject file is valid JSON
- Check for syntax errors in file
- Ensure file is not corrupted

### "Module directory not found"
- Verify Source directory exists
- Check module names match directory names
- Ensure proper capitalization

### "No classes found"
- Verify .h files exist in module directories
- Check files contain UCLASS/USTRUCT/UENUM macros
- Ensure proper file permissions

## Best Practices

1. **Always scan before accessing resources**: Run `scan_unreal_project` before using any Unreal-specific resources or tools.

2. **Re-scan after major changes**: Re-run scan after adding modules, plugins, or significant code changes.

3. **Use validation regularly**: Run `validate_project_structure` to catch structural issues early.

4. **Leverage search tools**: Use `search_code` and `search_assets` for quick discovery instead of browsing raw resources.

5. **Check class hierarchies**: Use `get_class_hierarchy` to understand inheritance relationships before refactoring.

## Integration with AI Agents

AI agents (like Claude) can use these features to:

1. **Understand codebase**: Quickly map out project structure and class relationships

2. **Assist with refactoring**: Find all usages before renaming or moving classes

3. **Generate code**: Create new classes following project conventions

4. **Debug issues**: Locate classes and assets involved in problems

5. **Plan features**: Analyze existing systems before implementing new ones

6. **Documentation**: Generate architecture documentation from scanned data

## Next Steps

- See [ROADMAP.md](./ROADMAP.md) for upcoming Phase 2 features
- Explore the [Adastrea-Director](https://github.com/Mittenzx/Adastrea-Director) plugin for runtime integration
- Join discussions about feature priorities

---

**Phase 1 Status**: ✅ Complete
**Last Updated**: December 2025
**Version**: 1.0.0
