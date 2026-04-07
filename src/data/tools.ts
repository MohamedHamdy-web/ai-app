export const tools = [
  {
    id: "text",
    name: "Text Generator",
    systemPrompt: (input: string) => `
You are a professional content writer.
Write a high-quality, clear, and engaging paragraph about:

${input}
`,
  },
  {
    id: "code",
    name: "Code Helper",
    systemPrompt: (input: string) => `
You are a senior software engineer.
Write clean, optimized code for the following request.
Also explain the code briefly.

Request:
${input}
`,
  },
  {
    id: "caption",
    name: "Caption Generator",
    systemPrompt: (input: string) => `
You are a social media expert.
Write 3 catchy captions with emojis for:

${input}
`,
  },
];
