import Input from "../ui/Input";

function SearchBar({ value, onChange }) {
  return (
    <div className="mb-6">
      <Input
        value={value}
        onChange={onChange}
        placeholder="Search Questions..."
      />
    </div>
  );
}

export default SearchBar;