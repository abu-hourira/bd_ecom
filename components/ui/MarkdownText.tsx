// components/ui/MarkdownText.tsx
import React from "react";
import Link from "next/link";

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export default function MarkdownText({ content, className = "" }: MarkdownTextProps) {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");

  return (
    <div className={`space-y-1.5 leading-relaxed break-words ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Heading 3 / 2 / 1
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={lineIdx} className="text-xs font-bold font-display text-ink mt-2 mb-1">
              {formatInline(trimmed.replace(/^###\s+/, ""))}
            </h5>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={lineIdx} className="text-sm font-bold font-display text-ink mt-2 mb-1">
              {formatInline(trimmed.replace(/^##\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={lineIdx} className="text-sm font-extrabold font-display text-ink mt-2.5 mb-1.5">
              {formatInline(trimmed.replace(/^#\s+/, ""))}
            </h3>
          );
        }

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          const bulletText = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
              <span>{formatInline(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 text-xs">
              <span className="font-bold text-forest text-[11px] shrink-0 font-mono">
                {numMatch[1]}.
              </span>
              <span>{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph line
        return (
          <p key={lineIdx} className="text-xs">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Format inline text: **bold**, *italic*, `code`, and markdown links [text](url)
 */
function formatInline(text: string): React.ReactNode[] {
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...formatBasicTokens(text.substring(lastIndex, match.index)));
    }
    const label = match[1];
    const url = match[2];
    const isExternal = url.startsWith("http") || url.startsWith("tel:") || url.startsWith("https://wa.me");

    if (isExternal) {
      parts.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest hover:underline font-bold inline-flex items-center gap-0.5"
        >
          {label} ↗
        </a>
      );
    } else {
      parts.push(
        <Link
          key={`link-${match.index}`}
          href={url}
          className="text-forest hover:underline font-bold bg-forest-soft/60 px-1.5 py-0.5 rounded-md text-[11px] inline-flex items-center gap-0.5"
        >
          {label} →
        </Link>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...formatBasicTokens(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts : [text];
}

function formatBasicTokens(text: string): React.ReactNode[] {
  // Tokenize bold `**...**` and code `` `...` ``
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      nodes.push(text.substring(lastIdx, m.index));
    }
    const token = m[1];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`bold-${m.index}`} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`code-${m.index}`}
          className="px-1.5 py-0.5 rounded bg-black/5 text-forest font-mono text-[10.5px] border border-black/5"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={`em-${m.index}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = m.index + token.length;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes.length > 0 ? nodes : [text];
}
