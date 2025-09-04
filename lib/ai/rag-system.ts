import { getModel } from './vertex-config';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { GenerativeModel } from '@google-cloud/vertexai';
import { vectorSearchService } from './vector-search';

// Basic interfaces used by the RAG system. These were referenced in the
// original design but omitted in this truncated version of the file.
// They are intentionally lightweight – additional fields can be added as the
// application evolves.
interface DocumentMetadata {
  title?: string;
  [key: string]: any;
}

interface DocumentChunk {
  id: string;
  documentId: string;
  companyId: string;
  content: string;
  metadata: DocumentMetadata;
  createdAt?: any;
  embedding?: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number; // Higher score = more relevant
}

export class RAGSystem {
  private embeddingModel: GenerativeModel | null;

  constructor() {
    this.embeddingModel = this.initializeEmbeddingModel();
  }

  /**
   * Load the Vertex AI embedding model. If credentials are not available or the
   * model cannot be loaded, we fall back to `null` and the system will use a
   * keyword based search instead of semantic search.
   */
  private initializeEmbeddingModel(): GenerativeModel | null {
    try {
      const model = getModel('EMBEDDING');
      return model as GenerativeModel;
    } catch (error) {
      console.warn('⚠️ Failed to initialize embedding model:', error);
      return null;
    }
  }

  async processDocument(
    documentId: string,
    companyId: string,
    content: string,
    metadata: DocumentMetadata,
  ): Promise<void> {
    try {
      const chunks = this.splitIntoChunks(content);
      const chunksToUpsert = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const chunkId = `${documentId}_chunk_${i}`;

        const embedding = this.embeddingModel
          ? await this.generateEmbedding(chunkContent)
          : [];

        // Save chunk metadata to Firestore
        const chunkData = {
          id: chunkId,
          documentId,
          companyId,
          content: chunkContent,
          metadata: { ...metadata, section: `Part ${i + 1}` },
          createdAt: FieldValue.serverTimestamp(),
        };
        await adminDb.collection('document_chunks').doc(chunkId).set(chunkData);

        if (embedding.length > 0) {
          chunksToUpsert.push({ id: chunkId, embedding });
        }
      }

      // Upsert embeddings to Vertex AI Vector Search
      if (chunksToUpsert.length > 0) {
        await vectorSearchService.upsertChunks(chunksToUpsert);
      }

      await adminDb.collection('documents').doc(documentId).update({
        ragProcessed: true,
        chunkCount: chunks.length,
        processedAt: FieldValue.serverTimestamp(),
      });

      console.log(
        `✅ Processed and indexed ${chunks.length} chunks for document ${documentId}`,
      );
    } catch (error) {
      console.error('Error processing document for RAG:', error);
      throw error;
    }
  }

  async search(
    query: string,
    companyId: string,
    limit = 5,
  ): Promise<SearchResult[]> {
    try {
      const queryEmbedding = this.embeddingModel
        ? await this.generateEmbedding(query)
        : undefined;

      if (queryEmbedding) {
        return await this.vectorSearch(queryEmbedding, companyId, limit);
      } else {
        // Fallback to keyword search if embedding model is not available
        return await this.keywordSearch(query, companyId, limit);
      }
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  private async vectorSearch(
    queryEmbedding: number[],
    companyId: string,
    limit: number,
  ): Promise<SearchResult[]> {
    const neighbors = await vectorSearchService.findNearestNeighbors(
      queryEmbedding,
      limit,
    );
    if (!neighbors || neighbors.length === 0) {
      return [];
    }

    const chunkIds = neighbors.map((n) => n.datapoint.datapointId);

    // Fetch chunk content from Firestore based on IDs from vector search
    const chunkDocs = await adminDb
      .collection('document_chunks')
      .where('id', 'in', chunkIds)
      .get();

    const chunksById = new Map();
    chunkDocs.forEach((doc) => chunksById.set(doc.id, doc.data()));

    return neighbors
      .map((neighbor) => {
        const chunk = chunksById.get(neighbor.datapoint.datapointId);
        return {
          chunk,
          score: neighbor.distance, // Vertex AI returns distance, can be converted to similarity
        };
      })
      .filter((result) => result.chunk && result.chunk.companyId === companyId);
  }

  /**
   * Perform a very simple keyword search across stored chunks for the given
   * company. This is used as a fallback when the embedding model is not
   * available. The search is case-insensitive and scores results by the number
   * of keyword occurrences.
   */
  private async keywordSearch(
    query: string,
    companyId: string,
    limit: number,
  ): Promise<SearchResult[]> {
    const queryLower = query.toLowerCase();
    const snapshot = await adminDb
      .collection('document_chunks')
      .where('companyId', '==', companyId)
      .get();

    const results: SearchResult[] = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as DocumentChunk;
      const text = data.content.toLowerCase();
      const count = (text.match(new RegExp(queryLower, 'g')) || []).length;
      if (count > 0) {
        results.push({ chunk: data, score: count });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Generate an embedding for a given text using Vertex AI. When the model is
   * not available (e.g. during local development), an empty array is returned
   * so the caller can handle the fallback path gracefully.
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingModel) return [];

    try {
      const response = await this.embeddingModel.embedContent({
        content: { parts: [{ text }] },
      } as any);
      return response.embedding?.values || [];
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return [];
    }
  }

  /**
   * Naively split content into roughly 1000 character chunks. This keeps the
   * implementation lightweight for testing while still resembling typical RAG
   * chunking behaviour.
   */
  private splitIntoChunks(content: string, size = 1000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += size) {
      chunks.push(content.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Compute the cosine similarity between two vectors. Used primarily for
   * testing and in any future local ranking logic.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return normA && normB ? dot / (normA * normB) : 0;
  }

  /**
   * Combine search results into a single context string that can be fed into a
   * language model. Each chunk is separated by a divider for clarity.
   */
  generateContext(results: SearchResult[]): string {
    return results.map((r) => r.chunk.content).join('\n---\n');
  }
}

export const ragSystem = new RAGSystem();
