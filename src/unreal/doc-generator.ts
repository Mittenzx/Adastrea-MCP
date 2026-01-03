/**
 * Documentation Generator for Unreal Engine 5.6
 * 
 * Generates comprehensive documentation from C++ code and Blueprint assets.
 * Features:
 * - Extract comments and metadata from C++ classes, functions, and properties
 * - Extract metadata from Blueprint assets
 * - Generate markdown documentation for systems
 * - Create system architecture diagrams (Mermaid format)
 * - Generate integration guides
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
	UnrealClass,
	UnrealFunction,
	BlueprintAsset,
	DetailedBlueprintInfo,
} from './types.js';

/**
 * Constants for documentation generation
 */
const UNREAL_MACROS = ['UCLASS', 'USTRUCT', 'UENUM', 'UFUNCTION', 'UPROPERTY'] as const;
const DEFAULT_MAX_ITEMS_IN_DIAGRAM = 5;

/**
 * Options for documentation generation
 */
export interface DocGenerationOptions {
	title?: string;
	includePrivate?: boolean;
	includeInternal?: boolean;
	format?: 'markdown' | 'html';
	includeDiagrams?: boolean;
	includeExamples?: boolean;
}

/**
 * Options for system diagram generation
 */
export interface DiagramOptions {
	format?: 'mermaid' | 'dot';
	includeInheritance?: boolean;
	includeDependencies?: boolean;
	includeComponents?: boolean;
	maxDepth?: number;
	maxItemsPerClass?: number;
}

/**
 * Options for integration guide generation
 */
export interface IntegrationGuideOptions {
	systemName: string;
	targetAudience?: 'beginner' | 'intermediate' | 'advanced';
	includeCodeExamples?: boolean;
	includeBlueprints?: boolean;
	includeCommonPatterns?: boolean;
}

/**
 * Extracted code metadata
 */
export interface CodeMetadata {
	classes: ClassMetadata[];
	functions: FunctionMetadata[];
	properties: PropertyMetadata[];
	enums: EnumMetadata[];
	structs: StructMetadata[];
}

export interface ClassMetadata {
	name: string;
	type: 'UCLASS' | 'UINTERFACE' | 'USTRUCT' | 'UENUM';
	parentClass?: string;
	description?: string;
	module?: string;
	file?: string;
	lineNumber?: number;
	specifiers?: string[];
	blueprintType?: boolean;
	blueprintable?: boolean;
	deprecated?: boolean;
	properties?: PropertyMetadata[];
	functions?: FunctionMetadata[];
	interfaces?: string[];
	metadata?: Record<string, string>;
}

export interface FunctionMetadata {
	name: string;
	className?: string;
	description?: string;
	returnType?: string;
	parameters?: Array<{
		name: string;
		type: string;
		description?: string;
		defaultValue?: string;
	}>;
	specifiers?: string[];
	blueprintCallable?: boolean;
	blueprintPure?: boolean;
	isConst?: boolean;
	isVirtual?: boolean;
	isOverride?: boolean;
	file?: string;
	lineNumber?: number;
	deprecated?: boolean;
	category?: string;
	metadata?: Record<string, string>;
}

export interface PropertyMetadata {
	name: string;
	type: string;
	className?: string;
	description?: string;
	category?: string;
	defaultValue?: string;
	specifiers?: string[];
	editAnywhere?: boolean;
	editDefaultsOnly?: boolean;
	visibleAnywhere?: boolean;
	blueprintReadOnly?: boolean;
	blueprintReadWrite?: boolean;
	replicated?: boolean;
	file?: string;
	lineNumber?: number;
	deprecated?: boolean;
	metadata?: Record<string, string>;
}

export interface EnumMetadata {
	name: string;
	description?: string;
	values: Array<{
		name: string;
		value?: number;
		description?: string;
	}>;
	file?: string;
	lineNumber?: number;
	blueprintType?: boolean;
	metadata?: Record<string, string>;
}

export interface StructMetadata {
	name: string;
	description?: string;
	properties?: PropertyMetadata[];
	file?: string;
	lineNumber?: number;
	blueprintType?: boolean;
	metadata?: Record<string, string>;
}

