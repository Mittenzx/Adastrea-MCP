/**
 * C++ Code Analyzer for Unreal Engine
 * Detects UCLASS, USTRUCT, UENUM, and Blueprint-callable functions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { UnrealClass, UnrealFunction } from './types.js';

export class UnrealCodeAnalyzer {
  private projectPath: string;
  private classes: Map<string, UnrealClass> = new Map();
  private functions: Map<string, UnrealFunction[]> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Scan a module directory for C++ files
   */
  async scanModule(modulePath: string): Promise<{ classes: UnrealClass[]; functions: UnrealFunction[] }> {
    const classes: UnrealClass[] = [];
    const functions: UnrealFunction[] = [];

    try {
      await this.scanDirectory(modulePath, classes, functions);
    } catch (error) {
      console.error(`Error scanning module ${modulePath}:`, error);
    }

    return { classes, functions };
  }

  /**
   * Recursively scan directory for C++ files
   */
  private async scanDirectory(
    dirPath: string,
    classes: UnrealClass[],
    functions: UnrealFunction[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, classes, functions);
        } else if (entry.name.endsWith('.h') || entry.name.endsWith('.cpp')) {
          await this.analyzeFile(fullPath, classes, functions);
        }
      }
    } catch (error) {
      // Silently skip inaccessible directories
    }
  }

  /**
   * Analyze a single C++ file
   */
  private async analyzeFile(
    filePath: string,
    classes: UnrealClass[],
    functions: UnrealFunction[]
  ): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNumber = i + 1;

        // Detect UCLASS
        if (line.startsWith('UCLASS(') || line === 'UCLASS()' || line === 'UCLASS') {
          const classInfo = this.extractClass(lines, i, 'UCLASS', filePath);
          if (classInfo) {
            classes.push(classInfo);
            this.classes.set(classInfo.name, classInfo);
          }
        }

        // Detect USTRUCT
        if (line.startsWith('USTRUCT(') || line === 'USTRUCT()' || line === 'USTRUCT') {
          const structInfo = this.extractClass(lines, i, 'USTRUCT', filePath);
          if (structInfo) {
            classes.push(structInfo);
            this.classes.set(structInfo.name, structInfo);
          }
        }

        // Detect UENUM
        if (line.startsWith('UENUM(') || line === 'UENUM()' || line === 'UENUM') {
          const enumInfo = this.extractEnum(lines, i, filePath);
          if (enumInfo) {
            classes.push(enumInfo);
            this.classes.set(enumInfo.name, enumInfo);
          }
        }

        // Detect UINTERFACE
        if (line.startsWith('UINTERFACE(') || line === 'UINTERFACE()' || line === 'UINTERFACE') {
          const interfaceInfo = this.extractClass(lines, i, 'UINTERFACE', filePath);
          if (interfaceInfo) {
            classes.push(interfaceInfo);
            this.classes.set(interfaceInfo.name, interfaceInfo);
          }
        }

        // Detect UFUNCTION
        if (line.includes('UFUNCTION(')) {
          const funcInfo = this.extractFunction(lines, i, filePath);
          if (funcInfo) {
            functions.push(funcInfo);
            
            if (!this.functions.has(funcInfo.className)) {
              this.functions.set(funcInfo.className, []);
            }
            this.functions.get(funcInfo.className)!.push(funcInfo);
          }
        }
      }
    } catch (error) {
      // Silently skip files that can't be read
    }
  }

  /**
   * Extract class/struct information
   */
  private extractClass(
    lines: string[],
    startIndex: number,
    type: 'UCLASS' | 'USTRUCT' | 'UINTERFACE',
    filePath: string
  ): UnrealClass | null {
    const specifierLine = lines[startIndex];
    const specifiers = this.extractSpecifiers(specifierLine);

    // Find the class/struct declaration
    for (let i = startIndex + 1; i < Math.min(startIndex + 10, lines.length); i++) {
      const line = lines[i].trim();
      
      let match;
      if (type === 'UCLASS' || type === 'UINTERFACE') {
        match = line.match(/class\s+\w+\s+(\w+)\s*(?::\s*public\s+(\w+))?/);
      } else {
        match = line.match(/struct\s+\w+\s+(\w+)/);
      }

      if (match) {
        return {
          name: match[1],
          type,
          parentClass: match[2],
          specifiers,
          blueprintType: specifiers.includes('BlueprintType'),
          blueprintable: specifiers.includes('Blueprintable'),
          file: filePath,
          lineNumber: i + 1
        };
      }
    }

    return null;
  }

  /**
   * Extract enum information
   */
  private extractEnum(lines: string[], startIndex: number, filePath: string): UnrealClass | null {
    const specifierLine = lines[startIndex];
    const specifiers = this.extractSpecifiers(specifierLine);

    // Find the enum declaration
    for (let i = startIndex + 1; i < Math.min(startIndex + 10, lines.length); i++) {
      const line = lines[i].trim();
      const match = line.match(/enum\s+(?:class\s+)?(\w+)/);

      if (match) {
        return {
          name: match[1],
          type: 'UENUM',
          specifiers,
          file: filePath,
          lineNumber: i + 1
        };
      }
    }

    return null;
  }

  /**
   * Extract function information
   */
  private extractFunction(lines: string[], startIndex: number, filePath: string): UnrealFunction | null {
    const specifierLine = lines[startIndex];
    const specifiers = this.extractSpecifiers(specifierLine);

    // Find the function declaration
    for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
      const line = lines[i].trim();
      
      // Simple pattern for function declaration
      const match = line.match(/(\w+)\s+(\w+)\s*\((.*?)\)/);
      if (match) {
        return {
          name: match[2],
          className: '', // Will be determined from context
          returnType: match[1],
          parameters: this.parseParameters(match[3]),
          specifiers,
          blueprintCallable: specifiers.includes('BlueprintCallable'),
          file: filePath,
          lineNumber: i + 1
        };
      }
    }

    return null;
  }

  /**
   * Extract specifiers from UCLASS/UFUNCTION/etc macros
   */
  private extractSpecifiers(line: string): string[] {
    const match = line.match(/\((.*?)\)/);
    if (!match) return [];

    const specifiersStr = match[1];
    return specifiersStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Parse function parameters
   */
  private parseParameters(paramsStr: string): Array<{ name: string; type: string }> {
    if (!paramsStr.trim()) return [];

    return paramsStr.split(',').map(param => {
      const parts = param.trim().split(/\s+/);
      if (parts.length >= 2) {
        return {
          type: parts.slice(0, -1).join(' '),
          name: parts[parts.length - 1]
        };
      }
      return { type: param.trim(), name: '' };
    });
  }

  /**
   * Get all classes
   */
  getClasses(): UnrealClass[] {
    return Array.from(this.classes.values());
  }

  /**
   * Get all functions
   */
  getFunctions(): UnrealFunction[] {
    return Array.from(this.functions.values()).flat();
  }

  /**
   * Search classes by name or type
   */
  searchClasses(query: string): UnrealClass[] {
    const lowerQuery = query.toLowerCase();
    return this.getClasses().filter(cls =>
      cls.name.toLowerCase().includes(lowerQuery) ||
      cls.type.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Find class by exact name
   */
  findClass(className: string): UnrealClass | undefined {
    return this.classes.get(className);
  }

  /**
   * Get class hierarchy
   */
  getClassHierarchy(className: string): string[] {
    const hierarchy: string[] = [];
    let currentClass = this.findClass(className);

    while (currentClass) {
      hierarchy.push(currentClass.name);
      if (currentClass.parentClass) {
        currentClass = this.findClass(currentClass.parentClass);
      } else {
        break;
      }
    }

    return hierarchy;
  }
}
