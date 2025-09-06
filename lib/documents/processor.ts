import { adminDb, FieldValue as AdminFieldValue } from '@/lib/firebase/admin';
import { upsertDocumentChunks } from '@/lib/ai/vector-search';
import { parsePdf, chunkText, chunkPdf } from '@/lib/documents/pdf-parser';

/**
 * Process a document: extract text, chunk it, generate embeddings, and store in Vertex AI Vector Search
 */
export async function processDocument(documentId: string) {
  let document: any;
  try {
    // Fetch document from Firestore
    const docRef = await adminDb.collection('documents').doc(documentId).get();

    if (!docRef.exists) {
      throw new Error('Document not found');
    }

    document = { id: docRef.id, ...docRef.data() } as any;

    if (!document.fileUrl) {
      throw new Error('Document has no file URL');
    }

    // Download file from blob storage
    const response = await fetch(document.fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();

    // Extract content based on file type
    let extractedText = '';
    let parsedChunks:
      | { text: string; pageNumber: number; images: string[] }[]
      | undefined;

    if (document.fileType === 'application/pdf') {
      const parsed = await parsePdf(fileBuffer);
      extractedText = parsed.text;
      parsedChunks = chunkPdf(parsed, {
        maxChunkSize: 1000,
        overlapSize: 200,
      });
    } else if (document.fileType === 'text/plain') {
      extractedText = new TextDecoder().decode(fileBuffer);
      parsedChunks = chunkText(extractedText, {
        maxChunkSize: 1000,
        overlapSize: 200,
      }).map((text, i) => ({ text, pageNumber: i + 1, images: [] }));
    } else {
      // For now, we'll skip other file types
      throw new Error(`Unsupported file type: ${document.fileType}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text content extracted from document');
    }

    // Update document content in database
    await adminDb.collection('documents').doc(documentId).update({
      content: extractedText,
      processedAt: AdminFieldValue.serverTimestamp(),
      status: 'processing',
    });

    const documentChunks = parsedChunks.map((chunk, i) => ({
      id: `${documentId}-chunk-${i}`,
      text: chunk.text,
      metadata: {
        documentId,
        companyId: document.companyId,
        documentTitle: document.title,
        chunkIndex: i,
        pageNumber: chunk.pageNumber,
        category: document.category || undefined,
        tags: (document.tags as string[]) || [],
      },
    }));

    // Store in Vertex AI
    const { status: upsertStatus, vectorsUpserted } =
      await upsertDocumentChunks(document.companyId, documentChunks);

    const { status: upsertStatus, vectorsUpserted } = await upsertDocumentChunks(
      document.companyId,
      documentChunks,
    );

    console.log(
      `Generated and stored ${vectorsUpserted} embedding vectors for document ${documentId}`,
    );


    // Update document status to processed
    await adminDb.collection('documents').doc(documentId).update({
      status: 'processed',
      processedAt: AdminFieldValue.serverTimestamp(),
      chunksCount: parsedChunks.length,
    });

    // Send success notification if the document has an associated user
    if (document.createdBy) {
      await notificationService.sendDocumentProcessedNotification({
        userId: document.createdBy,
        documentName: document.title,
        status: 'processed',
      });
    }

    return {
      success: upsertStatus === 'success',
      chunksProcessed: parsedChunks.length,
      vectorsStored: vectorsUpserted,
    };
  } catch (error) {
    console.error(`❌ Error processing document ${documentId}:`, error);

    // Update document with error status
    try {
      await adminDb
        .collection('documents')
        .doc(documentId)
        .update({
          status: 'failed',
          processedAt: AdminFieldValue.serverTimestamp(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }

    // Notify user of failure if we have creator information
    if (document?.createdBy) {
      try {
        await notificationService.sendDocumentProcessedNotification({
          userId: document.createdBy,
          documentName: document.title,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : undefined,
        });
      } catch (notifyError) {
        console.error('Failed to send failure notification:', notifyError);
      }
    }

    throw error;
  }
}

/**
 * Process all pending documents for a company
 */
export async function processCompanyDocuments(companyId: string) {
  // Query pending documents for the company
  const snapshot = await adminDb
    .collection('documents')
    .where('companyId', '==', companyId)
    .where('status', 'in', ['pending', 'uploaded', 'failed'])
    .get();

  const pendingDocuments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const results = [];

  for (const doc of pendingDocuments) {
    try {
      const result = await processDocument(doc.id);
      results.push({ documentId: doc.id, ...result });
    } catch (error) {
      results.push({
        documentId: doc.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
