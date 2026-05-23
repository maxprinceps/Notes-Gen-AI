/**
 * components/notes/StreamingCard.jsx
 * Shows a live preview of the topic being built right now.
 * Displays a skeleton with animated sections as tokens arrive.
 */

export default function StreamingCard({ topicName, topicIndex, subject, buffer }) {
  // Try to partially parse what we have so far
  const hasDefinition = buffer.includes('"definition"');
  const hasKeyPoints  = buffer.includes('"key_points"');
  const hasDiagram    = buffer.includes('"diagram_type"');
  const hasExample    = buffer.includes('"real_example"');
  const hasExamQs     = buffer.includes('"exam_questions_short"');

  return (
    <div className="grid-bg w-full max-w-3xl mx-auto mb-10 shadow-xl
                    rounded-sm border border-orange-200">
      <div className="p-10">

        {/* Header */}
        <div className="flex justify-between items-center border-2 border-gray-900
                        px-4 py-2 mb-4 font-black text-sm tracking-widest uppercase">
          <span>{subject}</span>
          <span>ONE SHOT</span>
          <span className="bg-brand-orange-light text-gray-900 font-black
                           px-3 py-0.5 rounded-sm text-xs">
            UNIT-{topicIndex + 1}
          </span>
        </div>

        {/* Topic title with cursor */}
        <div className="inline-block border-2 border-gray-900 px-4 py-1
                        font-black text-base mb-4 bg-white cursor">
          {topicIndex + 1}. {topicName?.toUpperCase()}
        </div>

        {/* Animated skeleton sections that light up as tokens arrive */}
        <SkeletonSection label="📌 Definition"    active={hasDefinition}  color="bg-orange-200" />
        <SkeletonSection label="🧠 Key Points"    active={hasKeyPoints}   color="bg-blue-100"   />
        <SkeletonSection label="📊 Diagram"       active={hasDiagram}     color="bg-gray-100"   />
        <SkeletonSection label="📍 Example"       active={hasExample}     color="bg-yellow-100" />
        <SkeletonSection label="⭐ Exam Questions" active={hasExamQs}      color="bg-red-100"    />

        {/* Live token counter */}
        <div className="mt-4 text-xs text-gray-400 font-mono">
          {buffer.length} characters received...
        </div>
      </div>
    </div>
  );
}

function SkeletonSection({ label, active, color }) {
  return (
    <div className={`mb-2 rounded p-2.5 transition-all duration-500
                     ${active ? color + " opacity-100" : "bg-gray-100 opacity-40"}`}>
      <div className="flex items-center gap-2">
        {active
          ? <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse flex-shrink-0" />
          : <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
        }
        <span className={`text-xs font-bold ${active ? "text-gray-800" : "text-gray-400"}`}>
          {label}
        </span>
        {active && (
          <span className="text-xs text-brand-orange font-medium ml-auto">generating...</span>
        )}
      </div>
      {active && (
        <div className="mt-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse
                        opacity-40" style={{ width: "60%" }} />
      )}
    </div>
  );
}