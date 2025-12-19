/**
 * Actor Template Manager - Manages reusable actor templates/prefabs
 * 
 * This module provides functionality to:
 * - Save actors as reusable templates
 * - Instantiate actors from templates
 * - List and manage templates
 * - Track template usage
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ActorTemplate,
  CreateTemplateConfig,
  InstantiateTemplateConfig,
  SpawnActorResult,
} from './types.js';

export class ActorTemplateManager {
  private projectPath: string;
  private templatesPath: string;
  private templates: Map<string, ActorTemplate>;
  private directorBridge?: any; // Reference to Adastrea-Director bridge

  constructor(projectPath: string, directorBridge?: any) {
    this.projectPath = projectPath;
    this.directorBridge = directorBridge;
    // Store templates in a .adastrea directory in the project root
    this.templatesPath = path.join(projectPath, '.adastrea', 'actor-templates.json');
    this.templates = new Map();
    this.loadTemplates();
  }

  /**
   * Set the Director bridge for live template operations
   */
  setDirectorBridge(bridge: any): void {
    this.directorBridge = bridge;
  }

  /**
   * Load templates from disk
   */
  private loadTemplates(): void {
    try {
      if (fs.existsSync(this.templatesPath)) {
        const data = fs.readFileSync(this.templatesPath, 'utf-8');
        const templatesArray: ActorTemplate[] = JSON.parse(data);
        
        for (const template of templatesArray) {
          this.templates.set(template.id, template);
        }
      }
    } catch (error) {
      console.warn('Failed to load actor templates:', error);
    }
  }

  /**
   * Save templates to disk
   */
  private saveTemplates(): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.templatesPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const templatesArray = Array.from(this.templates.values());
      fs.writeFileSync(
        this.templatesPath,
        JSON.stringify(templatesArray, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save actor templates:', error);
      throw new Error(`Failed to save templates: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a new template from an existing actor
   * This requires Adastrea-Director to extract actor data from the live editor.
   */
  async createTemplateFromActor(config: CreateTemplateConfig): Promise<ActorTemplate> {
    // Validate configuration
    if (!config.templateName) {
      throw new Error('templateName is required');
    }

    if (!config.actorPath) {
      throw new Error('actorPath is required');
    }

    // Check for duplicate template names
    const existingTemplate = Array.from(this.templates.values()).find(
      (t) => t.name === config.templateName
    );
    if (existingTemplate) {
      throw new Error(`Template with name "${config.templateName}" already exists`);
    }

    // This is a placeholder implementation
    // Real implementation would use Adastrea-Director to extract actor data via Python:
    // actor = unreal.EditorLevelLibrary.get_actor_reference(config.actorPath)
    // components = actor.get_components_by_class(unreal.ActorComponent)
    // properties = extract_actor_properties(actor)
    
    // For now, we'll throw an error indicating Director is required
    throw new Error(
      'Creating templates from live actors requires Adastrea-Director to be running and connected to UE Editor'
    );
  }

  /**
   * Create a template manually (for testing or data-driven setup)
   */
  async createTemplateManually(template: Omit<ActorTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActorTemplate> {
    // Generate unique ID
    const id = this.generateTemplateId();
    
    const now = new Date().toISOString();
    const newTemplate: ActorTemplate = {
      ...template,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };

    // Validate template
    if (!newTemplate.name) {
      throw new Error('Template name is required');
    }
    if (!newTemplate.className) {
      throw new Error('Template className is required');
    }

    this.templates.set(id, newTemplate);
    this.saveTemplates();

    return newTemplate;
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): ActorTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * List all templates
   */
  listTemplates(filter?: { category?: string; tags?: string[] }): ActorTemplate[] {
    let templates = Array.from(this.templates.values());

    if (filter) {
      if (filter.category) {
        templates = templates.filter((t) => t.category === filter.category);
      }
      if (filter.tags && filter.tags.length > 0) {
        templates = templates.filter((t) =>
          filter.tags!.some((tag) => t.tags?.includes(tag))
        );
      }
    }

    return templates;
  }

  /**
   * Update an existing template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<Omit<ActorTemplate, 'id' | 'createdAt'>>
  ): Promise<ActorTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template with ID "${templateId}" not found`);
    }

    const updatedTemplate: ActorTemplate = {
      ...template,
      ...updates,
      id: template.id,
      createdAt: template.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(templateId, updatedTemplate);
    this.saveTemplates();

    return updatedTemplate;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      this.saveTemplates();
    }
    return deleted;
  }

  /**
   * Instantiate an actor from a template
   * This requires Adastrea-Director to spawn the actor in the live editor.
   */
  async instantiateFromTemplate(
    config: InstantiateTemplateConfig
  ): Promise<SpawnActorResult> {
    const template = this.templates.get(config.templateId);
    if (!template) {
      return {
        success: false,
        message: `Template with ID "${config.templateId}" not found`,
        error: 'Template not found',
      };
    }

    // This is a placeholder implementation
    // Real implementation would use Adastrea-Director to spawn the actor via Python:
    // 1. Spawn base actor class
    // 2. Add components from template
    // 3. Set properties from template
    // 4. Apply transform overrides from config
    
    // NOTE: Usage count should only be incremented once the actor is successfully
    // spawned. Since this placeholder implementation always fails, we do not
    // modify usage statistics here. When Director integration is complete,
    // increment usage count after successful spawn.

    return {
      success: false,
      message: 'Actor instantiation from template requires Adastrea-Director to be running and connected to UE Editor',
      error: 'Director integration required',
    };
  }

  /**
   * Get template categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const template of this.templates.values()) {
      if (template.category) {
        categories.add(template.category);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * Get all template tags
   */
  getTags(): string[] {
    const tags = new Set<string>();
    for (const template of this.templates.values()) {
      if (template.tags) {
        template.tags.forEach((tag) => tags.add(tag));
      }
    }
    return Array.from(tags).sort();
  }

  /**
   * Get template usage statistics
   */
  getUsageStats(): {
    totalTemplates: number;
    totalUsage: number;
    mostUsed: Array<{ template: ActorTemplate; usageCount: number }>;
    byCategory: Record<string, number>;
  } {
    const templates = Array.from(this.templates.values());
    const totalTemplates = templates.length;
    const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

    // Sort by usage count
    const sorted = [...templates].sort(
      (a, b) => (b.usageCount || 0) - (a.usageCount || 0)
    );
    const mostUsed = sorted.slice(0, 10).map((t) => ({
      template: t,
      usageCount: t.usageCount || 0,
    }));

    // Count by category
    const byCategory: Record<string, number> = {};
    for (const template of templates) {
      const cat = template.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    return {
      totalTemplates,
      totalUsage,
      mostUsed,
      byCategory,
    };
  }

  /**
   * Generate a unique template ID
   */
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Export templates to a JSON file
   */
  async exportTemplates(outputPath: string): Promise<void> {
    try {
      const templates = Array.from(this.templates.values());
      fs.writeFileSync(outputPath, JSON.stringify(templates, null, 2), 'utf-8');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to export templates to "${outputPath}": ${message}`);
    }
  }

  /**
   * Import templates from a JSON file
   */
  async importTemplates(inputPath: string, options?: { overwrite?: boolean }): Promise<number> {
    try {
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Template import file not found: ${inputPath}`);
      }

      const data = fs.readFileSync(inputPath, 'utf-8');

      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to parse templates JSON from "${inputPath}": ${message}`);
      }

      if (!Array.isArray(parsed)) {
        throw new Error(`Invalid template data in "${inputPath}": expected an array of templates`);
      }

      const importedTemplates = parsed as ActorTemplate[];

      let imported = 0;
      for (const template of importedTemplates) {
        // Validate template structure
        if (!template || typeof template.id !== 'string') {
          throw new Error(`Invalid template structure in "${inputPath}": each template must have a string "id" property`);
        }
        if (!template.name || typeof template.name !== 'string') {
          throw new Error(`Invalid template structure in "${inputPath}": each template must have a string "name" property`);
        }
        if (!template.className || typeof template.className !== 'string') {
          throw new Error(`Invalid template structure in "${inputPath}": each template must have a string "className" property`);
        }

        const exists = this.templates.has(template.id);
        
        if (exists && !options?.overwrite) {
          continue; // Skip existing templates unless overwrite is true
        }

        this.templates.set(template.id, template);
        imported++;
      }

      if (imported > 0) {
        this.saveTemplates();
      }

      return imported;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Failed to import templates from "${inputPath}": ${String(err)}`);
    }
  }
}
