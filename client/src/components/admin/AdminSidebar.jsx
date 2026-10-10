import { NavLink } from "react-router-dom";
import { FiGrid, FiCode, FiLayers, FiBriefcase, FiBookOpen, FiUpload, FiUsers, FiBookmark, FiEdit3, FiUser } from "react-icons/fi";

const menu = [
  ["Dashboard", "/admin", FiGrid], ["Questions", "/admin/questions", FiCode],
  ["Topics", "/admin/topics", FiLayers], ["Companies", "/admin/companies", FiBriefcase],
  ["Sheets", "/admin/sheets", FiBookOpen], ["Bulk import", "/admin/bulk-import", FiUpload],
  ["Users", "/admin/users", FiUsers], ["Bookmarks", "/bookmarks", FiBookmark],
  ["Notes", "/notes", FiEdit3], ["Profile", "/profile", FiUser],
];

export default function AdminSidebar() {
  return <aside className="admin-sidebar">
    <p className="eyebrow-label">Workspace admin</p>
    <nav aria-label="Administration">{menu.map(([name, path, Icon]) =>
      <NavLink key={path} to={path} end><Icon aria-hidden="true" /><span>{name}</span></NavLink>
    )}</nav>
  </aside>;
}
