/**
 * Intelligent Code Generator for Unreal Engine 5.6
 * 
 * Generates UE-compliant C++ code following best practices and conventions.
 * Supports Blueprint-compatible classes, common patterns, replication, and data assets.
 */

/**
 * Options for generating a UClass
 */
export interface UClassGenerationOptions {
  className: string;
  parentClass?: string;
  module?: string;
  blueprintType?: boolean;
  blueprintable?: boolean;
  abstract?: boolean;
  config?: string; // Config class (e.g., "Game")
  specifiers?: string[]; // Additional UCLASS specifiers
  includeHeader?: boolean;
  includeSource?: boolean;
}

/**
 * Options for generating a Blueprint-compatible C++ class
 */
export interface BlueprintCompatibleClassOptions extends UClassGenerationOptions {
  properties?: Array<{
    name: string;
    type: string;
    category?: string;
    editAnywhere?: boolean;
    blueprintReadWrite?: boolean;
    blueprintReadOnly?: boolean;
    defaultValue?: string;
    tooltip?: string;
  }>;
  functions?: Array<{
    name: string;
    returnType?: string;
    parameters?: Array<{
      name: string;
      type: string;
      isConst?: boolean;
      isReference?: boolean;
    }>;
    category?: string;
    blueprintCallable?: boolean;
    blueprintPure?: boolean;
    isConst?: boolean;
    isVirtual?: boolean;
    isOverride?: boolean;
    tooltip?: string;
  }>;
}

/**
 * Options for generating replication code
 */
export interface ReplicationOptions {
  className: string;
  properties: Array<{
    name: string;
    type: string;
    replicationType: 'Replicated' | 'ReplicatedUsing';
    repNotifyFunction?: string; // Required for ReplicatedUsing
    condition?: string; // COND_OwnerOnly, COND_SkipOwner, etc.
  }>;
  rpcs?: Array<{
    name: string;
    type: 'Server' | 'Client' | 'NetMulticast';
    reliable?: boolean;
    parameters?: Array<{
      name: string;
      type: string;
    }>;
  }>;
}

/**
 * Options for generating a data asset
 */
export interface DataAssetOptions {
  className: string;
  module?: string;
  properties: Array<{
    name: string;
    type: string;
    category?: string;
    editAnywhere?: boolean;
    defaultValue?: string;
    tooltip?: string;
  }>;
}

/**
 * Options for generating a data table row structure
 */
export interface DataTableRowOptions {
  structName: string;
  module?: string;
  properties: Array<{
    name: string;
    type: string;
    editAnywhere?: boolean;
    defaultValue?: string;
    tooltip?: string;
  }>;
}

/**
 * Code Generation Result
 */
export interface GeneratedCode {
  headerFile?: {
    filename: string;
    content: string;
  };
  sourceFile?: {
    filename: string;
    content: string;
  };
  additionalFiles?: Array<{
    filename: string;
    content: string;
  }>;
  instructions?: string;
}

/**
 * Unreal Engine Code Generator
 */
export class UnrealCodeGenerator {
  
  /**
   * Generate a basic UClass with standard UE conventions
   */
  generateUClass(options: UClassGenerationOptions): GeneratedCode {
    const {
      className,
      parentClass = 'UObject',
      module = 'YourProject',
      blueprintType = false,
      blueprintable = false,
      abstract = false,
      config,
      specifiers = [],
      includeHeader = true,
      includeSource = true,
    } = options;

    // Build UCLASS specifiers
    const classSpecifiers: string[] = [];
    
    if (blueprintType) classSpecifiers.push('BlueprintType');
    if (blueprintable) classSpecifiers.push('Blueprintable');
    if (abstract) classSpecifiers.push('Abstract');
    if (config) classSpecifiers.push(`Config=${config}`);
    classSpecifiers.push(...specifiers);

    const specifierString = classSpecifiers.length > 0 
      ? `(${classSpecifiers.join(', ')})` 
      : '()';

    // Generate API macro
    const apiMacro = `${module.toUpperCase()}_API`;

    const result: GeneratedCode = {};

    // Generate header file
    if (includeHeader) {
      const headerContent = `// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "${this.getParentClassInclude(parentClass)}"
#include "${className}.generated.h"

/**
 * ${className}
 * 
 * TODO: Add class description
 */
UCLASS${specifierString}
class ${apiMacro} ${className} : public ${parentClass}
{
\tGENERATED_BODY()

public:
\t/**
\t * Default constructor
\t */
\t${className}();

protected:
\t// Add protected members here

private:
\t// Add private members here
};
`;

      result.headerFile = {
        filename: `${className}.h`,
        content: headerContent,
      };
    }

    // Generate source file
    if (includeSource) {
      const sourceContent = `// Copyright Epic Games, Inc. All Rights Reserved.

#include "${className}.h"

${className}::${className}()
{
\t// Set default values here
}
`;

      result.sourceFile = {
        filename: `${className}.cpp`,
        content: sourceContent,
      };
    }

    result.instructions = this.generateInstructions(className, module);

    return result;
  }