/**
 * Generated documentation
 */
export interface GeneratedDocumentation {
	title: string;
	content: string;
	sections?: Array<{
		title: string;
		content: string;
		level: number;
	}>;
	metadata?: {
		generatedAt: string;
		version?: string;
		author?: string;
	};
}

/**
 * Unreal Engine Documentation Generator
 */
export class UnrealDocGenerator {
	private projectPath: string;

	constructor(projectPath: string) {
		this.projectPath = projectPath;
	}

	/**
	 * Extract metadata from a C++ file
	 */
	async extractCodeMetadata(filePath: string): Promise<CodeMetadata> {
		const content = await fs.readFile(filePath, 'utf-8');
		const lines = content.split('\n');

		const metadata: CodeMetadata = {
			classes: [],
			functions: [],
			properties: [],
			enums: [],
			structs: [],
		};

		// Extract comments and metadata
		let currentComment: string[] = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Collect comment blocks
			if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
				const comment = line.replace(/^\/\/\s*/, '').replace(/^\/\*+\s*/, '').replace(/^\*\s*/, '').replace(/\*+\/$/, '').trim();
				if (comment) {
					currentComment.push(comment);
				}
				continue;
			}

			// Extract UCLASS
			if (line.startsWith('UCLASS') || line.includes('UCLASS(')) {
				const classData = this.extractClassFromLines(lines, i, currentComment.join(' '));
				if (classData) {
					metadata.classes.push(classData);
				}
				currentComment = [];
			}

			// Extract USTRUCT
			if (line.startsWith('USTRUCT') || line.includes('USTRUCT(')) {
				const structData = this.extractStructFromLines(lines, i, currentComment.join(' '));
				if (structData) {
					metadata.structs.push(structData);
				}
				currentComment = [];
			}

			// Extract UENUM
			if (line.startsWith('UENUM') || line.includes('UENUM(')) {
				const enumData = this.extractEnumFromLines(lines, i, currentComment.join(' '));
				if (enumData) {
					metadata.enums.push(enumData);
				}
				currentComment = [];
			}

			// Extract UFUNCTION
			if (line.startsWith('UFUNCTION') || line.includes('UFUNCTION(')) {
				const funcData = this.extractFunctionFromLines(lines, i, currentComment.join(' '));
				if (funcData) {
					metadata.functions.push(funcData);
				}
				currentComment = [];
			}

			// Extract UPROPERTY
			if (line.startsWith('UPROPERTY') || line.includes('UPROPERTY(')) {
				const propData = this.extractPropertyFromLines(lines, i, currentComment.join(' '));
				if (propData) {
					metadata.properties.push(propData);
				}
				currentComment = [];
			}

