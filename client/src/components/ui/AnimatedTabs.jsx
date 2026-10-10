// Aceternity UI Tabs, adapted to a flat workspace panel with WAI-ARIA keyboard
// navigation. Panel stacking/bounce is omitted to keep reading and focus stable.
// https://ui.aceternity.com/components/tabs
import { useId, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import useInterfaceMotion from "../../hooks/useInterfaceMotion";

export default function AnimatedTabs({ tabs, label }) {
  const id = useId();
  const controls = useRef([]);
  const [selected, setSelected] = useState(tabs[0].value);
  const animate = useInterfaceMotion();
  const active = tabs.find(tab => tab.value === selected) || tabs[0];

  function handleKey(event, index) {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(tabs[next].value);
    controls.current[next]?.focus({ preventScroll: true });
  }

  return <LayoutGroup id={id}>
    <div className="animated-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => <button key={tab.value} type="button" role="tab"
        id={`${id}-tab-${tab.value}`} aria-controls={`${id}-panel-${tab.value}`}
        aria-selected={active.value === tab.value} tabIndex={active.value === tab.value ? 0 : -1}
        ref={node => { controls.current[index] = node; }}
        onClick={() => setSelected(tab.value)} onKeyDown={event => handleKey(event, index)}>
        {active.value === tab.value && <motion.span aria-hidden="true" className="animated-tab-highlight"
          layoutId={animate ? "clickedbutton" : undefined} transition={{ duration: animate ? .22 : 0 }} />}
        <span className="animated-tab-label">{tab.title}</span>
      </button>)}
    </div>
    {tabs.map(tab => <div key={tab.value} role="tabpanel" tabIndex={0}
      id={`${id}-panel-${tab.value}`} aria-labelledby={`${id}-tab-${tab.value}`}
      hidden={tab.value !== active.value} className="animated-tab-panel">{tab.content}</div>)}
  </LayoutGroup>;
}
