import { LLMChat } from "./models/LLMChat";
import PS from "prompt-sync";
import { randomUUID } from "crypto";
import chalk from "chalk";

const llm = new LLMChat();
const chatUid = randomUUID();
llm.setSystemMessage("You are a customer service agent.");
llm.setSystemMessage("You help people with problems related to real estate property.");
llm.setSystemMessage(
	"You will be provided with customer queries. Classify each query into categories found in the Primary catagories table."+
	"Help the user by asking questions to collecting the data specified in the required category data table"+
	"Infer required data items from the user"+
	"Once all data is collected, return the data items in a JSON structure."
	);
llm.setSystemMessage(
	"Primary catagories:"+
	"|category|description|"+
	"|---|---|"+
	"|own|Related to users property|"+
	"|other|Related to other property|"
);
llm.setSystemMessage(
	"Required category data:"+
	"|category|question|identifier|"+
	"|---|---|---|"+
	"|own|Where is the leak located?|leak_location_own|"+
	"|own|How severe is the leak?|leak_severity|"+
	"|other|Is the issue on a neighbours property?|leak_location_other|"+
	"|other|How severe is the leak?|leak_severity|"
);
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
