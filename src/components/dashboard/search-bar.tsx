"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/research/${query.trim().toUpperCase()}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex w-full max-w-2xl items-center space-x-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search company (e.g. AAPL, TSLA)..."
          aria-label="Search company ticker or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-4 h-12 rounded-xl border-muted bg-background shadow-sm transition-colors focus-visible:ring-primary"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 rounded-xl px-8">
        Search
      </Button>
    </form>
  );
}
