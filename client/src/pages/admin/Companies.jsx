import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import CompanyTable from "../../components/admin/CompanyTable";
import CompanyForm from "../../components/admin/CompanyForm";
import DeleteModal from "../../components/admin/DeleteModal";
import SearchBar from "../../components/admin/SearchBar";

import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../services/adminCompanyService";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteCompanyData, setDeleteCompanyData] =
    useState(null);



  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      setCompanies(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getCompanies().then(response => { if (active) setCompanies(response.data || []); })
      .catch(error => console.error(error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSaveCompany = async (
    formData
  ) => {
    try {
      if (editingCompany) {
        await updateCompany(
          editingCompany._id,
          formData
        );
      } else {
        await createCompany(formData);
      }

      setShowModal(false);
      setEditingCompany(null);

      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Operation Failed");
    }
  };

  const handleDeleteCompany = async () => {
    try {
      await deleteCompany(deleteCompanyData._id);

      setDeleteCompanyData(null);

      fetchCompanies();
    } catch (err) {
      console.error(err);
      alert("Delete Failed");
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      company.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [companies, search]);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            🏢 Companies
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all companies.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCompany(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-700"
        >
          + Add Company
        </button>

      </div>

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search Companies..."
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          Loading...
        </div>
      ) : (
        <CompanyTable
          companies={filteredCompanies}
          onEdit={(company) => {
            setEditingCompany(company);
            setShowModal(true);
          }}
          onDelete={(company) =>
            setDeleteCompanyData(company)
          }
        />
      )}

      {showModal && (
        <CompanyForm key={editingCompany?._id || "new"}
          initialData={editingCompany}
          onClose={() => {
            setShowModal(false);
            setEditingCompany(null);
          }}
          onSave={handleSaveCompany}
        />
      )}

      {deleteCompanyData && (
        <DeleteModal
          title={deleteCompanyData.name}
          onCancel={() =>
            setDeleteCompanyData(null)
          }
          onDelete={handleDeleteCompany}
        />
      )}
    </AdminLayout>
  );
}

export default Companies;