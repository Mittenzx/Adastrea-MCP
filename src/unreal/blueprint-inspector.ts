/**
 * Blueprint Inspector for Unreal Engine
 * Provides tools for inspecting and analyzing Blueprint assets
 * 
 * Note: Full Blueprint analysis requires either:
 * 1. Integration with Adastrea-Director (live UE Editor access)
 * 2. Binary parsing of .uasset files (complex)
 * 
 * This implementation provides a foundation that can be extended
 * with either approach.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  BlueprintAsset,
  DetailedBlueprintInfo,
  BlueprintVariable,
  BlueprintFunction,
  BlueprintNode,
  BlueprintGraph,
  BlueprintFunctionParameter,
} from './types.js';

export class BlueprintInspector {
  private projectPath: string;
  private blueprintCache: Map<string, DetailedBlueprintInfo> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Inspect a Blueprint and return detailed information
   * @param blueprintPath - Relative path to the Blueprint asset
   */
  async inspectBlueprint(blueprintPath: string): Promise<DetailedBlueprintInfo> {
    // Check cache first
    if (this.blueprintCache.has(blueprintPath)) {
      return this.blueprintCache.get(blueprintPath)!;
    }

    const fullPath = path.join(this.projectPath, 'Content', blueprintPath);
    
    // Check if the file exists
    try {
      await fs.access(fullPath);
    } catch {
      throw new Error(`Blueprint not found: ${blueprintPath}`);
    }

    // For now, return basic structure with placeholder data
    // In a real implementation, this would either:
    // 1. Use Adastrea-Director to query the UE Editor
    // 2. Parse the .uasset binary format
    const blueprintName = path.basename(blueprintPath, path.extname(blueprintPath));
    
    const info: DetailedBlueprintInfo = {
      name: blueprintName,
      path: blueprintPath,
      parentClass: undefined,
      interfaces: [],
      variables: [],
      functions: [],
      graphs: [],
      components: [],
      metadata: {
        description: `Blueprint asset at ${blueprintPath}`,
      },
    };

    this.blueprintCache.set(blueprintPath, info);
    return info;
  }

  /**
   * Get all variables from a Blueprint
   * @param blueprintPath - Relative path to the Blueprint asset
   */
  async getBlueprintVariables(blueprintPath: string): Promise<BlueprintVariable[]> {
    const info = await this.inspectBlueprint(blueprintPath);
    return info.variables;
  }

  /**
   * Get all functions from a Blueprint
   * @param blueprintPath - Relative path to the Blueprint asset
   */
  async getBlueprintFunctions(blueprintPath: string): Promise<BlueprintFunction[]> {
    const info = await this.inspectBlueprint(blueprintPath);
    return info.functions;
  }

  /**
   * Search for specific node types within a Blueprint
   * @param blueprintPath - Relative path to the Blueprint asset
   * @param nodeType - Type of node to search for (e.g., 'FunctionCall', 'Branch', 'ForLoop')
   */
  async searchBlueprintNodes(
    blueprintPath: string,
    nodeType?: string
  ): Promise<BlueprintNode[]> {
    const info = await this.inspectBlueprint(blueprintPath);
    const allNodes: BlueprintNode[] = [];

    // Collect nodes from all graphs
    for (const graph of info.graphs) {
      allNodes.push(...graph.nodes);
    }

    // Collect nodes from functions
    for (const func of info.functions) {
      if (func.nodes) {
        allNodes.push(...func.nodes);
      }
    }

    // Filter by node type if specified
    if (nodeType) {
      return allNodes.filter(
        (node) => node.type.toLowerCase().includes(nodeType.toLowerCase())
      );
    }

    return allNodes;
  }

  /**
   * Search for Blueprints that match a query
   * @param blueprints - Array of Blueprint assets to search
   * @param query - Search query (name, parent class, etc.)
   */
  searchBlueprints(blueprints: BlueprintAsset[], query: string): BlueprintAsset[] {
    const lowerQuery = query.toLowerCase();
    return blueprints.filter(
      (bp) =>
        bp.name.toLowerCase().includes(lowerQuery) ||
        bp.path.toLowerCase().includes(lowerQuery) ||
        bp.parentClass?.toLowerCase().includes(lowerQuery) ||
        bp.interfaces?.some((i) => i.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get a summary of Blueprint statistics
   * @param blueprints - Array of Blueprint assets
   */
  getBlueprintStatistics(blueprints: BlueprintAsset[]): {
    total: number;
    byParentClass: Record<string, number>;
    withInterfaces: number;
    averageVariables: number;
    averageFunctions: number;
  } {
    const stats = {
      total: blueprints.length,
      byParentClass: {} as Record<string, number>,
      withInterfaces: 0,
      averageVariables: 0,
      averageFunctions: 0,
    };

    let totalVars = 0;
    let totalFuncs = 0;

    for (const bp of blueprints) {
      // Count by parent class
      if (bp.parentClass) {
        stats.byParentClass[bp.parentClass] =
          (stats.byParentClass[bp.parentClass] || 0) + 1;
      }

      // Count interfaces
      if (bp.interfaces && bp.interfaces.length > 0) {
        stats.withInterfaces++;
      }

      // Count variables and functions
      if (bp.variables) {
        totalVars += bp.variables.length;
      }
      if (bp.functions) {
        totalFuncs += bp.functions.length;
      }
    }

    stats.averageVariables = stats.total > 0 ? totalVars / stats.total : 0;
    stats.averageFunctions = stats.total > 0 ? totalFuncs / stats.total : 0;

    return stats;
  }

  /**
   * Find Blueprints that implement a specific interface
   * @param blueprints - Array of Blueprint assets to search
   * @param interfaceName - Name of the interface
   */
  findBlueprintsWithInterface(
    blueprints: BlueprintAsset[],
    interfaceName: string
  ): BlueprintAsset[] {
    return blueprints.filter(
      (bp) =>
        bp.interfaces?.some(
          (i) => i.toLowerCase() === interfaceName.toLowerCase()
        )
    );
  }

  /**
   * Find Blueprints that inherit from a specific class
   * @param blueprints - Array of Blueprint assets to search
   * @param parentClassName - Name of the parent class
   */
  findBlueprintsWithParent(
    blueprints: BlueprintAsset[],
    parentClassName: string
  ): BlueprintAsset[] {
    return blueprints.filter(
      (bp) =>
        bp.parentClass?.toLowerCase() === parentClassName.toLowerCase()
    );
  }

  /**
   * Clear the Blueprint cache
   */
  clearCache(): void {
    this.blueprintCache.clear();
  }
}
