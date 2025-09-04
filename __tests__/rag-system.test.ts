import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    chunksStore: new Map<string, any>(),
    setMock: vi.fn(),
    updateMock: vi.fn(),
    vectorMocks: {
      upsertChunks: vi.fn(),
      findNearestNeighbors: vi.fn(),
    },
    embedContentMock: vi.fn(async () => ({
      embedding: { values: [0.1, 0.2] },
    })),
  };
});

vi.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === 'document_chunks') {
        return {
          doc: vi.fn((id: string) => ({
            set: vi.fn((data: any) => {
              mocks.setMock(data);
              mocks.chunksStore.set(id, data);
            }),
          })),
          where: vi.fn((field: string, op: string, value: any) => ({
            get: vi.fn(async () => {
              if (field === 'id' && op === 'in') {
                const docs = value.map((id: string) => ({
                  id,
                  data: () => mocks.chunksStore.get(id),
                }));
                return { docs, forEach: (cb: any) => docs.forEach(cb) } as any;
              }
              if (field === 'companyId' && op === '==') {
                const docs = Array.from(mocks.chunksStore.values())
                  .filter((c: any) => c.companyId === value)
                  .map((c: any) => ({ id: c.id, data: () => c }));
                return { docs, forEach: (cb: any) => docs.forEach(cb) } as any;
              }
              const docs: any[] = [];
              return { docs, forEach: (cb: any) => docs.forEach(cb) } as any;
            }),
          })),
        };
      }
      if (name === 'documents') {
        return {
          doc: vi.fn(() => ({ update: mocks.updateMock })),
        };
      }
      return {};
    }),
  },
  FieldValue: { serverTimestamp: vi.fn(() => 'timestamp') },
}));

vi.mock('@/lib/ai/vector-search', () => ({
  vectorSearchService: mocks.vectorMocks,
}));

vi.mock('@/lib/ai/vertex-config', () => ({
  getModel: () => ({ embedContent: mocks.embedContentMock }),
}));

import { RAGSystem } from '@/lib/ai/rag-system';

describe('RAGSystem', () => {
  beforeEach(() => {
    mocks.chunksStore.clear();
    mocks.setMock.mockClear();
    mocks.updateMock.mockClear();
    mocks.vectorMocks.upsertChunks.mockClear();
    mocks.vectorMocks.findNearestNeighbors.mockClear();
    mocks.embedContentMock.mockClear();
  });

  it('processDocument splits text, saves chunks and upserts embeddings', async () => {
    const rag = new RAGSystem();
    await rag.processDocument('doc1', 'comp1', 'Hello world', { title: 't' });

    expect(mocks.chunksStore.size).toBe(1);
    expect(mocks.vectorMocks.upsertChunks).toHaveBeenCalledWith([
      { id: 'doc1_chunk_0', embedding: [0.1, 0.2] },
    ]);
    expect(mocks.updateMock).toHaveBeenCalled();
  });

  it('search uses vector search when embeddings are available', async () => {
    const rag = new RAGSystem();
    await rag.processDocument('doc1', 'comp1', 'Hello world', {});
    mocks.vectorMocks.findNearestNeighbors.mockResolvedValue([
      { datapoint: { datapointId: 'doc1_chunk_0' }, distance: 0.1 },
    ]);

    const results = await rag.search('Hello', 'comp1', 5);
    expect(mocks.vectorMocks.findNearestNeighbors).toHaveBeenCalled();
    expect(results.length).toBe(1);
    expect(results[0].chunk.content).toBe('Hello world');
  });

  it('search falls back to keyword search when embedding model unavailable', async () => {
    const rag = new RAGSystem();
    (rag as any).embeddingModel = null;
    mocks.chunksStore.set('chunk1', {
      id: 'chunk1',
      documentId: 'doc1',
      companyId: 'comp1',
      content: 'Benefits include health coverage',
      metadata: {},
    });

    const results = await rag.search('health', 'comp1', 5);
    expect(mocks.vectorMocks.findNearestNeighbors).not.toHaveBeenCalled();
    expect(results.length).toBe(1);
    expect(results[0].chunk.id).toBe('chunk1');
  });
});
