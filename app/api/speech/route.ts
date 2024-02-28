import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const json = await req.json();
  const { input } = json;

  return await openai.audio.speech.create({
    input,
    model: "tts-1",
    voice: "alloy",
    response_format: "mp3",
    // speed: 1.1,
  });
}