  /**
   * Generate a Blueprint-compatible C++ class
   */
  generateBlueprintCompatibleClass(options: BlueprintCompatibleClassOptions): GeneratedCode {
    const {
      className,
      parentClass = 'UObject',
      module = 'YourProject',
      properties = [],
      functions = [],
      includeHeader = true,
      includeSource = true,
    } = options;

    // Force Blueprint compatibility
    const baseOptions: UClassGenerationOptions = {
      ...options,
      blueprintType: true,
      blueprintable: true,
    };

    const result = this.generateUClass(baseOptions);

    // Enhance header with properties and functions
    if (includeHeader && result.headerFile) {
      // Generate properties section
      const propertiesCode = properties.map(prop => {
        const upropSpecifiers: string[] = [];
        
        if (prop.editAnywhere) upropSpecifiers.push('EditAnywhere');
        if (prop.blueprintReadWrite) upropSpecifiers.push('BlueprintReadWrite');
        if (prop.blueprintReadOnly) upropSpecifiers.push('BlueprintReadOnly');
        if (prop.category) upropSpecifiers.push(`Category="${prop.category}"`);
        if (prop.tooltip) upropSpecifiers.push(`meta=(ToolTip="${prop.tooltip}")`);

        const specifierStr = upropSpecifiers.length > 0 
          ? `UPROPERTY(${upropSpecifiers.join(', ')})` 
          : 'UPROPERTY()';

        return `\t/** ${prop.tooltip || prop.name} */
\t${specifierStr}
\t${prop.type} ${prop.name}${prop.defaultValue ? ` = ${prop.defaultValue}` : ''};
`;
      }).join('\n');

      // Generate functions section
      const functionsCode = functions.map(func => {
        const ufuncSpecifiers: string[] = [];
        
        if (func.blueprintCallable) ufuncSpecifiers.push('BlueprintCallable');
        if (func.blueprintPure) ufuncSpecifiers.push('BlueprintPure');
        if (func.category) ufuncSpecifiers.push(`Category="${func.category}"`);
        if (func.tooltip) ufuncSpecifiers.push(`meta=(ToolTip="${func.tooltip}")`);

        const specifierStr = ufuncSpecifiers.length > 0 
          ? `UFUNCTION(${ufuncSpecifiers.join(', ')})` 
          : 'UFUNCTION()';

        const params = func.parameters?.map(p => 
          `${p.isConst ? 'const ' : ''}${p.type}${p.isReference ? '&' : ''} ${p.name}`
        ).join(', ') || '';

        const virtualKeyword = func.isVirtual ? 'virtual ' : '';
        const overrideKeyword = func.isOverride ? ' override' : '';
        const constKeyword = func.isConst ? ' const' : '';
        const returnType = func.returnType || 'void';

        return `\t/** ${func.tooltip || func.name} */
\t${specifierStr}
\t${virtualKeyword}${returnType} ${func.name}(${params})${constKeyword}${overrideKeyword};
`;
      }).join('\n');

      // Insert properties and functions into the header
      const enhancedHeader = result.headerFile.content.replace(
        'protected:\n\t// Add protected members here',
        `protected:
\t// Properties
${propertiesCode}

\t// Functions
${functionsCode}`
      );

      result.headerFile.content = enhancedHeader;
    }

    // Enhance source with function implementations
    if (includeSource && result.sourceFile && functions.length > 0) {
      const functionImpls = functions.map(func => {
        const params = func.parameters?.map(p => 
          `${p.isConst ? 'const ' : ''}${p.type}${p.isReference ? '&' : ''} ${p.name}`
        ).join(', ') || '';

        const constKeyword = func.isConst ? ' const' : '';
        const returnType = func.returnType || 'void';

        return `
${returnType} ${className}::${func.name}(${params})${constKeyword}
{
\t// TODO: Implement ${func.name}
${returnType !== 'void' ? `\treturn ${this.getDefaultReturnValue(returnType)};` : ''}
}
`;
      }).join('\n');

      result.sourceFile.content += functionImpls;
    }

    return result;
  }

