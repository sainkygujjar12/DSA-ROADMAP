import { MotionConfig } from "framer-motion";
import { useTheme } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { reduceMotion } = useTheme();
  return <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}><AppRoutes /></MotionConfig>;
}

export default App;