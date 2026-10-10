import HoverGrid from "../ui/HoverGrid";
import SheetCard from "./SheetCard";

function SheetGrid({ sheets }) {
  if (!sheets.length) {
    return <div className="sheet-empty-state">No sheets found yet.</div>;
  }

  return (
    <HoverGrid className="sheets-grid">
      {sheets.map((sheet) => (
        <SheetCard key={sheet._id} sheet={sheet} />
      ))}
    </HoverGrid>
  );
}

export default SheetGrid;
