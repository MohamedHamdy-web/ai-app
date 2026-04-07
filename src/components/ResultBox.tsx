type Props = {
  result: string;
  loading: boolean;
};

export default function ResultBox({ result, loading }: Props) {
  return (
    <div className="mt-8 p-6 border border-gray-800 rounded-xl min-h-37.5">
      {loading ? (
        <p className="text-gray-400">Generating...</p>
      ) : (
        <p className="text-gray-300 whitespace-pre-line">{result}</p>
      )}
    </div>
  );
}
