interface PersonaAttributes {
  name: string;
  description: string;
  systemPrompt: string;
  traits?: string[];
  constraints?: string[];
}

class Persona {
  private name: string;
  private description: string;
  private systemPrompt: string;
  private traits: string[];
  private constraints: string[];

  constructor({
    name,
    description,
    systemPrompt,
    traits = [],
    constraints = []
  }: PersonaAttributes) {
    this.name = name;
    this.description = description;
    this.systemPrompt = systemPrompt;
    this.traits = traits;
    this.constraints = constraints;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getSystemPrompt(): string {
    return this.systemPrompt;
  }

  public getTraits(): string[] {
    return this.traits;
  }

  public getConstraints(): string[] {
    return this.constraints;
  }

  public addTrait(trait: string): void {
    this.traits.push(trait);
  }

  public addConstraint(constraint: string): void {
    this.constraints.push(constraint);
  }
}

export default Persona;
