import sanitizeHtml from "sanitize-html";

const allowedTextAlignments = [/^left$/, /^center$/, /^right$/];

function isSafeImageSrc(src?: string): boolean {
  if (!src) {
    return false;
  }

  if (src.startsWith("/uploads/")) {
    return !src.includes("..") && !src.includes("\\");
  }

  try {
    const url = new URL(src);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizePostContent(contentHtml: string): string {
  return sanitizeHtml(contentHtml, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "blockquote",
      "br",
      "a",
      "img",
      "u",
      "s",
      "pre",
      "code",
      "hr",
    ],
    allowedAttributes: {
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    allowedStyles: {
      "*": {
        "text-align": allowedTextAlignments,
      },
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      img: (_tagName, attribs) => {
        if (!isSafeImageSrc(attribs.src)) {
          const emptyAttributes: Record<string, string> = {};
          return {
            tagName: "img",
            attribs: emptyAttributes,
          };
        }

        const safeAttributes: Record<string, string> = {
          src: attribs.src,
          alt: attribs.alt ?? "",
        };

        return {
          tagName: "img",
          attribs: safeAttributes,
        };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  });
}

export function getFirstImageSrc(content: string): string | null {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

export function getPlainTextExcerpt(content: string, maxLength = 120): string {
  return content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
