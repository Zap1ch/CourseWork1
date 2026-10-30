import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { config } from "../config/env.js";
import { searchContext } from "./ragService.js";
import { nabcPrompt } from "./promptService.js";
import { cleanAIField } from "../utils/cleanAIField.js";

const model = new ChatGoogleGenerativeAI({
    apiKey: config.geminiApiKey,
    modelName: "gemini-2.5-flash",
    temperature: 0.6
});

// Ланцюжок: промпт -> Gemini -> текст
const chain = RunnableSequence.from([nabcPrompt, model, new StringOutputParser()]);

// Текст відповіді -> об'єкт
function parseAIResponse(responseText) {
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(cleanJson);
    } catch (err) {
        console.error("[AI] Відповідь не є валідним JSON, зберігаю як текст");
        return { need: "Error", approach: responseText, benefit: "-", competition: "-" };
    }
}

// Аналіз ідеї: RAG -> Gemini -> очищені поля
export async function analyzeIdea(ideaText) {
    const context = await searchContext(ideaText);

    console.log("[AI] Аналізую ідею...");
    const responseText = await chain.invoke({ context, idea: ideaText });

    const analysis = parseAIResponse(responseText);

    return {
        need: cleanAIField(analysis.need),
        approach: cleanAIField(analysis.approach),
        benefit: cleanAIField(analysis.benefit),
        competition: cleanAIField(analysis.competition)
    };
}