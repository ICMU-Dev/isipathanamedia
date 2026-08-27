import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Database,
  LayoutDashboard,
  Globe,
  Server,
  Radio,
  Smartphone,
  Activity,
  ArrowRight,
  ActivitySquare,
  Lock,
  Wifi,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import remarkGfm from "remark-gfm";
import { documentationMarkdown } from "./documentationContent";


const SystemDocumentation = () => {
  const parts = documentationMarkdown.split(/\n## /);
  const intro = parts[0];
  const accordionSections = parts.slice(1).map((part, idx) => {
    const firstNewline = part.indexOf("\n");
    const title = part.substring(0, firstNewline).trim();
    const content = part.substring(firstNewline + 1).trim();
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/ /g, "-");
    return { id: idx, title, content, slug };
  });

  const handleLinkClick = (e, href) => {
    if (href?.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        if (targetElement.tagName === "DETAILS") {
          targetElement.open = true;
        }
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const markdownComponents = {
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto w-full mb-8 max-w-[calc(100vw-3rem)] sm:max-w-none rounded-2xl border border-white/[0.06] p-4 ">
        <table className="w-full min-w-[600px] m-0" {...props} />
      </div>
    ),
    a: ({ node, href, children, ...props }) => (
      <a href={href} onClick={(e) => handleLinkClick(e, href)} {...props}>
        {children}
      </a>
    ),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div
        className="bg-[#09090b] rounded-2xl sm:rounded-2xl border border-white/[0.06]  p-4 sm:p-10 shadow-2xl prose prose-sm md:prose-base prose-invert prose-emerald max-w-none
        prose-headings:font-medium prose-headings:tracking-tight 
        prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:mt-12
        prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
        prose-pre:bg-[var(--admin-card-bg)]   prose-pre:border prose-pre:border-white/5 prose-pre:max-w-[calc(100vw-3rem)] sm:prose-pre:max-w-none
        prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-2xl prose-code:before:hidden prose-code:after:hidden prose-code:font-normal
        prose-strong:text-white prose-strong:font-bold
        prose-th:text-zinc-400 prose-th:uppercase prose-th:text-[10px] prose-th:tracking-wider prose-th:whitespace-nowrap
        prose-td:border-t prose-td:border-white/[0.06]  prose-td:py-3
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}>
          {intro}
        </ReactMarkdown>
      </div>

      <div className="space-y-4 pb-12">
        {accordionSections.map((sec) => (
          <details
            id={sec.slug}
            key={sec.id}
            className="group bg-zinc-950 border border-white/[0.06]  rounded-2xl sm:rounded-2xl overflow-hidden shadow-lg transition-all">
            <summary className="cursor-pointer p-6 sm:p-8 font-bold text-lg sm:text-xl text-white flex items-center justify-between hover:bg-white/5 transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-4">
              
                {sec.title}
              </span>
              <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/10 transition-colors">
                <ChevronDown
                  className="text-zinc-400 group-open:rotate-180 transition-transform duration-300"
                  size={20}
                />
              </div>
            </summary>

            <div
              className="p-4 sm:p-10 pt-0 sm:pt-0 border-t border-white/[0.06]  bg-[#09090b] 
              prose prose-sm md:prose-base prose-invert prose-emerald max-w-none
              prose-headings:font-medium prose-headings:tracking-tight 
              prose-h3:text-xl prose-h3:text-white prose-h3:mt-8
              prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
              prose-pre:bg-[var(--admin-card-bg)]   prose-pre:border prose-pre:border-white/5 prose-pre:max-w-[calc(100vw-3rem)] sm:prose-pre:max-w-none
              prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-2xl prose-code:before:hidden prose-code:after:hidden prose-code:font-normal
              prose-strong:text-white prose-strong:font-bold
              prose-th:text-zinc-400 prose-th:uppercase prose-th:text-[10px] prose-th:tracking-wider prose-th:whitespace-nowrap
              prose-td:border-t prose-td:border-white/[0.06]  prose-td:py-3
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}>
                {sec.content}
              </ReactMarkdown>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default SystemDocumentation;
