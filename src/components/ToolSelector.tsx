"use client";
import { motion } from "framer-motion";

type Tool = {
  id: string;
  name: string;
};

type Props = {
  tools: Tool[];
  activeTool: string;
  setActiveTool: (id: string) => void;
};

export default function ToolSelector({
  tools,
  activeTool,
  setActiveTool,
}: Props) {
  return (
    <div className="flex gap-4 justify-center mt-6 flex-wrap">
      {tools.map((tool) => (
        <motion.button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className={`px-4 py-2 rounded-lg border transition ${
            activeTool === tool.id
              ? "bg-white text-black"
              : "border-gray-700 hover:bg-gray-800"
          }`}
        >
          {tool.name}
        </motion.button>
      ))}
    </div>
  );
}
