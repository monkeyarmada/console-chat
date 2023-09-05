# console chat

Use this quick and dirty code to chat with LLM models provided by OpenAi. 

Requires the environment variable `OPENAI_API_KEY` which should contain your OpenAi Api key.

## Usage
Make changes to `src/index.ts` to design system prompts. Build and run the app to chat to the LLM in your console. Currently the model used is `gpt-3.5-turbo`.

Build the thing
```zsh
  pnpm run build
```

Run the thing
```zsh
  pnpm run start
```

Commands

Quit the session
```
> /q 
> /quit
```
