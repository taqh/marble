import { mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { CodeBlockLowlight } from "novel/extensions";
import { CodeBlockComponent } from "./code-block-component";

export const CustomCodeBlock = CodeBlockLowlight.extend({
  name: "codeBlock",

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: "plaintext",
        parseHTML: (element) => {
          const classAttribute = element.getAttribute("class");
          const languageClassPrefix = "language-";
          const languageClass = classAttribute
            ?.split(" ")
            .find((cls) => cls.startsWith(languageClassPrefix));
          return languageClass
            ? languageClass.replace(languageClassPrefix, "")
            : "plaintext";
        },
        renderHTML: (attributes) => {
          if (!attributes.language) {
            return {};
          }
          return {
            class: `language-${attributes.language}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (element) => {
          const codeElement = (element as HTMLElement).querySelector("code");
          if (!codeElement) return false;

          const classAttribute = codeElement.getAttribute("class");
          const languageClassPrefix = "language-";
          const languageClass = classAttribute
            ?.split(" ")
            .find((cls) => cls.startsWith(languageClassPrefix));

          return {
            language: languageClass
              ? languageClass.replace(languageClassPrefix, "")
              : "plaintext",
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `language-${node.attrs.language || "plaintext"}`,
      }),
      ["code", { class: `language-${node.attrs.language || "plaintext"}` }, 0],
    ];
  },
}).configure({
  lowlight: createLowlight(common),
  HTMLAttributes: {
    class: "rounded-lg border border-border bg-muted/30 overflow-hidden",
  },
});
