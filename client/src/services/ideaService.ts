import { apiRequest } from "./api";
import type {
  AnalyzeIdeaPayload,
  AnalyzeIdeaResponse,
  Idea,
  IdeaSummary,
} from "../types/idea";

export function getIdeas() {
  return apiRequest<IdeaSummary[]>("/ideas");
}

export function getIdeaById(id: number | string) {
  return apiRequest<Idea>(`/idea/${id}`);
}

export function analyzeIdea(payload: AnalyzeIdeaPayload) {
  return apiRequest<AnalyzeIdeaResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}