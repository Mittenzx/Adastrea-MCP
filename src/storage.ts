import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GameProject {
  name?: string;
  description?: string;
  genre?: string;
  platform?: string[];
  engine?: string;
  status?: string;
  repository_url?: string;
  team?: Array<{ name: string; role: string }>;
  features?: string[];
  technical_details?: Record<string, any>;
  timeline?: {
    started?: string;
    estimated_completion?: string;
    milestones?: Array<{
      name: string;
      date: string;
      status: string;
    }>;
  };
  custom_fields?: Record<string, any>;
}

export class GameProjectStorage {
  private dataFile: string;

  constructor(dataFile?: string) {
    // Store data file in the package root directory
    this.dataFile = dataFile || path.join(__dirname, "..", "game-project-data.json");
  }

  async getProject(): Promise<GameProject> {
    try {
      const data = await fs.readFile(this.dataFile, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      // Return empty object if file doesn't exist
      return {};
    }
  }

  async saveProject(project: GameProject): Promise<void> {
    const data = JSON.stringify(project, null, 2);
    await fs.writeFile(this.dataFile, data, "utf-8");
  }

  async clearProject(): Promise<void> {
    try {
      await fs.unlink(this.dataFile);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}
