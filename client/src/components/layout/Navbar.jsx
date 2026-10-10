import { LayoutGroup, motion } from "framer-motion";
import useInterfaceMotion from "../../hooks/useInterfaceMotion";
import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaMoon, FaSun, FaChevronDown, FaArrowRight, FaBookmark, FaRegStickyNote, FaUserCircle, FaSlidersH, FaShieldAlt, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Logo from "../common/Logo";
import "./account-navigation.css";

const links = [
  { label: "Roadmap", path: "/roadmap" },
  { label: "Practice sheets", path: "/sheets" },
  { label: "Companies", path: "/companies" },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const account = useRef(null);
  const navigate = useNavigate();
  const navigationId = useId();
  const animate = useInterfaceMotion();
  const close = () => {
    setOpen(false);
    if (account.current) account.current.open = false;
  };
  const navigation = isAuthenticated ? [{ label: "Dashboard", path: "/dashboard" }, ...links] : links;

  useEffect(() => {
    const dismiss = event => {
      if (account.current && !account.current.contains(event.target)) account.current.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <header className="app-header" onKeyDown={event => { if (event.key === "Escape") { const wasAccountOpen = account.current?.open; close(); if (wasAccountOpen) account.current?.querySelector("summary")?.focus(); } }}>
      <div className="app-nav">
        <Logo className="app-brand" />
        <LayoutGroup id={navigationId}><nav className="app-desktop-links" aria-label="Primary navigation">
          {navigation.map(item => <NavLink key={item.path} to={item.path} className={({ isActive }) => `app-nav-link ${isActive ? "active" : ""}`}>{({ isActive }) => <>{isActive && <motion.span aria-hidden="true" className="app-nav-indicator" layoutId={animate ? "active-navigation" : undefined} transition={{ duration: animate ? .2 : 0 }} />}<span className="app-nav-label">{item.label}</span></>}</NavLink>)}
        </nav></LayoutGroup>
        <div className="app-nav-actions">
          <button className="app-icon-button" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          {isAuthenticated ? (
            <details className="app-account" ref={account} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
              <summary aria-label="Account navigation"><span className="app-avatar">{user?.avatar ? <img src={user.avatar} alt="" /> : user?.name?.charAt(0)?.toUpperCase() || "U"}</span><FaChevronDown aria-hidden="true" /></summary>
              <nav className="app-account-menu" aria-label="Account">
                <Link to="/profile" className="app-account-identity" onClick={close} aria-label={`View ${user?.name || "your"} profile`}><span><strong>{user?.name || "Your account"}</strong><small>View your profile</small></span><FaArrowRight aria-hidden="true" /></Link>
                {[['/bookmarks', 'Bookmarks', FaBookmark], ['/notes', 'Notes', FaRegStickyNote], ['/profile', 'Profile', FaUserCircle], ['/settings', 'Settings', FaSlidersH], ...(user?.role === 'admin' ? [['/admin', 'Admin', FaShieldAlt]] : [])].map(([path, label, Icon]) => <Link key={path} to={path} onClick={close}><Icon aria-hidden="true" />{label}</Link>)}
                <button className="app-account-logout" type="button" onClick={() => { close(); logout(); navigate('/'); }}><FaSignOutAlt aria-hidden="true" />Log out</button>
              </nav>
            </details>
          ) : <><Link to="/login" className="app-login">Log in</Link><Link to="/register" className="app-signup">Get started</Link></>}
          <button className="app-icon-button app-menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>{open ? <FaTimes /> : <FaBars />}</button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" className="app-mobile-links" aria-label="Mobile navigation">{navigation.map(item => <NavLink key={item.path} to={item.path} onClick={close} className={({ isActive }) => `app-nav-link ${isActive ? "active" : ""}`}>{item.label}</NavLink>)}</nav>}
    </header>
  );
}
export default Navbar;
