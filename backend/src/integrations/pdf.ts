import { readFileSync } from 'fs';
import pdf from 'pdf-parse';
import { VectorDBDocument, VectorDBProvider } from '../knowledge';

interface PDFResponse {
    text: string;
    metadata: {
        pageCount: number;
        info: any;
    }
}

const extractContent = async (filePath: string): Promise<PDFResponse> => {
    try {
        const dataBuffer = readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);

        // Clean and normalize the text
        const cleanedText = normalizeText(pdfData.text);

        return {
            text: cleanedText,
            metadata: {
                pageCount: pdfData.numpages,
                info: pdfData.info
            }
        };
    } catch (error) {
        throw new Error(`Failed to process PDF: ${error.message}`);
    }
}

/**
 * Splits PDF content into chunks suitable for vector DB ingestion
 * @param text The extracted PDF text
 * @param chunkSize Maximum size of each chunk
 * @param overlap Number of characters to overlap between chunks
 * @returns Array of text chunks
 */
const splitIntoChunks = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const chunk = text.slice(startIndex, startIndex + chunkSize);
        chunks.push(chunk);
        startIndex += chunkSize - overlap;
    }

    return chunks;
}

const normalizeText = (text: string): string => {
    return text
        .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
        .replace(/[\r\n]+/g, '\n')   // Normalize line breaks
        .trim();
}

/**
 * Converts PDF content into vector DB documents
 * @param filePath Path to the PDF file
 * @param chunkSize Maximum size of each chunk
 * @param overlap Number of characters to overlap between chunks
 * @returns Array of VectorDBDocument objects
 */
export const toVectorDocuments = async (filePath: string, chunkSize: number = 1000, overlap: number = 200): Promise<VectorDBDocument[]> => {
    try {
        // Extract content from PDF
        const content = await extractContent(filePath);

        // Split into chunks
        const chunks = splitIntoChunks(content.text, chunkSize, overlap);

        // Convert chunks to vector documents
        return chunks.map((chunk: string, index: number) => ({
            id: `${filePath}-chunk-${index}`,
            text: chunk,
            metadata: {
                source: filePath,
                chunk: index,
                ...content.metadata
            }
        }));
    } catch (error) {
        throw new Error(`Failed to convert PDF to vector documents: ${error.message}`);
    }
}

/**
 * Converts PDF content into vector DB documents with LLM processing
 * @param filePath Path to the PDF file
 * @param llmProcessor Function that processes text through LLM
 * @param chunkSize Maximum size of each chunk
 * @param overlap Number of characters to overlap between chunks
 * @returns Array of VectorDBDocument objects
 */
export const toVectorDocumentsWithLLM = async (
    filePath: string,
    llmProcessor: (text: string) => Promise<string | number[]>,
    chunkSize: number = 1000,
    overlap: number = 200
): Promise<VectorDBDocument[]> => {
    try {
        // Extract content from PDF
        const content = await extractContent(filePath);

        // Split into chunks
        const chunks = splitIntoChunks(content.text, chunkSize, overlap);

        // Process each chunk through the LLM
        const processedChunks = await Promise.all(
            chunks.map(chunk => llmProcessor(chunk))
        );
        // Convert processed chunks to vector documents
        return processedChunks.map((chunk: string | number[], index: number) => ({
            id: `${filePath}-chunk-${index}`,
            text: typeof chunk === 'string' ? chunk : chunk.toString(),
            metadata: {
                source: filePath,
                chunk: index,
                processed: true,
                ...content.metadata
            }
        }));
    } catch (error) {
        throw new Error(`Failed to convert PDF to LLM-processed vector documents: ${error.message}`);
    }
}

/**
 * Loads a PDF directly into a vector database
 * @param filePath Path to the PDF file
 * @param vectorDB Vector database provider instance
 * @param chunkSize Maximum size of each chunk
 * @param overlap Number of characters to overlap between chunks
 */
export const loadToVectorDB = async (
    filePath: string,
    vectorDB: VectorDBProvider<any>,
    chunkSize: number = 1000,
    overlap: number = 200
): Promise<void> => {
    try {
        const documents = await toVectorDocuments(filePath, chunkSize, overlap);
        await vectorDB.addDocuments(documents);
    } catch (error) {
        throw new Error(`Failed to load PDF to vector database: ${error.message}`);
    }
}


export const loadToVectorDBWithLLM = async (
    filePath: string,
    vectorDB: VectorDBProvider<any>,
    llmProcessor: (text: string) => Promise<string | number[]>,
    chunkSize: number = 1000,
    overlap: number = 200
) => {
    const documents = await toVectorDocumentsWithLLM(filePath, llmProcessor, chunkSize, overlap);
    await vectorDB.addDocuments(documents);
}
