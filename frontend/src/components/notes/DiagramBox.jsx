/**
 * components/notes/DiagramBox.jsx
 * Renders a Mermaid flowchart from diagram_data.
 */

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { buildMermaid } from "../../utils/mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
  themeVariables: { fontSize: "13px", fontFamily: "Segoe UI, Arial, sans-serif" },
});

let diagramCounter = 0;

export default function DiagramBox({ diagramType, diagramData, diagramTitle }) {
  const ref = useRef(null);
  const idRef = useRef(`diagram-${++diagramCounter}`);

  const code = buildMermaid(diagramType, diagramData);

  useEffect(() => {
    if (!code || !ref.current) return;
    const id = idRef.current;
    ref.current.innerHTML = `<div class="mermaid" id="${id}">${code}</div>`;
    mermaid.run({ nodes: [ref.current.querySelector(`#${id}`)] }).catch(console.error);
  }, [code]);

  if (!code) return null;

  return (
    <div className="fade-in mb-3">
      {/* Section header */}
      <div className="inline-flex items-center gap-1.5 border border-gray-800 px-3 py-1
                      text-xs font-bold bg-white rounded-sm mb-2">
        📊 {diagramTitle || "Diagram"}
      </div>

      {/* Diagram container */}
      <div className="bg-white border border-gray-200 rounded p-4 text-center min-h-20"
           ref={ref} />
    </div>
  );
}