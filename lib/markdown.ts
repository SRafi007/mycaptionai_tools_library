function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}

function renderInlineMarkdown(input: string): string {
  let html = escapeHtml(input);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text: string, href: string) => {
    const safeHref = sanitizeUrl(href);
    if (!safeHref) return text;
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  return html;
}

export function renderMarkdown(md: string): string {
  if (!md) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const htmlParts: string[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const paragraph = paragraphBuffer.join(" ").trim();
    if (paragraph) htmlParts.push(`<p>${renderInlineMarkdown(paragraph)}</p>`);
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const listItems = listBuffer.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("");
    htmlParts.push(`<ul>${listItems}</ul>`);
    listBuffer = [];
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) return;
    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
    codeBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      const alt = escapeHtml(imageMatch[1] || "");
      const src = sanitizeUrl(imageMatch[2] || "");
      if (src) {
        htmlParts.push(`<img src="${src}" alt="${alt}" loading="lazy" decoding="async" style="max-width:100%;height:auto;border-radius:var(--radius-lg);margin:16px 0;" />`);
      }
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      htmlParts.push(`<blockquote><p>${renderInlineMarkdown(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      htmlParts.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      htmlParts.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      htmlParts.push(`<h2>${renderInlineMarkdown(trimmed.slice(2))}</h2>`);
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (inCodeBlock) flushCode();

  return htmlParts.join("\n");
}
