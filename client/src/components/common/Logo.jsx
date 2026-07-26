import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link
      to="/"
      className="text-2xl font-extrabold text-cyan-500"
    >
      DSA Roadmap
    </Link>
  );
}

export default Logo;