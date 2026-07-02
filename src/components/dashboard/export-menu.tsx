"use client";

import { useMemo, useState } from "react";
import { Download, FileText, FileJson, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ResearchResult } from "@/types/research";

interface ExportMenuProps {
  data: ResearchResult;
}

export function ExportMenu({ data }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPayloads = useMemo(() => ({
    pdf: {
      filename: `${data.ticker}-research.pdf`,
      content: `AI investment research report for ${data.company.name} (${data.ticker})\n\nSummary\n${data.summary}`,
    },
    markdown: {
      filename: `${data.ticker}-research.md`,
      content: `# ${data.company.name} (${data.ticker})\n\n## Summary\n${data.summary}\n\n## Recommendation\n${data.recommendation.value}`,
    },
    json: {
      filename: `${data.ticker}-research.json`,
      content: JSON.stringify(data, null, 2),
    },
  }), [data]);

  const download = (format: keyof typeof exportPayloads) => {
    setIsExporting(true);
    const payload = exportPayloads[format];
    const blob = new Blob([payload.content], { type: format === "json" ? "application/json" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = payload.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} aria-label="Export research report">
          <Download className="mr-2 h-4 w-4" /> {isExporting ? "Preparing..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => download("pdf")}> 
          <FileText className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("markdown")}>
          <FileCode2 className="mr-2 h-4 w-4" /> Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("json")}>
          <FileJson className="mr-2 h-4 w-4" /> JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
