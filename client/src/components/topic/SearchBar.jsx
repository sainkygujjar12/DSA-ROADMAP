import { FaSearch } from "react-icons/fa";

function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar relative mb-6 max-w-[420px]">
      <FaSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        type="search"
        aria-label="Search questions"
        value={value}
        onChange={onChange}
        placeholder="Search questions"
        autoComplete="off"
        spellCheck="false"
        className="theme-input w-full rounded-xl border border-white/10 bg-[#242427] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#665cff] focus:ring-2 focus:ring-[#665cff]/20"
      />
    </div>
  );
}

export default SearchBar;
