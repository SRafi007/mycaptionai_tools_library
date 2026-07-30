export interface OurToolFeature {
  title: string;
  description: string;
  icon: string;
}

export interface OurToolUseCase {
  title: string;
  description: string;
}

export interface OurToolStat {
  label: string;
  value: string;
}

export interface OurToolFaq {
  question: string;
  answer: string;
}

export interface OurToolCapability {
  title: string;
  badge?: string;
  color: string;
  icon: "pdf-editor" | "merge" | "split" | "compress" | "pdf-word" | "and-more" | "md-editor" | "md-pdf" | "md-docx" | "pdf-md" | "md-html";
}

export interface OurToolServiceItem {
  title: string;
  subtitle?: string;
  description: string;
  format?: string;
  badge?: string;
}

export interface OurTool {
  id: string;
  slug: string;
  aliases: string[];
  name: string;
  subtitle: string;
  tagline: string;
  shortDescription: string;
  description: string;
  externalUrl: string;
  badge: string;
  category: string;
  icon: "file-text" | "edit-3" | "file-code" | "sparkles";
  accentColor: string;
  capabilities: OurToolCapability[];
  services: OurToolServiceItem[];
  presentationItems: string[];
  features: OurToolFeature[];
  useCases: OurToolUseCase[];
  stats: OurToolStat[];
  faq: OurToolFaq[];
  metaTitle: string;
  metaDescription: string;
}

