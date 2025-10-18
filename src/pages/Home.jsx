import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import JobFeed from '../components/JobFeed.jsx';
import { useJobBoardData } from '../lib/useJobBoardData.js';

const Home = () => {
  const {
    filters,
    setFilter,
    jobs,
    isLoading,
    openJobId,
    setOpenJobId,
    applyState,
    applyToJob
  } = useJobBoardData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
               Quick tips:
              </h1>
              <p className="text-sm text-zinc-400">
                Find a role → Click it → Fill it → Submit in seconds.
              </p>
            </div>
            <SearchBar value={filters.query} onChange={(value) => setFilter('query', value)} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-8 px-6 py-8 md:grid-cols-[280px_minmax(0,1fr)]">
        <FilterSidebar filters={filters} onChange={setFilter} />
        <JobFeed
          jobs={jobs}
          isLoading={isLoading}
          openJobId={openJobId}
          onToggle={(jobId) => setOpenJobId((prev) => (prev === jobId ? null : jobId))}
          onApply={applyToJob}
          applyState={applyState}
        />
      </main>
    </div>
  );
};

export default Home;
