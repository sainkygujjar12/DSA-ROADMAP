function UserLayout({ children }) {
  // Individual user pages own their layout so routes do not render
  // duplicate sidebars and headers around pages such as DashboardLayout.
  return children;
}

export default UserLayout;
