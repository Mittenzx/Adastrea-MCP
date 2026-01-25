# Documentation Generation System

## Overview

The Documentation Generation System (Phase 3.2) provides automatic generation of comprehensive documentation from Unreal Engine C++ code and Blueprint assets.

## Features

### 1. **Smart Documentation Generation**
- Auto-generate documentation from C++ code
- Extract comments and metadata from source files
- Generate markdown documentation with proper formatting
- Support for UCLASS, USTRUCT, UENUM, UFUNCTION, UPROPERTY

### 2. **Code Metadata Extraction**
- Extract detailed metadata from C++ files
- Parse comments, specifiers, and type information
- Identify Blueprint-exposed elements
- Support for cross-referencing

### 3. **System Architecture Diagrams**
- Generate Mermaid diagrams showing class relationships
- Visualize inheritance hierarchies
- Show component structures
- Configurable depth and detail levels

### 4. **Integration Guides**
- Generate step-by-step integration guides
- Include prerequisites and setup instructions
- Provide code examples and best practices
- Target different experience levels (beginner, intermediate, advanced)

## MCP Tools

### `generate_documentation`
Generate comprehensive documentation from a C++ header file.

**Parameters:**
- `file_path` (required): Absolute path to the C++ header file
- `title` (optional): Title for the documentation
- `includePrivate` (optional): Include private members (default: false)

**Example:**
```json
{
  "file_path": "/path/to/MyActor.h",
  "title": "MyActor API Documentation",
  "includePrivate": false
}
```

### `extract_code_metadata`
Extract detailed metadata from C++ code for analysis.

**Parameters:**
- `file_path` (required): Absolute path to the C++ file

**Example:**
```json
{
  "file_path": "/path/to/MyActor.h"
}
```

**Returns:** JSON with classes, functions, properties, enums, and structs

### `generate_system_diagram`
Create a system architecture diagram in Mermaid format.

**Parameters:**
- `file_paths` (required): Array of C++ header file paths
- `includeInheritance` (optional): Show inheritance relationships (default: true)
- `includeDependencies` (optional): Show dependencies (default: false)
- `maxDepth` (optional): Maximum relationship depth (default: 3)

**Example:**
```json
{
  "file_paths": ["/path/to/Actor1.h", "/path/to/Actor2.h"],
  "includeInheritance": true,
  "maxDepth": 3
}
```

### `generate_integration_guide`
Generate a comprehensive integration guide for a system.

**Parameters:**
- `system_name` (required): Name of the system
- `file_paths` (required): Array of C++ header file paths
- `targetAudience` (optional): "beginner", "intermediate", or "advanced"
- `includeCodeExamples` (optional): Include code examples (default: true)
- `includeBlueprints` (optional): Include Blueprint info (default: true)

**Example:**
```json
{
  "system_name": "Inventory System",
  "file_paths": ["/path/to/InventoryComponent.h", "/path/to/InventoryActor.h"],
  "targetAudience": "intermediate",
  "includeCodeExamples": true
}
```

## MCP Resource

### `unreal://docs/systems`
Access information about the documentation generation system.

## Implementation Details

### Module: `doc-generator.ts`

Located at: `src/unreal/doc-generator.ts`

**Key Classes:**
- `UnrealDocGenerator`: Main class for documentation generation
- `createDocGenerator`: Factory function for creating generator instances

**Features:**
- 1000+ lines of documentation generation logic
- Full TypeScript type safety
- Comprehensive metadata extraction
- Markdown and Mermaid output formats
- Support for comments and inline documentation

### Supported Unreal Macros

The system extracts information from:
- `UCLASS` - Unreal classes
- `USTRUCT` - Unreal structures
- `UENUM` - Unreal enumerations
- `UFUNCTION` - Unreal functions
- `UPROPERTY` - Unreal properties
- `UINTERFACE` - Unreal interfaces

### Extracted Information

For each element, the system extracts:
- **Name and type**
- **Comments and descriptions**
- **Specifiers** (BlueprintCallable, EditAnywhere, etc.)
- **Parent classes and interfaces**
- **Parameters and return types**
- **Categories and metadata**
- **Deprecation status**

## Usage Examples

### Example 1: Generate Documentation for a Class

```javascript
// Use the generate_documentation tool
{
  "tool": "generate_documentation",
  "arguments": {
    "file_path": "/UE_5.6/MyProject/Source/MyProject/MyActor.h",
    "title": "MyActor Documentation"
  }
}
```

### Example 2: Create System Diagram

```javascript
// Use the generate_system_diagram tool
{
  "tool": "generate_system_diagram",
  "arguments": {
    "file_paths": [
      "/UE_5.6/MyProject/Source/MyProject/GameMode.h",
      "/UE_5.6/MyProject/Source/MyProject/PlayerController.h",
      "/UE_5.6/MyProject/Source/MyProject/Character.h"
    ],
    "includeInheritance": true
  }
}
```

### Example 3: Generate Integration Guide

```javascript
// Use the generate_integration_guide tool
{
  "tool": "generate_integration_guide",
  "arguments": {
    "system_name": "Combat System",
    "file_paths": [
      "/UE_5.6/MyProject/Source/MyProject/CombatComponent.h",
      "/UE_5.6/MyProject/Source/MyProject/WeaponBase.h"
    ],
    "targetAudience": "intermediate"
  }
}
```

## Output Formats

### Markdown Documentation
- Standard markdown format
- Properly formatted headers, lists, and code blocks
- Metadata timestamps
- Organized by sections (Classes, Structs, Enums)

### Mermaid Diagrams
- Class diagrams showing relationships
- Inheritance hierarchies
- Property and method listings
- Rendered in any Mermaid-compatible viewer

### Integration Guides
- Step-by-step instructions
- Prerequisites and setup
- Code examples
- Blueprint integration
- Common patterns
- Troubleshooting section

## Best Practices

1. **Use descriptive comments** in your C++ code - they will be extracted into documentation
2. **Organize by categories** using UPROPERTY and UFUNCTION categories
3. **Add tooltips** for Blueprint-exposed elements
4. **Generate diagrams** for complex systems to visualize relationships
5. **Create integration guides** for reusable systems

## Limitations

- Binary .uasset Blueprint parsing is limited (requires UE Editor or Director)
- Comments must be immediately above the element they describe
- Multi-line comments are concatenated with spaces
- Deep inheritance chains may be simplified in diagrams

## Future Enhancements

Planned for Phase 3.2 continuation:
- Pattern recognition in code
- Best practice recommendations
- Anti-pattern detection
- Performance issue identification
- Cross-project documentation linking

## See Also

- [ROADMAP.md](../../ROADMAP.md) - Project roadmap and phase details
- [Phase 3.1 Code Generation](../code-generator.ts) - Related code generation tools
- [Blueprint Inspector](../blueprint-inspector.ts) - Blueprint analysis tools
