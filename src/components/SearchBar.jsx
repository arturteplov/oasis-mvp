import { useId } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className="group relative flex w-full items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/70 px-5 py-3 shadow-lg shadow-black/40 transition hover:border-oasis-primary/60 hover:bg-zinc-950"
    >
      <Search className="h-5 w-5 text-oasis-primary transition group-hover:scale-105" />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="You can search roles, companies, or places — e.g. “Driver, Toronto"
        className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
      />
      <span className="hidden text-xs font-semibold text-zinc-500 md:inline">Enter ↵</span>
    </label>
  );
};

export default SearchBar;
