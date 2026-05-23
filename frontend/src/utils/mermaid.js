export function buildMermaid(diagramType, diagramData) {
  if (!diagramData || diagramData.length === 0 || diagramType === "none") {
    return null;
  }

  // Build a lookup map so every node gets its label
  const nodeMap = {};
  for (const node of diagramData) {
    nodeMap[node.id] = node;
  }

  const lines = [];

  if (diagramType === "hierarchy") {
    lines.push("flowchart TD");
    lines.push("    classDef root fill:#e67e00,stroke:#c0640a,color:#fff,font-weight:bold");
    lines.push("    classDef child fill:#fff8ee,stroke:#f5a623,color:#1a1a1a,font-weight:600");
    lines.push("    classDef leaf fill:#eaf4fb,stroke:#2471a3,color:#1a1a1a");

    // Define ALL nodes first with their labels
    for (const node of diagramData) {
      const label = node.label.replace(/"/g, "'");
      lines.push(`    ${node.id}["${label}"]`);
    }

    // Then define all edges
    for (const node of diagramData) {
      for (const childId of node.children || []) {
        lines.push(`    ${node.id} --> ${childId}`);
      }
    }

    // Apply styles
    const root = diagramData.find((n) => n.id === "A");
    const childIds = root?.children || [];
    lines.push("    class A root");
    for (const node of diagramData) {
      if (node.id === "A") continue;
      if (childIds.includes(node.id)) {
        lines.push(`    class ${node.id} child`);
      } else {
        lines.push(`    class ${node.id} leaf`);
      }
    }

  } else if (diagramType === "process") {
    lines.push("flowchart LR");
    lines.push("    classDef step fill:#f5a623,stroke:#e67e00,color:#1a1a1a,font-weight:bold");

    for (const node of diagramData) {
      const label = node.label.replace(/"/g, "'");
      lines.push(`    ${node.id}["${label}"]`);
    }
    for (const node of diagramData) {
      for (const childId of node.children || []) {
        lines.push(`    ${node.id} --> ${childId}`);
      }
      lines.push(`    class ${node.id} step`);
    }

  } else if (diagramType === "comparison") {
    lines.push("flowchart TD");
    lines.push("    classDef root fill:#e67e00,stroke:#c0640a,color:#fff,font-weight:bold");
    lines.push("    classDef left fill:#fff8ee,stroke:#f5a623,color:#1a1a1a,font-weight:600");
    lines.push("    classDef right fill:#eaf4fb,stroke:#2471a3,color:#1a1a1a,font-weight:600");
    lines.push("    classDef detail fill:#f9f9f9,stroke:#ccc,color:#333");

    const root = diagramData.find((n) => n.id === "A");
    const leftId = root?.children?.[0];
    const rightId = root?.children?.[1];

    for (const node of diagramData) {
      const label = node.label.replace(/"/g, "'");
      lines.push(`    ${node.id}["${label}"]`);
    }
    for (const node of diagramData) {
      for (const childId of node.children || []) {
        lines.push(`    ${node.id} --> ${childId}`);
      }
    }

    lines.push("    class A root");
    if (leftId)  lines.push(`    class ${leftId} left`);
    if (rightId) lines.push(`    class ${rightId} right`);
  }

  return lines.join("\n");
}