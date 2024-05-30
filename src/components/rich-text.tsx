import { Component, createMemo } from 'solid-js';
import he from 'he';

module Encoding {
  export type TextTransform = (substring: string, ...args: any[]) => string;
  export class TextStyler {
    public searchFor: RegExp;
    public Transform: TextTransform;

    public exec(text: string): string {
      const newText = text.replace(this.searchFor, this.Transform);

      return newText;
    }

    constructor(searchFor: RegExp, Transform: TextTransform) {
      this.searchFor = searchFor;
      this.Transform = Transform;
    }
  }
}

/**
 * @returns A list of encodings for Rich text
 */
function getEncodings(): Encoding.TextStyler[] {
  return [
    // Bold
    new Encoding.TextStyler(/\*(.+?)\*/g, (_, text0) => {
      return `<span class="font-semibold">${he.encode(text0)}</span>`;
    }),

    // Italic
    new Encoding.TextStyler(/_(.+?)_/g, (_, text0) => {
      return `<span class="italic">${he.encode(text0)}</span>`;
    }),

    // Strikethrough
    new Encoding.TextStyler(/~(.+?)~/g, (_, text0) => {
      return `<span class="line-through">${he.encode(text0)}</span>`;
    }),

    // Monospace
    new Encoding.TextStyler(/(?:&#x60;){3}(.+?)(?:&#x60;){3}/g, (_, text0) => {
      return `<span class="font-mono">${he.encode(text0)}</span>`;
    }),

    // Inline Code
    new Encoding.TextStyler(/&#x60;(.+?)&#x60;/g, (_, text0) => {
      return `<span class="px-1 bg-button/75 rounded text-white">${he.encode(text0)}</span>`;
    }),

    // Link
    new Encoding.TextStyler(
      /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/g,
      (substring) => {
        return `<a href='${substring}' class='text-accent font-bold underline decoration-2 decoration-accent'>${substring}</a>`;
      },
    ),
  ];
}

/**
 * Formats the text based on the encodings
 * @param text The unformated text
 * @param encodings The encodings all to format the text
 * @returns The formated text
 */
function loadEncodings(text: string, encodings: Encoding.TextStyler[]): string {
  let final: string = text,
    index: number = 0;

  while (index < encodings.length) {
    const enc = encodings[index];
    final = enc.exec(final);
    index++;
  }

  return final;
}

export interface RichTextProps {
  class?: string;
  children: string;
}

const RichText: Component<RichTextProps> = (props) => {
  const formatedText = createMemo(() =>
    loadEncodings(he.encode(props.children), getEncodings()),
  );

  return <div class={props.class} innerHTML={formatedText()} />;
};

export default RichText;
