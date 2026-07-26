import { useEffect, useState } from "react";
import SheetGrid from "../components/sheets/SheetGrid";
import MainLayout from "../components/layout/MainLayout";
import { getSheets } from "../services/adminSheetService";

function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const res = await getSheets();
      setSheets(res.data || []);
    } catch (err) {
      console.error("Sheets error:", err);
      setSheets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>

      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            📋 DSA Sheets
          </h1>

          <p className="mt-2 text-slate-400">
            Browse all curated DSA sheets.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-slate-400">
            Loading sheets...
          </div>
        ) : (
          <SheetGrid sheets={sheets} />
        )}

      </div>

    </MainLayout>
  );
}

export default Sheets;