export const OUR_TOOLS: OurTool[] = [
  {
    id: "pdf-editor",
    slug: "pdf-editor",
    aliases: ["pdf-editor", "pdflover", "pdf", "pdf-lover"],
    name: "PDF Editor",
    subtitle: "By MyCaptionAI",
    tagline: "Edit, Merge, Split & Convert PDFs Direct in Your Browser",
    shortDescription: "Combine PDFs in the order you want, split, compress, and convert PDF documents to Word, Excel, and more instantly.",
    description: "PDF Editor by PDF Lover (MyCaptionAI) is a lightweight, secure web utility that empowers creators, students, and professionals to modify PDF documents instantly. Operating with zero server retention, all file actions are executed locally in your browser for maximum privacy and performance.",
    externalUrl: "https://pdflover.mycaptionai.com/",
    badge: "Free & Private Suite",
    category: "Document Productivity",
    icon: "file-text",
    accentColor: "#ef4444",
    capabilities: [
      { title: "PDF Editor", color: "#ef4444", icon: "pdf-editor" },
      { title: "Merge PDF", badge: "POPULAR", color: "#f43f5e", icon: "merge" },
      { title: "Split PDF", color: "#f97316", icon: "split" },
      { title: "Compress PDF", color: "#10b981", icon: "compress" },
      { title: "PDF to Word", color: "#3b82f6", icon: "pdf-word" },
      { title: "And More", color: "#8b5cf6", icon: "and-more" }
    ],
    services: [
      {
        title: "Edit PDF",
        subtitle: "Pdf Editor",
        badge: "POPULAR",
        description: "Edit PDF documents directly online with full privacy, zero server uploads, and high speed execution.",
        format: "FORMAT: PDF EDIT"
      },
      {
        title: "Merge PDF",
        description: "Combine PDFs in the order you want with the easiest PDF merger available.",
        format: "FORMAT: PDF + PDF"
      },
      {
        title: "Split PDF",
        description: "Separate one page or a whole set for easy conversion into independent PDF files.",
        format: "FORMAT: PDF → PAGES"
      },
      {
        title: "Compress PDF",
        description: "Reduce file size while optimizing for maximal PDF quality.",
        format: "FORMAT: PDF → SMALLER"
      },
      {
        title: "PDF to Word",
        description: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
        format: "FORMAT: PDF → DOCX"
      },
      {
        title: "PDF to Excel",
        description: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
        format: "FORMAT: PDF → XLSX"
      },
      {
        title: "Word to PDF",
        description: "Make DOC and DOCX files easy to read by converting them to PDF.",
        format: "FORMAT: DOCX → PDF"
      },
      {
        title: "PowerPoint to PDF",
        description: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
        format: "FORMAT: PPT → PDF"
      },
      {
        title: "Excel to PDF",
        description: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
        format: "FORMAT: XLSX → PDF"
      }
    ],
    presentationItems: [
      "PDF Editor",
      "Merge PDF",
      "Split PDF",
      "Compress PDF",
      "PDF to Word",
      "And More"
    ],
    features: [
      {
        title: "Page Reordering & Merging",
        description: "Combine multiple PDF files into one clean document or reorder pages effortlessly.",
        icon: "combine"
      },
      {
        title: "Fast Local Processing",
        description: "Documents are processed locally in your browser ensuring top privacy and speed.",
        icon: "shield-check"
      },
      {
        title: "Compression & Conversion",
        description: "Reduce file sizes for easy sharing while keeping document quality high.",
        icon: "file-minus"
      },
      {
        title: "No Sign-up Required",
        description: "Instant access with zero registration, subscription fees, or hidden limitations.",
        icon: "zap"
      }
    ],
    useCases: [
      {
        title: "Students & Researchers",
        description: "Merge study notes, combine lecture slides, and extract specific assignment pages."
      },
      {
        title: "Business Professionals",
        description: "Prepare client pitch decks, append invoice attachments, and organize contract files."
      },
      {
        title: "Content Creators",
        description: "Assemble eBook chapters, curate portfolio PDFs, and compress lead magnets for download."
      }
    ],
    stats: [
      { label: "Processing Speed", value: "< 1 Sec" },
      { label: "Data Retention", value: "0 Bytes" },
      { label: "Cost", value: "100% Free" }
    ],
    faq: [
      {
        question: "Is my PDF file uploaded to external servers?",
        answer: "No. PDF Editor processes documents directly inside your browser. Your files never leave your device."
      },
      {
        question: "Do I need to create an account or sign in?",
        answer: "Not at all. You can start using PDF Editor immediately without signing up."
      },
      {
        question: "Is there a file size limit?",
        answer: "Because processing happens locally on your computer, PDF Editor handles documents smoothly up to hundreds of pages."
      }
    ],
    metaTitle: "Free Online PDF Editor, Merger & Converter | PDF Lover by MyCaptionAI",
    metaDescription: "Edit PDF, Merge PDF, Split PDF, Compress PDF, PDF to Word, PDF to Excel, Word to PDF, PowerPoint to PDF, Excel to PDF online."
  },
  {
    id: "markdown-editor",
    slug: "markdown-editor",
    aliases: ["markdown-editor", "markdowneditor", "markdown"],
    name: "Markdown Editor",
    subtitle: "By MyCaptionAI",
    tagline: "Write Clean Markdown with Instant Live Dual-Pane Preview",
    shortDescription: "Convert formatted Markdown text or .md files into styled PDF, DOCX Word files, HTML, and back.",
    description: "Markdown Editor by MyCaptionAI provides a streamlined workspace tailored for formatting articles, documentation, prompts, and notes. Enjoy real-time preview, code syntax highlighting, copy-to-clipboard formatting, and clean export features.",
    externalUrl: "https://markdowneditor.mycaptionai.com/",
    badge: "Live Dual Preview",
    category: "Writing & Content",
    icon: "edit-3",
    accentColor: "#6366f1",
    capabilities: [
      { title: "Markdown Editor", color: "#6366f1", icon: "md-editor" },
      { title: "MD → PDF", badge: "POPULAR", color: "#ef4444", icon: "md-pdf" },
      { title: "MD → DOCX", color: "#3b82f6", icon: "md-docx" },
      { title: "PDF → MD", color: "#f59e0b", icon: "pdf-md" },
      { title: "MD → HTML", color: "#10b981", icon: "md-html" },
      { title: "And More", color: "#8b5cf6", icon: "and-more" }
    ],
    services: [
      {
        title: "Edit Markdown",
        subtitle: "Markdown Editor",
        badge: "POPULAR",
        description: "Distraction-free live Markdown writing workspace with real-time side-by-side rendering preview.",
        format: "FORMAT: MARKDOWN EDIT"
      },
      {
        title: "MD → PDF",
        subtitle: "Markdown to PDF",
        description: "Convert formatted Markdown text or .md files into styled PDF documents.",
        format: "FORMAT: MD → PDF"
      },
      {
        title: "MD → DOCX",
        subtitle: "Markdown to Word",
        description: "Transform Markdown documents directly into easy-to-edit DOCX Word files.",
        format: "FORMAT: MD → DOCX"
      },
      {
        title: "MD → HTML",
        subtitle: "Markdown to HTML",
        description: "Export Markdown content into clean, modern, standalone HTML web pages.",
        format: "FORMAT: MD → HTML"
      },
      {
        title: "DOCX → MD",
        subtitle: "Word to Markdown",
        description: "Parse Word documents (.docx, .doc) into clean Markdown syntax.",
        format: "FORMAT: DOCX → MD"
      },
      {
        title: "HTML → MD",
        subtitle: "HTML to Markdown",
        description: "Convert web page HTML content or code into formatted Markdown.",
        format: "FORMAT: HTML → MD"
      },
      {
        title: "PDF → MD",
        subtitle: "PDF to Markdown",
        description: "Extract PDF page text and headings directly into structured Markdown files.",
        format: "FORMAT: PDF → MD"
      }
    ],
    presentationItems: [
      "Markdown Editor",
      "MD → PDF",
      "MD → DOCX",
      "PDF → MD",
      "MD → HTML",
      "And More"
    ],
    features: [
      {
        title: "Live Dual-Pane Preview",
        description: "Type side-by-side with synchronized rendering for code, tables, and formatted text.",
        icon: "layout"
      },
      {
        title: "Instant Export & Formatting",
        description: "Export directly to raw .md files, formatted HTML, or copy rich text with one click.",
        icon: "download"
      },
      {
        title: "Distraction-Free Focus",
        description: "Minimalist dark interface designed to reduce visual clutter and keep you in flow state.",
        icon: "eye"
      },
      {
        title: "Auto Local Persistence",
        description: "Your drafts are automatically saved in local browser storage so work is never lost.",
        icon: "save"
      }
    ],
    useCases: [
      {
        title: "Developers & Tech Writers",
        description: "Draft README.md files, API documentation, and code guides with formatted syntax."
      },
      {
        title: "AI Prompt Engineers",
        description: "Structure complex prompts with clear headings, bullet lists, and code blocks before execution."
      },
      {
        title: "Bloggers & Content Marketers",
        description: "Write articles, web copy, and newsletters cleanly before publishing to CMS platforms."
      }
    ],
    stats: [
      { label: "Rendering Engine", value: "Realtime" },
      { label: "Export Formats", value: "MD / HTML" },
      { label: "Cost", value: "100% Free" }
    ],
    faq: [
      {
        question: "Can I export my document to HTML or Markdown?",
        answer: "Yes, you can instantly copy formatted text or download your document as an .md file or compiled HTML code."
      },
      {
        question: "Is my writing saved automatically?",
        answer: "Yes, your editor content is saved in your browser's local storage automatically while you type."
      },
      {
        question: "Does it support syntax highlighting for code blocks?",
        answer: "Yes! Full Markdown syntax including tables, blockquotes, task lists, and multi-language code snippets are rendered seamlessly."
      }
    ],
    metaTitle: "Free Live Markdown Editor & Converter | MD to PDF, DOCX, HTML",
    metaDescription: "Write and convert Markdown online: MD to PDF, MD to DOCX, MD to HTML, DOCX to MD, HTML to MD, PDF to MD."
  }
];

export function getOurTools(): OurTool[] {
  return OUR_TOOLS;
}

export function getOurToolBySlug(slug: string): OurTool | undefined {
  const normalized = slug.toLowerCase().trim();
  return OUR_TOOLS.find(
    (tool) => tool.slug === normalized || tool.aliases.includes(normalized)
  );
}
