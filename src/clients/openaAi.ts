import { Configuration, CreateChatCompletionResponseChoicesInner, OpenAIApi } from "openai";
import { LLMChat, Message } from "../models/LLMChat";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export class OpenAiClient {
	private openAiApi;
	private logFileName: string;
	private logStream: fs.WriteStream;
	constructor(
		openAiApi: OpenAIApi,
		private configuration: Configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		}),
		private model = "gpt-3.5-turbo",
	) {
		this.openAiApi = new OpenAIApi(this.configuration);
		this.logFileName =  path.join(__dirname, "..","..","logs",`api-log-${randomUUID()}.txt`);
		this.logStream = fs.createWriteStream(this.logFileName, { flags:"a"});
	}
	private writeLog(choices: CreateChatCompletionResponseChoicesInner[]) {
		this.logStream.write(JSON.stringify(choices)+"\r\n");
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
		this.writeLog(res.data.choices);
    llmChat.toChatHistory(chatUid, { role: "assistant", content: responseText });
		return responseText || "";
	}
}
