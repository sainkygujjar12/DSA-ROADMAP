import ProtectedRoute from "../../routes/ProtectedRoute";

function ProtectedPage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default ProtectedPage;