			// Clear comment if we hit a non-comment, non-macro line
			const isUnrealMacro = UNREAL_MACROS.some(macro => line.startsWith(macro));
			if (!isUnrealMacro) {
				currentComment = [];
			}
		}

		return metadata;
	}

	/**
	 * Extract class metadata from lines
	 */
	private extractClassFromLines(lines: string[], startIndex: number, description: string): ClassMetadata | null {
		const uclassLine = lines[startIndex].trim();
		
		// Parse UCLASS specifiers
		const specifiersMatch = uclassLine.match(/UCLASS\((.*?)\)/);
		const specifiers = specifiersMatch ? specifiersMatch[1].split(',').map(s => s.trim()) : [];
		
		// Find the class declaration
		let classLine = '';
		for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
			const line = lines[i].trim();
			if (line.startsWith('class ') || line.includes(' class ')) {
				classLine = line;
				break;
			}
		}

		if (!classLine) {
			return null;
		}

		// Extract class name and parent
		const classMatch = classLine.match(/class\s+(\w+_API\s+)?(\w+)(?:\s*:\s*public\s+(\w+))?/);
		if (!classMatch) {
			return null;
		}

		const className = classMatch[2];
		const parentClass = classMatch[3];

		return {
			name: className,
			type: 'UCLASS',
			parentClass,
			description: description || undefined,
			specifiers,
			blueprintType: specifiers.some(s => s.includes('BlueprintType')),
			blueprintable: specifiers.some(s => s.includes('Blueprintable')),
			lineNumber: startIndex + 1,
		};
	}

	/**
	 * Extract struct metadata from lines
	 */
	private extractStructFromLines(lines: string[], startIndex: number, description: string): StructMetadata | null {
		const ustructLine = lines[startIndex].trim();
		
		// Parse USTRUCT specifiers
		const specifiersMatch = ustructLine.match(/USTRUCT\((.*?)\)/);
		const specifiers = specifiersMatch ? specifiersMatch[1].split(',').map(s => s.trim()) : [];
		
		// Find the struct declaration
		let structLine = '';
		for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
			const line = lines[i].trim();
			if (line.startsWith('struct ') || line.includes(' struct ')) {
				structLine = line;
				break;
			}
		}

		if (!structLine) {
			return null;
		}

		// Extract struct name
		const structMatch = structLine.match(/struct\s+(\w+_API\s+)?(\w+)/);
		if (!structMatch) {
			return null;
		}

		const structName = structMatch[2];

		return {
			name: structName,
			description: description || undefined,
			lineNumber: startIndex + 1,
			blueprintType: specifiers.some(s => s.includes('BlueprintType')),
		};
	}

	/**
	 * Extract enum metadata from lines
	 */
	private extractEnumFromLines(lines: string[], startIndex: number, description: string): EnumMetadata | null {
		const uenumLine = lines[startIndex].trim();
		
		// Parse UENUM specifiers
		const specifiersMatch = uenumLine.match(/UENUM\((.*?)\)/);
		const specifiers = specifiersMatch ? specifiersMatch[1].split(',').map(s => s.trim()) : [];
		
		// Find the enum declaration
		let enumLine = '';
		let enumIndex = -1;
		for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
			const line = lines[i].trim();
			if (line.startsWith('enum ') || line.includes(' enum ')) {
				enumLine = line;
				enumIndex = i;
				break;
			}
		}

		if (!enumLine) {
			return null;
		}

		// Extract enum name
		const enumMatch = enumLine.match(/enum\s+(?:class\s+)?(\w+)/);
		if (!enumMatch) {
			return null;
		}

		const enumName = enumMatch[1];

		// Extract enum values
		const values: Array<{ name: string; value?: number; description?: string }> = [];
		for (let i = enumIndex + 1; i < Math.min(enumIndex + 50, lines.length); i++) {
			const line = lines[i].trim();
			if (line === '};' || line === '}') {
				break;
			}

			// Match enum value (e.g., "Value1 = 0," or "Value2,")
			const valueMatch = line.match(/(\w+)(?:\s*=\s*(\d+))?\s*,?/);
			if (valueMatch && !line.startsWith('//') && !line.startsWith('UMETA')) {
				values.push({
					name: valueMatch[1],
					value: valueMatch[2] ? parseInt(valueMatch[2]) : undefined,
				});
			}
		}

		return {
			name: enumName,
			description: description || undefined,
			values,
			lineNumber: startIndex + 1,
			blueprintType: specifiers.some(s => s.includes('BlueprintType')),
		};
	}

	/**
	 * Extract function metadata from lines
	 */
	private extractFunctionFromLines(lines: string[], startIndex: number, description: string): FunctionMetadata | null {
		const ufunctionLine = lines[startIndex].trim();
		
		// Parse UFUNCTION specifiers
		const specifiersMatch = ufunctionLine.match(/UFUNCTION\((.*?)\)/);
		const specifiers = specifiersMatch ? specifiersMatch[1].split(',').map(s => s.trim()) : [];
		
		// Find the function declaration
		let funcLine = '';
		for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
			const line = lines[i].trim();
			if (line && !line.startsWith('//') && !line.startsWith('/*')) {
				funcLine = line;
				break;
			}
		}

		if (!funcLine) {
			return null;
		}

		// Extract function signature (simplified)
		const funcMatch = funcLine.match(/(?:([\w:<>]+)\s+)?(\w+)\s*\((.*?)\)/);
		if (!funcMatch) {
			return null;
		}

		const returnType = funcMatch[1] || 'void';
		const funcName = funcMatch[2];
		const paramsStr = funcMatch[3];

		// Parse parameters
		const parameters: Array<{ name: string; type: string }> = [];
		if (paramsStr && paramsStr.trim()) {
			const paramParts = paramsStr.split(',');
			for (const part of paramParts) {
				const paramMatch = part.trim().match(/([\w:<>]+(?:\s*[*&])?)\s+(\w+)/);
				if (paramMatch) {
					parameters.push({
						type: paramMatch[1].trim(),
						name: paramMatch[2].trim(),
					});
				}
			}
		}

		// Extract category from metadata
		const categoryMatch = specifiers.find(s => s.includes('Category'));
		const category = categoryMatch ? categoryMatch.split('=')[1]?.replace(/"/g, '').trim() : undefined;

		return {
			name: funcName,
			description: description || undefined,
			returnType,
			parameters,
			specifiers,
			blueprintCallable: specifiers.some(s => s.includes('BlueprintCallable')),
			blueprintPure: specifiers.some(s => s.includes('BlueprintPure')),
			lineNumber: startIndex + 1,
			category,
		};
	}

	/**
	 * Extract property metadata from lines
	 */
	private extractPropertyFromLines(lines: string[], startIndex: number, description: string): PropertyMetadata | null {
		const upropertyLine = lines[startIndex].trim();
		
		// Parse UPROPERTY specifiers
		const specifiersMatch = upropertyLine.match(/UPROPERTY\((.*?)\)/);
		const specifiers = specifiersMatch ? specifiersMatch[1].split(',').map(s => s.trim()) : [];
		
		// Find the property declaration
		let propLine = '';
		for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
			const line = lines[i].trim();
			if (line && !line.startsWith('//') && !line.startsWith('/*')) {
				propLine = line;
				break;
			}
		}

		if (!propLine) {
			return null;
		}

		// Extract property type and name
		const propMatch = propLine.match(/([\w:<>]+(?:\s*[*&])?)\s+(\w+)\s*[;=]/);
		if (!propMatch) {
			return null;
		}

		const propType = propMatch[1].trim();
		const propName = propMatch[2].trim();

		// Extract category from metadata
		const categoryMatch = specifiers.find(s => s.includes('Category'));
		const category = categoryMatch ? categoryMatch.split('=')[1]?.replace(/"/g, '').trim() : undefined;

		return {
			name: propName,
			type: propType,
			description: description || undefined,
			category,
			specifiers,
			editAnywhere: specifiers.some(s => s.includes('EditAnywhere')),
			editDefaultsOnly: specifiers.some(s => s.includes('EditDefaultsOnly')),
			visibleAnywhere: specifiers.some(s => s.includes('VisibleAnywhere')),
			blueprintReadOnly: specifiers.some(s => s.includes('BlueprintReadOnly')),
			blueprintReadWrite: specifiers.some(s => s.includes('BlueprintReadWrite')),
			replicated: specifiers.some(s => s.includes('Replicated')),
			lineNumber: startIndex + 1,
		};
	}

	/**
	 * Generate documentation for a class or system
	 */
	async generateDocumentation(
		metadata: CodeMetadata,
		options: DocGenerationOptions = {}
	): Promise<GeneratedDocumentation> {
		const {
			title = 'Unreal Engine Documentation',
			includePrivate = false,
			format = 'markdown',
		} = options;

		let content = `# ${title}\n\n`;
		content += `*Generated on ${new Date().toISOString()}*\n\n`;
		content += `---\n\n`;

		// Generate class documentation
		if (metadata.classes.length > 0) {
			content += `## Classes\n\n`;
			for (const classData of metadata.classes) {
				content += this.generateClassDocumentation(classData, includePrivate);
			}
		}

		// Generate struct documentation
		if (metadata.structs.length > 0) {
			content += `## Structs\n\n`;
			for (const structData of metadata.structs) {
				content += this.generateStructDocumentation(structData);
			}
		}

		// Generate enum documentation
		if (metadata.enums.length > 0) {
			content += `## Enums\n\n`;
			for (const enumData of metadata.enums) {
				content += this.generateEnumDocumentation(enumData);
			}
		}

		return {
			title,
			content,
			metadata: {
				generatedAt: new Date().toISOString(),
			},
		};
	}

	/**
	 * Generate documentation for a single class
	 */
	private generateClassDocumentation(classData: ClassMetadata, includePrivate: boolean): string {
		let doc = `### ${classData.name}\n\n`;

		if (classData.description) {
			doc += `${classData.description}\n\n`;
		}

		doc += `**Type:** ${classData.type}\n\n`;

		if (classData.parentClass) {
			doc += `**Parent Class:** ${classData.parentClass}\n\n`;
		}

		if (classData.blueprintable) {
			doc += `**Blueprint:** Blueprintable\n\n`;
		}

		if (classData.specifiers && classData.specifiers.length > 0) {
			doc += `**Specifiers:** ${classData.specifiers.join(', ')}\n\n`;
		}

		// Add properties
		if (classData.properties && classData.properties.length > 0) {
			doc += `#### Properties\n\n`;
			for (const prop of classData.properties) {
				doc += `- **${prop.name}** (${prop.type})`;
				if (prop.description) {
					doc += `: ${prop.description}`;
				}
				doc += '\n';
				if (prop.category) {
					doc += `  - Category: ${prop.category}\n`;
				}
				if (prop.editAnywhere) {
					doc += `  - Editable in editor\n`;
				}
				if (prop.blueprintReadWrite) {
					doc += `  - Blueprint Read/Write\n`;
				} else if (prop.blueprintReadOnly) {
					doc += `  - Blueprint Read Only\n`;
				}
			}
			doc += '\n';
		}

		// Add functions
		if (classData.functions && classData.functions.length > 0) {
			doc += `#### Functions\n\n`;
			for (const func of classData.functions) {
				doc += `- **${func.name}**`;
				if (func.parameters && func.parameters.length > 0) {
					doc += `(${func.parameters.map(p => `${p.type} ${p.name}`).join(', ')})`;
				} else {
					doc += `()`;
				}
				if (func.returnType && func.returnType !== 'void') {
					doc += ` → ${func.returnType}`;
				}
				doc += '\n';
				if (func.description) {
					doc += `  - ${func.description}\n`;
				}
				if (func.blueprintCallable) {
					doc += `  - Blueprint Callable\n`;
				}
				if (func.category) {
					doc += `  - Category: ${func.category}\n`;
				}
			}
			doc += '\n';
		}

		doc += `---\n\n`;

		return doc;
	}

	/**
	 * Generate documentation for a single struct
	 */
	private generateStructDocumentation(structData: StructMetadata): string {
		let doc = `### ${structData.name}\n\n`;

		if (structData.description) {
			doc += `${structData.description}\n\n`;
		}

		doc += `**Type:** USTRUCT\n\n`;

		if (structData.blueprintType) {
			doc += `**Blueprint:** Blueprint Type\n\n`;
		}

		if (structData.properties && structData.properties.length > 0) {
			doc += `#### Properties\n\n`;
			for (const prop of structData.properties) {
				doc += `- **${prop.name}** (${prop.type})`;
				if (prop.description) {
					doc += `: ${prop.description}`;
				}
				doc += '\n';
			}
			doc += '\n';
		}

		doc += `---\n\n`;

		return doc;
	}

	/**
	 * Generate documentation for a single enum
	 */
	private generateEnumDocumentation(enumData: EnumMetadata): string {
		let doc = `### ${enumData.name}\n\n`;

		if (enumData.description) {
			doc += `${enumData.description}\n\n`;
		}

		doc += `**Type:** UENUM\n\n`;

		if (enumData.values.length > 0) {
			doc += `#### Values\n\n`;
			for (const value of enumData.values) {
				doc += `- **${value.name}**`;
				if (value.value !== undefined) {
					doc += ` = ${value.value}`;
				}
				if (value.description) {
					doc += `: ${value.description}`;
				}
				doc += '\n';
			}
			doc += '\n';
		}

		doc += `---\n\n`;

		return doc;
	}

	/**
	 * Generate a system architecture diagram in Mermaid format
	 */
	generateSystemDiagram(
		classes: ClassMetadata[],
		options: DiagramOptions = {}
	): string {
		const {
			format = 'mermaid',
			includeInheritance = true,
			includeDependencies = false,
			maxDepth = 3,
			maxItemsPerClass = DEFAULT_MAX_ITEMS_IN_DIAGRAM,
		} = options;

		if (format !== 'mermaid') {
			throw new Error('Only Mermaid format is currently supported');
		}

		let diagram = '```mermaid\n';
		diagram += 'classDiagram\n';

		// Add classes
		for (const classData of classes) {
			diagram += `    class ${classData.name} {\n`;
			
			// Add properties (limited for readability)
			if (classData.properties && classData.properties.length > 0) {
				for (const prop of classData.properties.slice(0, maxItemsPerClass)) {
					const visibility = prop.editAnywhere ? '+' : prop.blueprintReadOnly ? '#' : '-';
					diagram += `        ${visibility}${prop.type} ${prop.name}\n`;
				}
			}

			// Add functions (limited for readability)
			if (classData.functions && classData.functions.length > 0) {
				for (const func of classData.functions.slice(0, maxItemsPerClass)) {
					const visibility = func.blueprintCallable ? '+' : '-';
					diagram += `        ${visibility}${func.name}()`;
					if (func.returnType && func.returnType !== 'void') {
						diagram += ` ${func.returnType}`;
					}
					diagram += '\n';
				}
			}

			diagram += `    }\n`;

			// Add inheritance relationships
			if (includeInheritance && classData.parentClass) {
				diagram += `    ${classData.parentClass} <|-- ${classData.name}\n`;
			}

			// Add interface implementations
			if (classData.interfaces && classData.interfaces.length > 0) {
				for (const iface of classData.interfaces) {
					diagram += `    ${iface} <|.. ${classData.name}\n`;
				}
			}
		}

		diagram += '```\n';

		return diagram;
	}

	/**
	 * Generate an integration guide for a system
	 */
	async generateIntegrationGuide(
		systemName: string,
		metadata: CodeMetadata,
		options: IntegrationGuideOptions
	): Promise<GeneratedDocumentation> {
		const {
			targetAudience = 'intermediate',
			includeCodeExamples = true,
			includeBlueprints = true,
			includeCommonPatterns = true,
		} = options;

		let content = `# ${systemName} Integration Guide\n\n`;
		content += `*Generated on ${new Date().toISOString()}*\n\n`;
		content += `**Target Audience:** ${targetAudience.charAt(0).toUpperCase() + targetAudience.slice(1)}\n\n`;
		content += `---\n\n`;

		// Overview
		content += `## Overview\n\n`;
		content += `This guide provides instructions for integrating the ${systemName} system into your Unreal Engine project.\n\n`;

		// Prerequisites
		content += `## Prerequisites\n\n`;
		content += `- Unreal Engine 5.6 or later\n`;
		content += `- Basic understanding of C++ and Blueprints\n`;
		content += `- Familiarity with Unreal Engine's Actor and Component system\n\n`;

		// System Components
		content += `## System Components\n\n`;
		if (metadata.classes.length > 0) {
			content += `### Classes\n\n`;
			for (const classData of metadata.classes) {
				content += `- **${classData.name}**`;
				if (classData.description) {
					content += `: ${classData.description}`;
				}
				content += '\n';
			}
			content += '\n';
		}

		// Integration Steps
		content += `## Integration Steps\n\n`;
		content += `### Step 1: Add Module Dependency\n\n`;
		content += `Add the required module to your project's \`.Build.cs\` file:\n\n`;
		content += '```csharp\n';
		content += `PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore" });\n`;
		content += '```\n\n';

		content += `### Step 2: Include Headers\n\n`;
		content += `Include the necessary headers in your C++ files:\n\n`;
		content += '```cpp\n';
		for (const classData of metadata.classes.slice(0, 3)) {
			content += `#include "${classData.name}.h"\n`;
		}
		content += '```\n\n';

		if (includeCodeExamples) {
			content += `### Step 3: Basic Usage\n\n`;
			content += `Example C++ code:\n\n`;
			content += '```cpp\n';
			content += `// Create an instance (example)\n`;
			if (metadata.classes.length > 0) {
				const mainClass = metadata.classes[0];
				content += `U${mainClass.name}* MyInstance = NewObject<U${mainClass.name}>(this);\n`;
				if (mainClass.functions && mainClass.functions.length > 0) {
					const func = mainClass.functions[0];
					content += `MyInstance->${func.name}(`;
					if (func.parameters && func.parameters.length > 0) {
						content += `/* ${func.parameters.map(p => p.name).join(', ')} */`;
					}
					content += `);\n`;
				}
			}
			content += '```\n\n';
		}

		if (includeBlueprints) {
			content += `## Blueprint Integration\n\n`;
			content += `The following classes are Blueprint-compatible:\n\n`;
			const blueprintableClasses = metadata.classes.filter(c => c.blueprintable);
			if (blueprintableClasses.length > 0) {
				for (const classData of blueprintableClasses) {
					content += `- **${classData.name}**\n`;
					if (classData.functions) {
						const bpCallableFuncs = classData.functions.filter(f => f.blueprintCallable);
						if (bpCallableFuncs.length > 0) {
							content += `  - Blueprint Functions: ${bpCallableFuncs.map(f => f.name).join(', ')}\n`;
						}
					}
				}
			} else {
				content += `*No Blueprint-compatible classes found*\n`;
			}
			content += '\n';
		}

		if (includeCommonPatterns) {
			content += `## Common Patterns\n\n`;
			content += `### Pattern 1: Creating and Initializing\n\n`;
			content += `Follow this pattern when creating instances:\n\n`;
			content += '```cpp\n';
			content += `// Pattern code here\n`;
			content += '```\n\n';
		}

		// Troubleshooting
		content += `## Troubleshooting\n\n`;
		content += `### Common Issues\n\n`;
		content += `- **Issue 1:** Module not found\n`;
		content += `  - Solution: Ensure the module is added to your \`.Build.cs\` file\n\n`;
		content += `- **Issue 2:** Header not found\n`;
		content += `  - Solution: Rebuild the project and regenerate project files\n\n`;

		// Additional Resources
		content += `## Additional Resources\n\n`;
		content += `- [Unreal Engine Documentation](https://docs.unrealengine.com/)\n`;
		content += `- [API Reference](https://docs.unrealengine.com/en-US/API/)\n\n`;

		return {
			title: `${systemName} Integration Guide`,
			content,
			metadata: {
				generatedAt: new Date().toISOString(),
			},
		};
	}

	/**
	 * Extract metadata from Blueprint assets
	 */
	async extractBlueprintMetadata(blueprintInfo: DetailedBlueprintInfo): Promise<CodeMetadata> {
		const metadata: CodeMetadata = {
			classes: [],
			functions: blueprintInfo.functions?.map(f => ({
				name: f.name,
				description: f.tooltip,
				returnType: f.returnType,
				parameters: f.parameters?.map(p => ({
					name: p.name,
					type: p.type,
				})),
				category: f.category,
			})) || [],
			properties: blueprintInfo.variables?.map(v => ({
				name: v.name,
				type: v.type,
				category: v.category,
				description: v.tooltip,
				editAnywhere: v.isEditable,
				blueprintReadWrite: v.isExposed,
				replicated: v.replication !== 'None',
			})) || [],
			enums: [],
			structs: [],
		};

		// Add the Blueprint itself as a class
		const classData: ClassMetadata = {
			name: blueprintInfo.name,
			type: 'UCLASS',
			parentClass: blueprintInfo.parentClass,
			description: blueprintInfo.metadata?.description,
			blueprintType: true,
			blueprintable: true,
			properties: metadata.properties,
			functions: metadata.functions,
			interfaces: blueprintInfo.interfaces,
		};

		metadata.classes.push(classData);

		return metadata;
	}
}

/**
 * Singleton instance for easy access
 */
export const createDocGenerator = (projectPath: string): UnrealDocGenerator => {
	return new UnrealDocGenerator(projectPath);
};
