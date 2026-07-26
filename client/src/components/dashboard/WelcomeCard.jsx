function WelcomeCard({ user }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-700 p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-white">
        👋 Welcome back, {user?.name || "Coder"}!
      </h1>

      <p className="mt-2 text-cyan-100">
        Keep your streak alive. Every solved problem brings you one step closer
        to your dream company.
      </p>
    </div>
  );
}

export default WelcomeCard;
