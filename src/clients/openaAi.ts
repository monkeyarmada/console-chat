import { Configuration, CreateChatCompletionResponseChoicesInner, OpenAIApi } from "openai";
import { LLMChat, Message } from "../models/LLMChat";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export class OpenAiClient {
	private openAiApi;
	private completionLogFileName: string;
	private historyLogFileName: string;
	private completionsLogStream: fs.WriteStream;
	private historyLogStream: fs.WriteStream;
	constructor(
		openAiApi: OpenAIApi,
		private configuration: Configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		}),
		private model = "gpt-3.5-turbo",
	) {
		this.openAiApi = new OpenAIApi(this.configuration);
		const uuid = randomUUID();
		this.completionLogFileName =  path.join(__dirname, "..","..","logs",`${uuid}-comp-log.txt`);
		this.historyLogFileName =  path.join(__dirname, "..","..","logs",`${uuid}-hist-log.txt`);
		this.completionsLogStream = fs.createWriteStream(this.completionLogFileName, { flags:"a" });
		this.historyLogStream = fs.createWriteStream(this.historyLogFileName, { flags: "w" });
	}
	private writeLog(choices: CreateChatCompletionResponseChoicesInner[], history: Message[]) {
		this.completionsLogStream.write(JSON.stringify(choices)+"\r\n");
		this.historyLogStream.write(JSON.stringify(history)+"\r\n");
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
		this.writeLog(res.data.choices, history);
    llmChat.toChatHistory(chatUid, { role: "assistant", content: responseText });
		return responseText || "";
	}
}
