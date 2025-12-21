"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSetting } from "@/lib/settings";

export interface GeneratedTask {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    estimated_minutes?: number;
}

const SYSTEM_PROMPT = `
You are an AI project manager helper. 
Analyze the user's prompt and break it down into actionable tasks.
Return a JSON array of tasks with the following schema:
[
    {
        "title": "Task Title",
        "description": "Markdown description of task",
        "priority": "Low" | "Medium" | "High",
        "estimated_minutes": number (optional)
    }
]
Make descriptions detailed but concise. Use Markdown for formatting.
Strictly return ONLY the JSON array.
`;

async function generateWithGemini(apiKey: string, prompt: string): Promise<GeneratedTask[]> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([SYSTEM_PROMPT, `User Request: ${prompt}`]);
    const response = result.response;
    const text = response.text();
    return parseAIResponse(text);
}

async function generateWithOpenRouter(apiKey: string, model: string, prompt: string): Promise<GeneratedTask[]> {
    const referer = process.env.OPENROUTER_SITE_URL;

    const headers: HeadersInit = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "DevHub" // Optional: Report app name
    };

    if (referer) {
        (headers as Record<string, string>)["HTTP-Referer"] = referer; // Optional: Report site URL
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API Error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "";
    return parseAIResponse(text);
}

function parseAIResponse(text: string): GeneratedTask[] {
    try {
        let cleanText = text.trim();

        // Remove markdown code blocks
        cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();

        // Extract JSON array if surrounded by other text
        const firstBracket = cleanText.indexOf('[');
        const lastBracket = cleanText.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            cleanText = cleanText.substring(firstBracket, lastBracket + 1);
        }

        const tasks = JSON.parse(cleanText);

        if (!Array.isArray(tasks)) {
            throw new Error("Response is not a valid JSON array");
        }

        return tasks as GeneratedTask[];
    } catch {
        // Log full response to server console for debugging
        console.error("Failed to parse AI response:", text);
        // Provide truncated version to user
        const snippet = text.slice(0, 200).replace(/\n/g, " ");
        throw new Error(`AI returned invalid data format. Response snippet: ${snippet}`);
    }
}

export async function generateTasksAction(prompt: string): Promise<GeneratedTask[]> {
    // Validate prompt
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
        throw new Error("Prompt cannot be empty");
    }
    if (trimmedPrompt.length > 5000) {
        throw new Error("Prompt is too long. Please keep it under 5000 characters.");
    }

    const provider = await getSetting("ai_provider") || "gemini";

    if (provider === "openrouter") {
        const apiKey = await getSetting("openrouter_api_key");
        const model = await getSetting("openrouter_model") || "meta-llama/llama-3.3-70b-instruct:free";

        if (!apiKey) throw new Error("OpenRouter API Key is not configured");
        return generateWithOpenRouter(apiKey, model, prompt);
    }

    // Default to Gemini
    const apiKey = await getSetting("gemini_api_key");
    if (!apiKey) throw new Error("Gemini API Key is not configured");
    return generateWithGemini(apiKey, prompt);
}
