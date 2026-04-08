import { tools } from "@/data/tools";

const fallbackTool = tools[0];

export function getToolMetadata(toolId: string) {
  return tools.find((tool) => tool.id === toolId) ?? fallbackTool;
}
