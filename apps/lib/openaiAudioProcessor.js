import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

/**
 * Process an audio file using OpenAI API.
 *
 * @param {string} base64Audio - The base64-encoded string of the audio file.
 * @param {string} format - The audio file format (e.g., "wav").
 * @returns {Promise<object>} - The OpenAI API response.
 */
export async function processAudio(base64Str, language) {
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o-audio-preview",
			modalities: ["text", "audio"],
			audio: { voice: "alloy", format: "mp3" },
			messages: [
				{
					role: "system",
					content: `The user will provide an English audio. Dub the complete audio, word for word in ${language}. Keep certain words in original language for which a direct translation in ${language} does not exist.`
				},
				{
					role: "user",
					content: [
						{
							type: "input_audio",
							input_audio: {
								data: base64Str,
								format: "mp3"
							}
						}
					]
				}
			],
		});

		return response.choices[0];
	} catch (error) {
		throw new Error(`OpenAI audio processing failed: ${error.message}`);
	}
}