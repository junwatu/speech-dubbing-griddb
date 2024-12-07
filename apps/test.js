import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

const url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav";
const audioResponse = await fetch(url);
const buffer = await audioResponse.arrayBuffer();
const base64str = Buffer.from(buffer).toString("base64");

const response = await openai.chat.completions.create({
	model: "gpt-4o-audio-preview",
	modalities: ["text", "audio"],
	audio: { voice: "alloy", format: "wav" },
	messages: [
		{
			role: "user",
			content: [
				{ type: "text", text: "What is in this recording?" },
				{ type: "input_audio", input_audio: { data: base64str, format: "wav" } }
			]
		}
	]
});

console.log(response.choices[0]);