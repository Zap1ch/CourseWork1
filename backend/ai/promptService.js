import { ChatPromptTemplate } from "@langchain/core/prompts";

// Інструкція для AI: роль, контекст, правила, формат відповіді
const SYSTEM_PROMPT = `Act as an expert consultant from SRI International using the NABC value proposition framework.

Use the following KNOWLEDGE BASE (CONTEXT) to help your analysis:
{context}

Analyze the user's startup idea based on this context and the NABC framework.

RULES:
- Respond in the SAME LANGUAGE as the startup idea.
- Do not invent statistics. If you use a number that is not given in the idea or in the context, clearly mark it as an estimate (for example: "approximately", "by rough estimate").
- Use plain text only: no markdown, no asterisks, no headings.
- Each value must be a single text string, not an array or an object.

Return ONLY valid JSON with these 4 keys:

- "need": (N) What is the specific customer need or market pain point?
- "approach": (A) What is the unique approach or solution? (Technical & Business).
- "benefit": (B) What are the specific benefits per costs for the user?
- "competition": (C) Who are the competitors and alternatives? Why is this approach superior? (If missing, suggest potential ones based on context).`;

// Шаблон: {context} і {idea} підставляються під час аналізу
export const nabcPrompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["user", "Startup Idea: {idea}"]
]);