import { ChatCompletionResponseMessage, Configuration, CreateChatCompletionResponseChoicesInner, OpenAIApi } from "openai";
import { LLMChat, Message } from "../models/LLMChat";

export class OpenAiClient {
	private openAiApi;

	constructor(
		openAiApi: OpenAIApi,
		private configuration: Configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		}),
		private model = "gpt-3.5-turbo",
	) {
		this.openAiApi = new OpenAIApi(this.configuration);
	}
	public async fetchCompletion(chatUid: string, message: string, llmChat: LLMChat): Promise<string> {
		const history = llmChat.getChatHistory(chatUid);
		const msg: Message = { content: message, role: "user" };
		const res = await this.openAiApi.createChatCompletion({
			model: this.model,
			messages: [...history, msg],
		});
    llmChat.toChatHistory(chatUid, { role: "user", content: message});
    const responseText = res.data.choices[0].message?.content;
    llmChat.toChatHistory(chatUid, { role: "assistant", content: responseText });
		return responseText || "";
	}
}
