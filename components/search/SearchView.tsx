"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  FunnelSimpleIcon,
  SortAscendingIcon,
  EyeIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toCloudinaryThumbnail } from "@/lib/cloudinary";

interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  createdAt: string;
  owner: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SearchViewProps {
  query: string;
  sort?: string;
  date?: string;
}

type SortOption = "relevance" | "date" | "views";
type DateFilter = "any" | "today" | "week" | "month" | "year";

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} views`;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDay = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDay > 365) return `${Math.floor(diffDay / 365)}y ago`;
  if (diffDay > 30) return `${Math.floor(diffDay / 30)}mo ago`;
  if (diffDay > 7) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  return "today";
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SearchView({ query, sort: initialSort, date: initialDate }: SearchViewProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>((initialSort as SortOption) || "relevance");
  const [dateFilter, setDateFilter] = useState<DateFilter>((initialDate as DateFilter) || "any");
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const fetchResults = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        date: dateFilter,
      });
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotalResults(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [query, sortBy, dateFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted">
            {loading ? "Searching..." : `${totalResults} results for`}
          </p>
          <h1 className="text-lg font-semibold text-text-primary tracking-tight mt-0.5">
            &ldquo;{query}&rdquo;
          </h1>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-base ${
            showFilters
              ? "bg-amber-500 text-text-inverse"
              : "bg-bg-hover text-text-secondary hover:text-text-primary"
          }`}
        >
          <FunnelSimpleIcon size={14} />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-bg-surface border border-border-default rounded-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sort */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <SortAscendingIcon size={14} />
                Sort by
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: "relevance", label: "Relevance" },
                  { key: "date", label: "Upload date" },
                  { key: "views", label: "View count" },
                ] as { key: SortOption; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-base ${
                      sortBy === key
                        ? "bg-amber-500 text-text-inverse"
                        : "bg-bg-hover text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <ClockIcon size={14} />
                Upload date
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: "any", label: "Any time" },
                  { key: "today", label: "Today" },
                  { key: "week", label: "This week" },
                  { key: "month", label: "This month" },
                  { key: "year", label: "This year" },
                ] as { key: DateFilter; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDateFilter(key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-base ${
                      dateFilter === key
                        ? "bg-amber-500 text-text-inverse"
                        : "bg-bg-hover text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-64 aspect-video skeleton rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-3 skeleton w-1/2" />
                <div className="h-3 skeleton w-full mt-3" />
                <div className="h-3 skeleton w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center mb-4">
            <MagnifyingGlassIcon size={24} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No results found</p>
          <p className="text-xs text-text-muted mt-1">
            Try different keywords or remove filters
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link href={`/watch/${result.id}`} className="flex gap-4 group">
                {/* Thumbnail */}
                <div className="relative w-64 shrink-0 aspect-video rounded-lg overflow-hidden bg-bg-hover">
                  {result.thumbnail ? (
                    <Image
                      src={toCloudinaryThumbnail(result.thumbnail)!}
                      alt={result.title}
                      fill
                      sizes="256px"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <EyeIcon size={20} className="text-text-muted" />
                    </div>
                  )}
                  {result.duration !== null && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-bg-base/80 text-text-primary text-xs font-mono rounded">
                      {formatDuration(result.duration)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-amber-100 transition-colors">
                    {result.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                    <span>{formatViews(result.views)}</span>
                    <span>&middot;</span>
                    <span>{formatTimeAgo(result.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {result.owner.image ? (
                      <Image
                        src={result.owner.image}
                        alt={result.owner.name || ""}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-cover border border-border-default"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
                        <span className="text-[9px] font-medium text-text-muted">
                          {result.owner.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-text-secondary">
                      {result.owner.name || "Unknown"}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
                      {result.description}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