  /**
   * Generate a GameMode class
   */
  generateGameMode(className: string, module: string = 'YourProject'): GeneratedCode {
    const options: BlueprintCompatibleClassOptions = {
      className,
      module,
      parentClass: 'AGameModeBase',
      blueprintType: true,
      blueprintable: true,
      functions: [
        {
          name: 'InitGame',
          returnType: 'void',
          parameters: [
            { name: 'MapName', type: 'FString', isConst: true, isReference: true },
            { name: 'Options', type: 'FString', isConst: true, isReference: true },
            { name: 'ErrorMessage', type: 'FString', isReference: true },
          ],
          category: 'Game Mode',
          tooltip: 'Initialize the game',
          isVirtual: true,
          isOverride: true,
        },
      ],
    };

    return this.generateBlueprintCompatibleClass(options);
  }

  /**
   * Generate a Character class
   */
  generateCharacter(className: string, module: string = 'YourProject'): GeneratedCode {
    const options: BlueprintCompatibleClassOptions = {
      className,
      module,
      parentClass: 'ACharacter',
      blueprintType: true,
      blueprintable: true,
      properties: [
        {
          name: 'MaxHealth',
          type: 'float',
          category: 'Character Stats',
          editAnywhere: true,
          blueprintReadWrite: true,
          defaultValue: '100.0f',
          tooltip: 'Maximum health of the character',
        },
        {
          name: 'CurrentHealth',
          type: 'float',
          category: 'Character Stats',
          blueprintReadOnly: true,
          defaultValue: '100.0f',
          tooltip: 'Current health of the character',
        },
      ],
      functions: [
        {
          name: 'TakeDamage',
          returnType: 'float',
          parameters: [
            { name: 'DamageAmount', type: 'float' },
            { name: 'DamageEvent', type: 'FDamageEvent', isConst: true, isReference: true },
            { name: 'EventInstigator', type: 'AController*' },
            { name: 'DamageCauser', type: 'AActor*' },
          ],
          category: 'Character',
          blueprintCallable: true,
          tooltip: 'Apply damage to this character',
          isVirtual: true,
          isOverride: true,
        },
        {
          name: 'GetHealthPercent',
          returnType: 'float',
          category: 'Character Stats',
          blueprintPure: true,
          isConst: true,
          tooltip: 'Get health as a percentage (0-1)',
        },
      ],
    };

    return this.generateBlueprintCompatibleClass(options);
  }

  /**
   * Generate an ActorComponent class
   */
  generateActorComponent(className: string, module: string = 'YourProject'): GeneratedCode {
    const options: BlueprintCompatibleClassOptions = {
      className,
      module,
      parentClass: 'UActorComponent',
      blueprintType: true,
      blueprintable: true,
      properties: [
        {
          name: 'bIsActive',
          type: 'bool',
          category: 'Component',
          editAnywhere: true,
          blueprintReadWrite: true,
          defaultValue: 'true',
          tooltip: 'Whether this component is currently active',
        },
      ],
      functions: [
        {
          name: 'BeginPlay',
          returnType: 'void',
          category: 'Component',
          tooltip: 'Called when the game starts',
          isVirtual: true,
          isOverride: true,
        },
        {
          name: 'TickComponent',
          returnType: 'void',
          parameters: [
            { name: 'DeltaTime', type: 'float' },
            { name: 'TickType', type: 'ELevelTick' },
            { name: 'ThisTickFunction', type: 'FActorComponentTickFunction*' },
          ],
          category: 'Component',
          tooltip: 'Called every frame',
          isVirtual: true,
          isOverride: true,
        },
      ],
    };

    const result = this.generateBlueprintCompatibleClass(options);

    // Add additional includes and implementations for ActorComponent
    if (result.headerFile) {
      result.headerFile.content = result.headerFile.content.replace(
        '#include "CoreMinimal.h"',
        `#include "CoreMinimal.h"
#include "Components/ActorComponent.h"`
      );
    }

    return result;
  }

