import {
	ChatCompletionResponseMessage,
	ChatCompletionResponseMessageRoleEnum,
	OpenAIApi,
} from "openai";
import { OpenAiClient } from "../clients/openaAi";

export class LLMChat {
	constructor(
		private client = new OpenAiClient(new OpenAIApi()),
		private history: Record<string, Message[]> = {},
		private setupMessages: Message[] = [],
		private initial = true,
	) {}
	public setSystemMessage(message: string): void {
		this.setupMessages.push({ content: message, role: "system" });
	}

	public toChatHistory(
		chatUid: string,
		messages: ChatCompletionResponseMessage,
	) {
		this.history[chatUid].push(messages as Message);
	}

	public getChatHistory(chatUid: string) {
		return this.history[chatUid];
	}

	public async postChatMessage(
		chatUid: string,
		message: string,
	): Promise<string | undefined> {
		if (typeof this.history[chatUid] === "undefined") {
			this.history[chatUid] = this.setupMessages;
		}
		return await this.client.fetchCompletion(chatUid, message, this);
	}
}

export interface Message {
	content: string;
	name?: string;
	function_call?: {
		name: string;
		arguments: string;
	};
	role: ChatCompletionResponseMessageRoleEnum;
}
