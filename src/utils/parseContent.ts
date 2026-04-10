export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string };

export function parseContent(text: string): ContentBlock[] {
  if (!text) return [];

  const parts = text.split(/```/);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const trimmedPart = part.trim();
      const newlineIndex = trimmedPart.indexOf("\n");

      if (newlineIndex === -1) {
        return { type: "code", content: trimmedPart, language: "" };
      }

      const firstLine = trimmedPart.slice(0, newlineIndex).trim();
      const rest = trimmedPart.slice(newlineIndex + 1);
      const languagePattern = /^[a-zA-Z0-9_+-]+$/;

      if (languagePattern.test(firstLine)) {
        return { type: "code", content: rest, language: firstLine };
      }

      return { type: "code", content: trimmedPart, language: "" };
    }

    return { type: "text", content: part };
  });
}
