import { useEffect, useState } from "react";
import { FaBookOpen, FaLayerGroup } from "react-icons/fa";
import SheetGrid from "../components/sheets/SheetGrid";
import MainLayout from "../components/layout/MainLayout";
import { getSheets } from "../services/sheetService";
import "./sheets.css";

function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSheets() {
      try {
        const res = await getSheets();
        if (!cancelled) setSheets(res.data || []);
      } catch (err) {
        console.error("Sheets error:", err);
        if (!cancelled) setSheets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSheets();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalQuestions = sheets.reduce(
    (total, sheet) => total + (sheet.totalQuestions || 0),
    0
  );

  return (
    <MainLayout>
      <div className="sheets-page">
        <section className="sheets-hero">
          <div>
            <p className="eyebrow-label">Curated preparation</p>
            <h1>Choose your sheet<span>.</span></h1>
            <p>Practice from focused problem collections and keep every interview plan in one place.</p>
          </div>
          <div className="sheets-hero-stat">
            <FaBookOpen />
            <strong>{totalQuestions}</strong>
            <span>questions across {sheets.length} sheets</span>
          </div>
        </section>

        <div className="sheets-toolbar">
          <span><FaLayerGroup /> Your preparation library</span>
          <span>{sheets.length} collections</span>
        </div>

        {loading ? (
          <div className="sheets-loading">Loading your sheets…</div>
        ) : (
          <SheetGrid sheets={sheets} />
        )}
      </div>
    </MainLayout>
  );
}

export default Sheets;
