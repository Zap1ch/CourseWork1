export interface IdeaSummary {
  id: number;
  idea_text: string;
  created_at?: string;
}

export interface Idea extends IdeaSummary {
  need?: string;
  approach?: string;
  benefit?: string;
  competition?: string;
}

export interface AnalyzeIdeaPayload {
  idea_text: string;
}

export interface AnalyzeIdeaResponse {
  id: number;
  need: string;
  approach: string;
  benefit: string;
  competition: string;
}