  /**
   * Generate replication code
   */
  generateReplicationCode(options: ReplicationOptions): GeneratedCode {
    const { className, properties, rpcs = [] } = options;

    // Generate header additions
    const replicatedPropsCode = properties.map(prop => {
      const upropSpecifiers: string[] = [];
      
      if (prop.replicationType === 'Replicated') {
        upropSpecifiers.push('Replicated');
      } else if (prop.replicationType === 'ReplicatedUsing') {
        if (!prop.repNotifyFunction) {
          throw new Error(
            `Property "${prop.name}" is marked as ReplicatedUsing but no repNotifyFunction was provided.`
          );
        }
        upropSpecifiers.push(`ReplicatedUsing=${prop.repNotifyFunction}`);
      }

      const specifierStr = upropSpecifiers.length > 0 
        ? `UPROPERTY(${upropSpecifiers.join(', ')})` 
        : 'UPROPERTY()';

      return `\t${specifierStr}
\t${prop.type} ${prop.name};
`;
    }).join('\n');

    // Generate RepNotify functions
    const repNotifyFuncs = properties
      .filter(prop => prop.replicationType === 'ReplicatedUsing' && prop.repNotifyFunction)
      .map(prop => `\tUFUNCTION()
\tvoid ${prop.repNotifyFunction}();
`)
      .join('\n');

    // Generate RPC functions
    const rpcFuncs = rpcs.map(rpc => {
      const reliability = rpc.reliable !== false ? 'Reliable' : 'Unreliable';
      const specifier = `${rpc.type}, ${reliability}`;
      
      const params = rpc.parameters?.map(p => `${p.type} ${p.name}`).join(', ') || '';

      return `\tUFUNCTION(${specifier})
\tvoid ${rpc.name}(${params});

\t// Implementation function for ${rpc.name}
\tvoid ${rpc.name}_Implementation(${params});

${rpc.type === 'Server' ? `\t// Validation function for ${rpc.name}
\tbool ${rpc.name}_Validate(${params});
` : ''}`;
    }).join('\n');

    // Generate GetLifetimeReplicatedProps implementation
    const replicationCode = properties.map(prop => {
      const condition = prop.condition || 'COND_None';
      return `\tDOREPLIFETIME_CONDITION(${className}, ${prop.name}, ${condition});`;
    }).join('\n');

    const sourceAdditions = `
// Replication
void ${className}::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
\tSuper::GetLifetimeReplicatedProps(OutLifetimeProps);

${replicationCode}
}

${properties
  .filter(prop => prop.replicationType === 'ReplicatedUsing' && prop.repNotifyFunction)
  .map(prop => `
void ${className}::${prop.repNotifyFunction}()
{
\t// TODO: Handle replication notify for ${prop.name}
}
`)
  .join('\n')}

${rpcs.map(rpc => {
  const params = rpc.parameters?.map(p => `${p.type} ${p.name}`).join(', ') || '';
  return `
void ${className}::${rpc.name}_Implementation(${params})
{
\t// TODO: Implement ${rpc.name}
}

${rpc.type === 'Server' ? `bool ${className}::${rpc.name}_Validate(${params})
{
\t// TODO: Validate ${rpc.name} parameters
\treturn true;
}
` : ''}`;
}).join('\n')}
`;

    const headerAdditions = `
public:
\t// Replication
\tvirtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

${replicatedPropsCode}

${repNotifyFuncs}

${rpcFuncs}
`;

    const includeAdditions = `#include "Net/UnrealNetwork.h"`;

    return {
      additionalFiles: [
        {
          filename: `${className}_Replication.txt`,
          content: `// Add these to ${className}.h header file:
${includeAdditions}

${headerAdditions}

// Add this to ${className}.cpp source file:
${sourceAdditions}
`,
        },
      ],
      instructions: `Replication code generated for ${className}.

To use this code:
1. Add the header additions to your class declaration in ${className}.h
2. Add the source additions to ${className}.cpp
3. Ensure you have #include "Net/UnrealNetwork.h" in your .cpp file
4. Make sure your Actor has bReplicates = true in its constructor

Note: For Server RPCs, you must implement both _Implementation and _Validate functions.
`,
    };
  }

  /**
   * Generate a data asset class
   */
  generateDataAsset(options: DataAssetOptions): GeneratedCode {
    const { className, module = 'YourProject', properties } = options;

    const baseOptions: BlueprintCompatibleClassOptions = {
      className,
      module,
      parentClass: 'UDataAsset',
      blueprintType: true,
      properties: properties.map(prop => ({
        ...prop,
        editAnywhere: prop.editAnywhere !== false,
        category: prop.category || 'Data Asset',
      })),
    };

    const result = this.generateBlueprintCompatibleClass(baseOptions);

    // Add Engine/DataAsset.h include
    if (result.headerFile) {
      result.headerFile.content = result.headerFile.content.replace(
        '#include "CoreMinimal.h"',
        `#include "CoreMinimal.h"
#include "Engine/DataAsset.h"`
      );
    }

    result.instructions = `Data Asset class ${className} generated.

To use this data asset:
1. Compile your project
2. In the Content Browser, right-click and select Miscellaneous > Data Asset
3. Choose ${className} as the class
4. Name your asset and configure its properties

Data Assets are useful for storing configuration data that can be referenced by multiple actors or systems.
`;

    return result;
  }

