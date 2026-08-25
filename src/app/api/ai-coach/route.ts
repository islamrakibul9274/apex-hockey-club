import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!groq) {
      return NextResponse.json({
        reply: "Hello athlete! I'm your Apex Hockey AI Coach. You can ask me about skating drills, wrist shot mechanics, skate hollow sharpening, stick flex ratings, or tournament match tactics!",
      });
    }

    const systemPrompt = {
      role: "system" as const,
      content: `You are Coach Wayne, the Head AI Hockey Coach & Gear Specialist at Apex Hockey Club.
You provide encouraging, highly knowledgeable, tactical, and gear-specific hockey advice to athletes, parents, and fans.
Keep your answers engaging, punchy, concise (2-4 paragraphs max), and formatted with bullet points where appropriate.
If asked about Apex Hockey programs, recommend our Junior Development (ages 6-12), Teen Academy (13-17), or Professional League Masterclass.
Never output thinking process tags like <think> or </think>. Return only the direct coaching advice.`,
    };

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [systemPrompt, ...(messages || [{ role: "user", content: "Hello coach!" }])],
      max_tokens: 400,
      temperature: 0.7,
    });

    let rawReply = completion.choices[0]?.message?.content || "";
    // Clean any <think> tags
    rawReply = rawReply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return NextResponse.json({
      reply: rawReply || "Great to see you on the rink! How can I help sharpen your game today?",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI coach service temporarily unavailable";
    return NextResponse.json({
      reply: "Coach Wayne here! Always keep your knees bent, head up, and stick on the ice. What drills or gear questions do you have today?",
      error: msg,
    });
  }
}
