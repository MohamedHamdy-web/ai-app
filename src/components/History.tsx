"use client";

import { motion } from "framer-motion";

type Item = {
  prompt: string;
  result: string;
};

type Props = {
  history: Item[];
  onSelect: (item: Item) => void;
};

export default function History({ history, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">History</h2>

      <div className="space-y-3">
        {history.map((item, i) => (
          <motion.div
            key={i}
            onClick={() => onSelect(item)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="p-4 rounded-xl text-black cursor-pointer border transition bg-gray-400 hover:bg-gray-200"
          >
            <p className="text-sm font-medium truncate">{item.prompt}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
