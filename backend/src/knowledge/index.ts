export interface VectorDBDocument {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface VectorDBConfig {
  collectionName: string;
  dimensions?: number;
}

export interface VectorDBResponse {
  documents: VectorDBDocument[];
  elapsed?: number;
}

export interface VectorDBProvider<T> {
  db: T;
  initialize(config: VectorDBConfig): Promise<void>;
  addDocuments(documents: VectorDBDocument[]): Promise<void>;
  search(query: string, limit?: number): Promise<VectorDBResponse>;
  deleteDocuments(ids: string[]): Promise<void>;
  clearCollection(): Promise<void>;
  close(): Promise<void>;
  similaritySearch(queryEmbedding: any, topK: number): Promise<VectorDBResponse>;
}

class VectorDBFactory {
  private static providers: Map<string, VectorDBProvider<any>> = new Map();

  static registerProvider<T>(name: string, provider: VectorDBProvider<T>) {
    this.providers.set(name.toLowerCase(), provider);
  }

  static getProvider<T>(name: string): VectorDBProvider<T> {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`Vector DB provider '${name}' not found`);
    }
    return provider;
  }
}

// Export factory and types
export { VectorDBFactory };
