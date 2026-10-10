import { useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function useInterfaceMotion() {
  const { reduceMotion } = useTheme();
  const systemReducedMotion = useReducedMotion();
  return !reduceMotion && !systemReducedMotion;
}
