export type Document = {
  id: string;
  name: string;
  content: string;
  collectionId: string | null;
  type: string;
  size: number; // in bytes
  added: string; // ISO 8601 date string
};

export type Collection = {
  id: string;
  name: string;
  documentIds: string[];
};

export type Citation = {
  documentId: string;
  passage: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  isLoading?: boolean;
};
