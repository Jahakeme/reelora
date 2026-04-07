import SearchView from "@/components/search/SearchView";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; date?: string }>;
}) {
  const { q, sort, date } = await searchParams;
  return <SearchView query={q || ""} sort={sort} date={date} />;
}
