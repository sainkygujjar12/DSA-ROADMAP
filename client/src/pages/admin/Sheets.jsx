import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import SheetTable from "../../components/admin/SheetTable";
import SheetForm from "../../components/admin/SheetForm";
import DeleteModal from "../../components/admin/DeleteModal";
import SearchBar from "../../components/admin/SearchBar";

import {
  getSheets,
  createSheet,
  updateSheet,
  deleteSheet,
} from "../../services/adminSheetService";

function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [deleteSheetData, setDeleteSheetData] = useState(null);

  // ==============================
  // Fetch Sheets
  // ==============================
  const fetchSheets = async () => {
    try {
      setLoading(true);

      const response = await getSheets();

      setSheets(response?.data || []);
    } catch (err) {
      console.error("Error fetching sheets:", err);
      setSheets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  // ==============================
  // Create / Update Sheet
  // ==============================
  const handleSaveSheet = async (formData) => {
    try {
      if (editingSheet) {
        await updateSheet(editingSheet._id, formData);
      } else {
        await createSheet(formData);
      }

      setShowModal(false);
      setEditingSheet(null);

      fetchSheets();
    } catch (err) {
      console.error("Save sheet error:", err);
      alert("Operation Failed");
    }
  };

  // ==============================
  // Delete Sheet
  // ==============================
  const handleDeleteSheet = async () => {
    try {
      if (!deleteSheetData?._id) return;

      await deleteSheet(deleteSheetData._id);

      setDeleteSheetData(null);

      fetchSheets();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete Failed");
    }
  };

  // ==============================
  // Search Filter
  // ==============================
  const filteredSheets = useMemo(() => {
    return (sheets || []).filter((sheet) =>
      sheet?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [sheets, search]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">📋 Sheets</h1>
          <p className="mt-2 text-slate-400">
            Manage all DSA Sheets.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSheet(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-700"
        >
          + Add Sheet
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Sheets..."
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          Loading...
        </div>
      ) : (
        <SheetTable
          sheets={filteredSheets}
          onEdit={(sheet) => {
            setEditingSheet(sheet);
            setShowModal(true);
          }}
          onDelete={(sheet) => setDeleteSheetData(sheet)}
        />
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <SheetForm
          initialData={editingSheet}
          onClose={() => {
            setShowModal(false);
            setEditingSheet(null);
          }}
          onSave={handleSaveSheet}
        />
      )}

      {/* Delete Modal */}
      {deleteSheetData && (
        <DeleteModal
          title={deleteSheetData.name}
          onCancel={() => setDeleteSheetData(null)}
          onDelete={handleDeleteSheet}
        />
      )}
    </AdminLayout>
  );
}

export default Sheets;