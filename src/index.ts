import { LLMChat } from "./models/LLMChat";
import PS from "prompt-sync";
import { randomUUID } from "crypto";
import chalk from "chalk";

const llm = new LLMChat();
const chatUid = randomUUID();
llm.setSystemMessage("You are a customer service agent.");
llm.setSystemMessage("You deal specifically with problems categorized as leaks. These problems are related to properties or real estate.");
llm.setSystemMessage("Follow the steps provided to collect information about the leak.");
llm.setSystemMessage("Only use the provided steps.");
llm.setSystemMessage("Collect information for the following variables [leak_location_answer, leak_location_classification, leak_location_property_answer, leak_location_property_classification, leak_location_other]");
llm.setSystemMessage("Start Step 1 - leak_location_answer - Ask the customer where the leak is located, in their property or not on their property, classify as own or other");
llm.setSystemMessage("Start Step 2 - leak_location_classification - Classify the answer leak_location_answer as 'own' or 'other'");
llm.setSystemMessage("Start Step 3 - If the leak is classified as 'own', continue with Own Property Steps, If the leak is classified as 'other', continue with Other Property steps.");
llm.setSystemMessage("Own Property Step 1 - leak_location_property_answer - Ask the customer where the leak is located in the property.");
llm.setSystemMessage("Own Property Step 2 - leak_location_classification - Classify the answer leak_location_property_answer as roof, shower, bath, tap, sink, pipe, toilet, other");
llm.setSystemMessage("Start Step 2 - Got to Summary Step.");
llm.setSystemMessage("Other Property Step 1 - leak_location_other - Ask the customer if the leak is on a neighbours property, or a public property.");
llm.setSystemMessage("Start Step 2 - Got to Summary Step.");
llm.setSystemMessage("Summary Step 1 - Display a table of variables");
llm.setSystemMessage("Summary Step 2 - Summarize the issue, explain where the issue is located.");

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
