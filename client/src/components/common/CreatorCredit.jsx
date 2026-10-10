import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function CreatorCredit() {
  return <div className="creator-credit">
    <span>Made by <strong>Sainky Gurjar</strong></span>
    <nav aria-label="Creator profiles">
      <a href="https://www.linkedin.com/in/sainky-gurjar-4290b1367/" target="_blank" rel="noopener noreferrer"><FaLinkedin aria-hidden="true" />LinkedIn</a>
      <a href="https://github.com/sainkygujjar12" target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true" />GitHub</a>
    </nav>
  </div>;
}
