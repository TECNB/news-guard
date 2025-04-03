export type TagType = 
  | 'article_title'
  | 'article_content'
  | 'llm'
  | 'search_output'
  | 'search_input'
  | 'calculate'
  | 'current_time'
  | 'session_id'
  | 'done'
  | 'sentences';

export type ChunkCallback = (tag: string, content: string) => void;
export type StartCallback = (tag: string) => void;

export interface StreamTag {
  tag: string;
  content: string;
  parent: number;
}

export interface Tag {
  name: string;
  start: boolean;
  index: number;
} 