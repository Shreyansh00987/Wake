import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  const model = process.env.WAKE_MODEL || "gemma3:1b";

  let ollamaOnline = false;
  let availableModels: string[] = [];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${host}/api/tags`, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      ollamaOnline = true;
      const data = await res.json();
      if (Array.isArray(data.models)) {
        availableModels = data.models.map((m: any) => m.name);
      }
    }
  } catch {
    ollamaOnline = false;
  }

  return NextResponse.json({
    ollamaOnline,
    host,
    model,
    availableModels,
    fallbackActive: !ollamaOnline,
    guidance: ollamaOnline
      ? "Ollama online and ready for grounded narrative generation."
      : "Ollama is offline. Wake will seamlessly utilize deterministic template obituaries. Run 'ollama serve' to enable LLM narration.",
  });
}
