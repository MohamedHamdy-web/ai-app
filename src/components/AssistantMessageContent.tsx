"use client";

import { useEffect, useRef, useState } from "react";
import CodeBlock from "@/components/ui/CodeBlock";
import { parseContent } from "@/utils/parseContent";

type Props = {
  content: string;
  activeTool: string;
  animate: boolean;
  messageId: string;
  messageIndex: number;
  copiedCodeIndex: string | null;
  onCodeCopy: (content: string, index: string) => void;
  onAnimationStart: (messageId: string) => void;
};

export default function AssistantMessageContent({
  content,
  activeTool,
  animate,
  messageId,
  messageIndex,
  copiedCodeIndex,
  onCodeCopy,
  onAnimationStart,
}: Props) {
  const hasStartedAnimationRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(animate);
  const [visibleCharacterCount, setVisibleCharacterCount] = useState(() =>
    animate ? 0 : content.length,
  );
  const isComplete = visibleCharacterCount >= content.length;

  useEffect(() => {
    if (!animate || hasStartedAnimationRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      hasStartedAnimationRef.current = true;
      setIsAnimating(true);
      setVisibleCharacterCount(0);
      onAnimationStart(messageId);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [animate, messageId, onAnimationStart]);

  useEffect(() => {
    if (!isAnimating || isComplete) {
      return;
    }

    const typingStep = Math.max(1, Math.ceil(content.length / 140));
    const timeoutId = window.setTimeout(() => {
      setVisibleCharacterCount((currentCount) =>
        Math.min(currentCount + typingStep, content.length),
      );
    }, 18);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [content.length, isAnimating, isComplete, visibleCharacterCount]);

  useEffect(() => {
    if (!isAnimating || isComplete) {
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    });
  }, [isAnimating, isComplete, visibleCharacterCount]);

  if (isAnimating && !isComplete) {
    return (
      <p className="whitespace-pre-line text-[15px] leading-7 text-white/84">
        {content.slice(0, visibleCharacterCount)}
        <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse align-middle bg-white/60" />
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {parseContent(content).map((block, index) => {
        const codeBlockKey = `${messageId}-${messageIndex}-${index}`;

        if (block.type === "code") {
          return (
            <CodeBlock
              key={codeBlockKey}
              content={block.content}
              language={block.language}
              activeTool={activeTool}
              copyKey={codeBlockKey}
              copiedKey={copiedCodeIndex}
              onCopy={onCodeCopy}
            />
          );
        }

        return (
          <p
            key={codeBlockKey}
            className="whitespace-pre-line text-[15px] leading-7 text-white/84"
          >
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
