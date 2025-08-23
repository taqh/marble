"use client";

import { Button } from "@marble/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marble/ui/components/select";
import { cn } from "@marble/ui/lib/utils";
import { Check, Copy } from "@phosphor-icons/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";

interface CodeBlockComponentProps {
  node: {
    attrs: {
      language: string;
    };
  };
  updateAttributes: (attrs: { language: string }) => void;
  extension: {
    options: {
      lowlight: {
        listLanguages: () => string[];
      };
    };
  };
}

// Popular programming languages for quick access
const POPULAR_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "plaintext", label: "Plain Text" },
];

export function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
}: CodeBlockComponentProps) {
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (language: string) => {
    updateAttributes({ language });
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const codeElement = document.querySelector(
      "[data-node-view-content] pre code",
    );
    if (codeElement?.textContent) {
      try {
        await navigator.clipboard.writeText(codeElement.textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  // Get all available languages from lowlight
  const availableLanguages = extension.options.lowlight?.listLanguages() || [];

  // Combine popular languages with all available languages
  const allLanguages = [
    ...POPULAR_LANGUAGES,
    ...availableLanguages
      .filter(
        (lang) => !POPULAR_LANGUAGES.some((popular) => popular.value === lang),
      )
      .map((lang) => ({
        value: lang,
        label: lang.charAt(0).toUpperCase() + lang.slice(1),
      })),
  ];

  const currentLanguage = node.attrs.language || "plaintext";

  return (
    <NodeViewWrapper className="relative group mb-4">
      <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
        {/* Header with language selector and copy button */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto h-8 border-none bg-transparent text-xs font-mono gap-1">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="py-1">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Popular
                </div>
                {POPULAR_LANGUAGES.map((lang) => (
                  <SelectItem
                    key={lang.value}
                    value={lang.value}
                    className="text-xs"
                  >
                    {lang.label}
                  </SelectItem>
                ))}
              </div>
              {availableLanguages.length > POPULAR_LANGUAGES.length && (
                <div className="py-1 border-t border-border">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    All Languages
                  </div>
                  {allLanguages
                    .filter(
                      (lang) =>
                        !POPULAR_LANGUAGES.some(
                          (popular) => popular.value === lang.value,
                        ),
                    )
                    .map((lang) => (
                      <SelectItem
                        key={lang.value}
                        value={lang.value}
                        className="text-xs"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                </div>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Code content */}
        <div className="relative">
          <NodeViewContent
            as="pre"
            className={cn(
              "overflow-x-auto p-4 text-sm font-mono",
              "bg-transparent border-none outline-none",
              "m-0 my-0",
              "[&>code]:bg-transparent [&>code]:p-0",
            )}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
