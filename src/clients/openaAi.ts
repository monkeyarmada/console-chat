import { ChatCompletionRequestMessageFunctionCall, ChatCompletionResponseMessage, Configuration, CreateChatCompletionResponse, CreateChatCompletionResponseChoicesInner, OpenAIApi } from "openai";
import { LLMChat, Message } from "../models/LLMChat";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export class OpenAiClient {
	private openAiApi;
	private completionLogFileName: string;
	private historyLogFileName: string;
	private functionsLogFileName: string;
	private completionsLogStream: fs.WriteStream;
	private historyLogStream: fs.WriteStream;
	private functionsLogStream: fs.WriteStream;
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
		this.functionsLogFileName =  path.join(__dirname, "..","..","logs",`${uuid}-func-log.txt`);
		this.completionsLogStream = fs.createWriteStream(this.completionLogFileName, { flags:"a" });
		this.historyLogStream = fs.createWriteStream(this.historyLogFileName, { flags: "w" });
		this.functionsLogStream = fs.createWriteStream(this.functionsLogFileName, { flags: "w" });
	}
	private writeLog(choices?: CreateChatCompletionResponseChoicesInner[], history?: Message[], functions?: ChatCompletionRequestMessageFunctionCall ) {
		if (choices) this.completionsLogStream.write(JSON.stringify(choices)+"\r\n");
		if (history) this.historyLogStream.write(JSON.stringify(history)+"\r\n");
		if (functions) this.functionsLogStream.write(JSON.stringify(functions)+"\r\n");
	}
	private extractResponseText(res: CreateChatCompletionResponse): string | undefined {
		return res.choices[0].message?.content;
	}; 
	private extractFunctionCall(res: CreateChatCompletionResponse): ChatCompletionRequestMessageFunctionCall | undefined {
		return res.choices[0].message?.function_call;
	}; 
	public async fetchCompletion(chatUid: string, message: Message, llmChat: LLMChat): Promise<CreateChatCompletionResponse> {
		const history = llmChat.getChatHistory(chatUid);
		const functions = llmChat.getFunctions();
		const res = await this.openAiApi.createChatCompletion({
			model: this.model,
			messages: [...history, message],
			functions: functions.length ? functions : undefined,
		});
    llmChat.toChatHistory(chatUid, message);
   return res.data;
	}
	public async fetchChatCompletion(chatUid: string, message: string, llmChat: LLMChat): Promise<string>{
		const res = await this.fetchCompletion(chatUid, { content: message, role: "user"}, llmChat);
		const history = llmChat.getChatHistory(chatUid);
		this.writeLog(res.choices, history, this.extractFunctionCall(res));
    llmChat.toChatHistory(chatUid, { role: "assistant", content: this.extractResponseText(res), function_call: this.extractFunctionCall(res) });
		const idFnResponse = res.choices[0].message?.function_call ? true : false; 
		if (idFnResponse) {
			const fnRes = await this.fetchFunctionCompletion(chatUid, { role: "function", name:res.choices[0].message?.function_call?.name, content: "ok" }, llmChat); 
			llmChat.toChatHistory(chatUid, { role: "assistant", content: this.extractResponseText(fnRes), function_call: this.extractFunctionCall(fnRes) });
			this.writeLog(fnRes.choices, history, this.extractFunctionCall(fnRes));
			return this.extractResponseText(fnRes) || "";
		}
		return this.extractResponseText(res) || "";
	}
	public async fetchFunctionCompletion(chatUid: string, message: Message, llmChat: LLMChat): Promise<CreateChatCompletionResponse> {
		const res = await this.fetchCompletion(chatUid, message, llmChat);
		return res;
		
	}
}
