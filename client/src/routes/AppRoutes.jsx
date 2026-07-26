import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= Public Pages =================
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

// ================= Layout =================
import UserLayout from "../components/layout/UserLayout";

// ================= User Pages =================
import Dashboard from "../pages/Dashboard";
import Roadmap from "../pages/Roadmap";
import TopicDetails from "../pages/TopicDetails";
import QuestionDetails from "../pages/QuestionDetails";

import Companies from "../pages/Companies";
import CompanyDetails from "../pages/CompanyDetails";

import Sheets from "../pages/Sheets";
import SheetDetails from "../pages/SheetDetails";

import Bookmarks from "../pages/Bookmarks";
import Notes from "../pages/Notes";
import Profile from "../pages/Profile";

// ================= Admin Pages =================
import AdminDashboard from "../pages/admin/Dashboard";
import AdminQuestions from "../pages/admin/Questions";
import AdminTopics from "../pages/admin/Topics";
import AdminCompanies from "../pages/admin/Companies";
import AdminSheets from "../pages/admin/Sheets";
import AdminUsers from "../pages/admin/Users";
import AdminBulkImport from "../pages/admin/BulkImport";

// ================= Route Guards =================
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= USER ROUTES (WRAPPED IN USERLAYOUT) ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Dashboard />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Roadmap />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap/:slug"
          element={
            <ProtectedRoute>
              <UserLayout>
                <TopicDetails />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/questions/:slug"
          element={
            <ProtectedRoute>
              <UserLayout>
                <QuestionDetails />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Companies />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies/:slug"
          element={
            <ProtectedRoute>
              <UserLayout>
                <CompanyDetails />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sheets"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Sheets />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sheets/:slug"
          element={
            <ProtectedRoute>
              <UserLayout>
                <SheetDetails />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Bookmarks />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Notes />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Profile />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES (NO USER LAYOUT) ================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/questions"
          element={
            <AdminRoute>
              <AdminQuestions />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/topics"
          element={
            <AdminRoute>
              <AdminTopics />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/companies"
          element={
            <AdminRoute>
              <AdminCompanies />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/sheets"
          element={
            <AdminRoute>
              <AdminSheets />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bulk-import"
          element={
            <AdminRoute>
              <AdminBulkImport />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;