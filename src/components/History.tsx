"use client";

type Item = {
  prompt: string;
  result: string;
};

export default function History({ history }: { history: Item[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">History</h2>

      <div className="space-y-3">
        {history.map((item, i) => (
          <div
            key={i}
            className="p-3 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-900 transition"
          >
            <p className="text-sm text-gray-400 truncate">{item.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
