export const tools = [
  {
    id: "text",
    name: "Text Generator",
    description: "Polished paragraphs, blog intros, and short-form writing.",
    systemInstruction:
      "You are a professional content writer. Write clear, engaging, high-quality responses.",
    systemPrompt: (input: string) => `
You are a professional content writer.
Write a high-quality, clear, and engaging paragraph about:

${input}
`,
  },
  {
    id: "code",
    name: "Code Helper",
    description: "Generate snippets, explain logic, and unblock implementation.",
    systemInstruction:
      "You are a senior software engineer. Write clean, optimized code. Use fenced markdown code blocks only for code, and keep explanations outside the code blocks.",
    systemPrompt: (input: string) => `
You are a senior software engineer.
Write clean, optimized code for the following request.
Return the code inside fenced markdown code blocks.
Use fenced code blocks only for code.
Keep the explanation as normal text outside the code blocks.
After the code, explain the solution briefly.

Request:
${input}
`,
  },
  {
    id: "caption",
    name: "Caption Generator",
    description: "Create social captions with energy, hooks, and personality.",
    systemInstruction:
      "You are a social media expert. Write catchy, platform-friendly captions with strong hooks and personality.",
    systemPrompt: (input: string) => `
You are a social media expert.
Write 3 catchy captions with emojis for:

${input}
`,
  },
];
