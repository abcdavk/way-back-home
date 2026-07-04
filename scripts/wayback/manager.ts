import { Player } from "@minecraft/server";
import { Wayback, WAYBACK_PROPERTY, WaybackCreateOptions, WaybackUpdateOptions } from "../const/manager";

export class WaybackManager {
  constructor (private readonly player: Player) {}

  private load(): Wayback[] {
    const raw = this.player.getDynamicProperty(WAYBACK_PROPERTY);
    
    if (typeof raw !== "string" || raw.length === 0) {
      return [];
    }
    
    try {
      return JSON.parse(raw) as Wayback[];
    } catch {
      return [];
    }
  }

  private save(data: Wayback[]) {
    this.player.setDynamicProperty(
      WAYBACK_PROPERTY,
      JSON.stringify(data)
    );
  }
  
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  getAll(): Wayback[] {
    return this.load();
  }
  
  get(id: string): Wayback | undefined {
    return this.load().find(w => w.id === id);
  }
  
  getByLabel(label: string): Wayback | undefined {
    return this.load().find(
      w => w.label.toLowerCase() === label.toLowerCase()
    );
  }

  create(options: WaybackCreateOptions): Wayback {
    
    const waybacks = this.load();
    
    if (waybacks.some(w => w.label === options.label)) {
      throw new Error("wayback already exists.");
    }
    
    const wayback: Wayback = {
      id: this.generateId(),
      label: options.label,
      location: options.location,
      dimension: options.dimension ?? this.player.dimension.id,
      createdAt: Date.now(),
      appearance: options.appearance
    };
    
    waybacks.push(wayback);
    
    this.save(waybacks);
    
    return wayback;
  }

  update(
    id: string,
    options: WaybackUpdateOptions
  ): boolean {
    
    const waybacks = this.load();
    
    const wayback = waybacks.find(w => w.id === id);
    
    if (!wayback)
      return false;
    
    if (options.label !== undefined)
      wayback.label = options.label;
    
    if (options.location !== undefined)
      wayback.location = options.location;
    
    if (options.dimension !== undefined)
      wayback.dimension = options.dimension;
    
    if (options.appearance !== undefined)
      wayback.appearance = options.appearance;
    
    this.save(waybacks);
    
    return true;
  }

  clear() {
    this.save([]);
  }

  remove(id: string): boolean {
    const waybacks = this.load();

    const index = waybacks.findIndex(w => w.id === id);

    if (index === -1) {
      return false;
    }

    waybacks.splice(index, 1);

    this.save(waybacks);

    return true;
  }
}