  /**
   * Generate a data table row structure
   */
  generateDataTableRow(options: DataTableRowOptions): GeneratedCode {
    const { structName, module = 'YourProject', properties } = options;

    const apiMacro = `${module.toUpperCase()}_API`;

    // Generate properties
    const propertiesCode = properties.map(prop => {
      const upropSpecifiers: string[] = [];
      
      if (prop.editAnywhere !== false) upropSpecifiers.push('EditAnywhere');
      upropSpecifiers.push('BlueprintReadWrite');
      if (prop.tooltip) upropSpecifiers.push(`meta=(ToolTip="${prop.tooltip}")`);

      const specifierStr = upropSpecifiers.length > 0 
        ? `UPROPERTY(${upropSpecifiers.join(', ')})` 
        : 'UPROPERTY()';

      return `\t/** ${prop.tooltip || prop.name} */
\t${specifierStr}
\t${prop.type} ${prop.name}${prop.defaultValue ? ` = ${prop.defaultValue}` : ''};
`;
    }).join('\n');

    const headerContent = `// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "${structName}.generated.h"

/**
 * ${structName}
 * 
 * Data Table row structure.
 * Use this struct to create Data Tables for game configuration.
 */
USTRUCT(BlueprintType)
struct ${apiMacro} ${structName} : public FTableRowBase
{
\tGENERATED_BODY()

public:
${propertiesCode}
};
`;

    return {
      headerFile: {
        filename: `${structName}.h`,
        content: headerContent,
      },
      instructions: `Data Table row structure ${structName} generated.

To use this data table:
1. Compile your project
2. In the Content Browser, right-click and select Miscellaneous > Data Table
3. Choose ${structName} as the row structure
4. Name your data table and add rows as needed

Data Tables are useful for storing large amounts of structured data that can be easily edited by designers.
`,
    };
  }

  /**
   * Get the appropriate include for a parent class
   */
  private getParentClassInclude(parentClass: string): string {
    const includeMap: { [key: string]: string } = {
      'UObject': 'UObject/Object.h',
      'AActor': 'GameFramework/Actor.h',
      'APawn': 'GameFramework/Pawn.h',
      'ACharacter': 'GameFramework/Character.h',
      'AGameModeBase': 'GameFramework/GameModeBase.h',
      'APlayerController': 'GameFramework/PlayerController.h',
      'UActorComponent': 'Components/ActorComponent.h',
      'USceneComponent': 'Components/SceneComponent.h',
      'UDataAsset': 'Engine/DataAsset.h',
    };

    return includeMap[parentClass] || 'UObject/Object.h';
  }

  /**
   * Get a default return value for a given type.
   *
   * Note: This uses heuristics based on common Unreal types. For less common
   * or more complex types, you may need to manually adjust the generated
   * return value in the resulting C++ code.
   */
  private getDefaultReturnValue(returnType: string): string {
    const normalized = returnType.trim();

    if (normalized.includes('*')) return 'nullptr';
    if (normalized === 'bool') return 'false';

    // Common numeric and primitive alias types
    if (
      normalized === 'int8' ||
      normalized === 'int16' ||
      normalized === 'int32' ||
      normalized === 'int64' ||
      normalized === 'uint8' ||
      normalized === 'uint16' ||
      normalized === 'uint32' ||
      normalized === 'uint64' ||
      normalized === 'float' ||
      normalized === 'double'
    ) {
      return '0';
    }

    // Unreal-style structs (F*) are typically default-constructible
    if (normalized.startsWith('F')) return `${normalized}()`;

    // Common Unreal template types (TArray<>, TMap<>, TSet<>, smart pointers, etc.)
    // Prefer brace initialization for templates.
    if (normalized.startsWith('T') && normalized.includes('<')) {
      return `${normalized}{}`;
    }

    // Fallback: value-initialize the type
    return '{}';
  }

  /**
   * Generate usage instructions
   */
  private generateInstructions(className: string, module: string): string {
    return `Generated ${className} class for module ${module}.

To use this class:
1. Copy the generated files to your project's Source/${module}/ directory
2. Add the files to your project (they should be auto-detected)
3. Build your project
4. The class will be available in the editor and Blueprints

Note: Make sure to update the module name and copyright notice as needed.
`;
  }
}

/**
 * Export singleton instance
 */
export const codeGenerator = new UnrealCodeGenerator();
