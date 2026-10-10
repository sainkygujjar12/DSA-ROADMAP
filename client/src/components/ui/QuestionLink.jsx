import { Link, useLocation } from "react-router-dom";

export default function QuestionLink({ children, ...props }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;
  return <Link {...props} state={{ from }} onClick={() => {
    try { sessionStorage.setItem(`practice-scroll:${from}`, String(window.scrollY)); }
    catch { /* Navigation still works when browser storage is unavailable. */ }
  }}>{children}</Link>;
}
