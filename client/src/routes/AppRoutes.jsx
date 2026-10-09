import { lazy, Suspense } from "react";
import Loader from "../components/ui/Loader";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= Public Pages =================
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const VerifyResetOtp = lazy(() => import("../pages/VerifyResetOtp"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));

// ================= Layout =================
import UserLayout from "../components/layout/UserLayout";

// ================= User Pages =================
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Roadmap = lazy(() => import("../pages/Roadmap"));
const TopicDetails = lazy(() => import("../pages/TopicDetails"));
const QuestionDetails = lazy(() => import("../pages/QuestionDetails"));

const Companies = lazy(() => import("../pages/Companies"));
const CompanyDetails = lazy(() => import("../pages/CompanyDetails"));

const Sheets = lazy(() => import("../pages/Sheets"));
const SheetDetails = lazy(() => import("../pages/SheetDetails"));

const Bookmarks = lazy(() => import("../pages/Bookmarks"));
const Notes = lazy(() => import("../pages/Notes"));
const Profile = lazy(() => import("../pages/Profile"));

// ================= Admin Pages =================
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminQuestions = lazy(() => import("../pages/admin/Questions"));
const AdminTopics = lazy(() => import("../pages/admin/Topics"));
const AdminCompanies = lazy(() => import("../pages/admin/Companies"));
const AdminSheets = lazy(() => import("../pages/admin/Sheets"));
const AdminUsers = lazy(() => import("../pages/admin/Users"));
const AdminBulkImport = lazy(() => import("../pages/admin/BulkImport"));

// ================= Route Guards =================
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import AdminRoute from "./AdminRoute";

const Settings = lazy(() => import("../pages/Settings"));
const NotFound = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading"><Loader /></div>}>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/verify-reset-otp" element={<PublicOnlyRoute><VerifyResetOtp /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

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
          element={<UserLayout><Roadmap /></UserLayout>}
        />

        <Route
          path="/roadmap/:slug"
          element={<UserLayout><TopicDetails /></UserLayout>}
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
          element={<UserLayout><Companies /></UserLayout>}
        />

        <Route
          path="/companies/:slug"
          element={<UserLayout><CompanyDetails /></UserLayout>}
        />

        <Route
          path="/sheets"
          element={<UserLayout><Sheets /></UserLayout>}
        />

        <Route
          path="/sheets/:slug"
          element={<UserLayout><SheetDetails /></UserLayout>}
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

        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
