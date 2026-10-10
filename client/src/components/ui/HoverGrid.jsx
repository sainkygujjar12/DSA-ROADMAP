// Adapted from Aceternity UI's free Card Hover Effect.
// https://ui.aceternity.com/components/card-hover-effect
import { Children, useId, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import useInterfaceMotion from "../../hooks/useInterfaceMotion";

export default function HoverGrid({ children, className = "" }) {
  const id = useId();
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const animate = useInterfaceMotion();
  const active = focused ?? hovered;

  return <LayoutGroup id={id}>
    <div className={`hover-grid ${className}`}>
      {Children.map(children, (child, index) => child && <div
        className="hover-grid-item"
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(index); }}
        onPointerLeave={() => setHovered(null)}
        onFocus={() => setFocused(index)}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null); }}
      >
        <AnimatePresence initial={false}>
          {active === index && <motion.span
            aria-hidden="true"
            className="hover-grid-highlight"
            layoutId={animate ? "hoverBackground" : undefined}
            initial={{ opacity: animate ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animate ? .18 : 0 }}
          />}
        </AnimatePresence>
        {child}
      </div>)}
    </div>
  </LayoutGroup>;
}
