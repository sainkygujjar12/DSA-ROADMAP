function DifficultyText({ difficulty }) {
  const level = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty.toLowerCase() : "unrated";
  return <span className={`difficulty-label difficulty-${level}`}>{difficulty}</span>;
}

export default DifficultyText;
