"use client";

import { useEffect, useState } from "react";

type Item = {
  prompt: string;
  result: string;
};

export function useHistory() {
  const [history, setHistory] = useState<Item[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("ai-history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const addToHistory = (item: Item) => {
    const updated = [item, ...history];
    setHistory(updated);
    localStorage.setItem("ai-history", JSON.stringify(updated));
  };

  return { history, addToHistory };
}
