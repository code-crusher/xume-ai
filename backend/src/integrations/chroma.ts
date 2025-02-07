import { ChromaClient, Collection, IncludeEnum } from 'chromadb';
import {
  VectorDBProvider,
  VectorDBConfig,
  VectorDBDocument,
  VectorDBResponse,
  VectorDBFactory,
} from '../knowledge';

class ChromaProvider implements VectorDBProvider<Collection> {
  db!: Collection;
  private client: ChromaClient;

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL as string
    });
  }

  async initialize(config: VectorDBConfig): Promise<void> {
    try {
      this.db = await this.client.getOrCreateCollection({
        name: config.collectionName,
      });
    } catch (error) {
      throw new Error(`Failed to initialize Chroma collection: ${error}`);
    }
  }

  async addDocuments(documents: VectorDBDocument[]): Promise<void> {
    try {
      const ids = documents.map(doc => doc.id);
      const texts = documents.map(doc => doc.text);
      const metadatas = documents.map(doc => doc.metadata || {});

      await this.db.add({
        ids,
        documents: texts,
        metadatas,
      });
    } catch (error) {
      throw new Error(`Failed to add documents to Chroma: ${error}`);
    }
  }

  async search(query: string, limit: number = 5): Promise<VectorDBResponse> {
    try {
      const startTime = Date.now();
      const results = await this.db.query({
        queryTexts: [query],
        nResults: limit,
      });

      return {
        documents: results.documents[0].map((text, index) => ({
          id: results.ids[0][index],
          text: text || '', // Convert null to empty string
          metadata: results.metadatas[0][index] || {},
        })),
        elapsed: Date.now() - startTime,
      };
    } catch (error) {
      throw new Error(`Failed to search documents in Chroma: ${error}`);
    }
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    try {
      await this.db.delete({
        ids,
      });
    } catch (error) {
      throw new Error(`Failed to delete documents from Chroma: ${error}`);
    }
  }

  async clearCollection(): Promise<void> {
    try {
      const results = await this.db.query({
        queryTexts: [''],
        nResults: 10000,
      });
      if (results.ids[0].length > 0) {
        await this.deleteDocuments(results.ids[0]);
      }
    } catch (error) {
      throw new Error(`Failed to clear collection: ${error}`);
    }
  }

  async similaritySearch(queryEmbedding: number[], topK: number): Promise<VectorDBResponse> {
    try {
      const startTime = Date.now();
      // Ensure queryEmbedding is properly formatted as a number array
      console.log("QUERY EMBEDDING", queryEmbedding);
      const results = await this.db.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK
      });

      console.log("RESULTS", results);
      
      return {
        documents: results.documents[0].map((text, index) => ({
          id: results.ids[0][index],
          text: text || '', // Convert null to empty string
          metadata: results.metadatas[0][index] || {},
        })),
        elapsed: Date.now() - startTime,
      };
    } catch (error) {
      throw new Error(`Failed to search documents in Chroma: ${error}`);
    }
  }

  async close(): Promise<void> {
    // Chroma doesn't require explicit cleanup
    return;
  }
}

// Register the provider
export const initChroma = async () => {
  VectorDBFactory.registerProvider('chroma', new ChromaProvider());
}

export { ChromaProvider };