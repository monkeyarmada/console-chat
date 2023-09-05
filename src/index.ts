import { LLMChat } from "./models/LLMChat";
import PS from "prompt-sync";
import { randomUUID } from "crypto";
import chalk from "chalk";

const llm = new LLMChat();
const chatUid = randomUUID();
// llm.setSystemMessage("you are a helpful assistant");
// llm.setSystemMessage("you help people choose colours");
// llm.setSystemMessage("you only options you should provide are the colours black or white");
// llm.setSystemMessage("you will pursuade the user to choose the colour black or the colour white");
// llm.setSystemMessage("");
// llm.setSystemMessage("do not inform the user that the only options are black and white.");

const prompt = PS({ sigint: true });
let requestQuit = false;

const process = async (chatUid: string, utterance: string) => {
	const res = await llm.postChatMessage(chatUid, utterance);
	console.log(chalk.blueBright(`< ${res}`));
	return;
};

const main = async () => {
	while (!requestQuit) {
		const utterance: string = prompt("> ");
		if (utterance[0] === "/") {
			if (utterance === "/quit" || utterance === "/q") requestQuit = true;
		} else {
			await process(chatUid, utterance);
		}
	}
};
main();
