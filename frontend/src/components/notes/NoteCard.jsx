/**
 * components/notes/NoteCard.jsx — Sprint 3 version
 * Every section is now wrapped in EditableSection.
 * Right-click any element → regenerate or change color.
 * Click any text → edit inline.
 */

import DiagramBox from "./DiagramBox";
import EditableSection from "../ui/EditableSection";
import EditableText from "../ui/EditableText";
import useNotesStore from "../../store/notesStore";
import useChatStore from "../../store/chatStore";

export default function NoteCard({ note, index, subject, isStreaming = false }) {
  const { updateNoteField } = useNotesStore();
  const colors = note._colors || {};

  const editProps = {
    noteIndex: index,
    topic: note.topic,
    subject,
  };

  const update = (field) => (value) => updateNoteField(index, field, value);

  return (
    <div
      className="print-page grid-bg w-full max-w-3xl mx-auto mb-10 shadow-xl
                    rounded-sm border border-gray-200 print:shadow-none"
      data-topic={note.topic}
    >
      <div className="p-10">

        {/* ── Header bar ── */}
        <div className="flex justify-between items-center border-2 border-gray-900
                        px-4 py-2 mb-4 font-black text-sm tracking-widest uppercase">
          <span>{subject}</span>
          <span>ONE SHOT</span>
          <span className="bg-brand-orange-light text-gray-900 font-black
                           px-3 py-0.5 rounded-sm text-xs tracking-wide">
            UNIT-{index + 1}
          </span>
        </div>

        {/* ── Topic title ── */}
        <div className="inline-block border-2 border-gray-900 px-4 py-1
                        font-black text-base mb-4 bg-white tracking-wide">
          {index + 1}.&nbsp;
          <EditableText
            value={note.topic}
            onChange={update("topic")}
            className="inline font-black text-base uppercase"
          />
        </div>

        {/* ── Definition ── */}
        {note.definition && (
          <EditableSection {...editProps} elementKey="definition" elementLabel="Definition" className="mb-3">
            <div className="rounded p-3 border border-orange-400"
                 style={{ background: colors.definition || "#f5a623" }}>
              <strong className="block text-sm font-black mb-1">📌 Definition</strong>
              <EditableText
                value={note.definition}
                onChange={update("definition")}
                className="text-sm leading-relaxed"
              />
            </div>
          </EditableSection>
        )}

        {/* ── Simple explanation ── */}
        {note.simple_explanation && (
          <EditableSection {...editProps} elementKey="simple_explanation" elementLabel="Simple Explanation" className="mb-3">
            <SectionHeader>💡 Simple Explanation</SectionHeader>
            <div className="border-l-4 border-brand-orange-light pl-3 py-2 pr-2
                            rounded-r text-sm leading-relaxed"
                 style={{ background: colors.simple_explanation || "#fff8ee" }}>
              <EditableText
                value={note.simple_explanation}
                onChange={update("simple_explanation")}
                className="text-sm leading-relaxed"
              />
            </div>
          </EditableSection>
        )}

        {/* ── Key points ── */}
        {note.key_points?.length > 0 && (
          <EditableSection {...editProps} elementKey="key_points" elementLabel="Key Points" className="mb-3">
            <SectionHeader>🧠 Key Points</SectionHeader>
            <ul className="border border-blue-200 rounded px-4 py-2 text-sm"
                style={{ background: colors.key_points || "#eaf4fb" }}>
              {note.key_points.map((pt, i) => (
                <li key={i} className="py-0.5 leading-relaxed flex items-start gap-1">
                  <span className="text-brand-orange font-bold mt-0.5">•</span>
                  <EditableText
                    value={pt}
                    onChange={(val) => {
                      const updated = [...note.key_points];
                      updated[i] = val;
                      update("key_points")(updated);
                    }}
                    className="text-sm leading-relaxed flex-1"
                  />
                </li>
              ))}
            </ul>
          </EditableSection>
        )}

        {/* ── How it works ── */}
        {note.how_it_works?.length > 0 && (
          <EditableSection {...editProps} elementKey="how_it_works" elementLabel="How It Works" className="mb-3">
            <SectionHeader>🔧 How It Works</SectionHeader>
            <ul className="space-y-1.5">
              {note.how_it_works.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="min-w-[24px] h-[24px] rounded-full bg-brand-orange
                                   text-white text-xs font-black flex items-center
                                   justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {i + 1}
                  </span>
                  <EditableText
                    value={step}
                    onChange={(val) => {
                      const updated = [...note.how_it_works];
                      updated[i] = val;
                      update("how_it_works")(updated);
                    }}
                    className="text-sm leading-relaxed flex-1"
                  />
                </li>
              ))}
            </ul>
          </EditableSection>
        )}

        {/* ── Flowchart ── */}
        {note.diagram_type && note.diagram_type !== "none" && note.diagram_data?.length > 0 && (
          <EditableSection {...editProps} elementKey="diagram_data" elementLabel="Diagram" className="mb-3">
            <DiagramBox
              diagramType={note.diagram_type}
              diagramData={note.diagram_data}
              diagramTitle={note.diagram_title}
            />
          </EditableSection>
        )}

        {/* ── Real example ── */}
        {note.real_example && (
          <EditableSection {...editProps} elementKey="real_example" elementLabel="Real-World Example" className="mb-3">
            <SectionHeader>📍 Real-World Example</SectionHeader>
            <div className="border-l-4 border-orange-600 border border-yellow-200
                            pl-3 py-2 pr-2 rounded-r text-sm leading-relaxed"
                 style={{ background: colors.real_example || "#fefce8" }}>
              <span className="font-black text-orange-600 block mb-0.5">💡 Example:</span>
              <EditableText
                value={note.real_example}
                onChange={update("real_example")}
                className="text-sm leading-relaxed"
              />
            </div>
          </EditableSection>
        )}

        {/* ── Important terms ── */}
        {note.important_terms?.length > 0 && (
          <EditableSection {...editProps} elementKey="important_terms" elementLabel="Important Terms" className="mb-3">
            <SectionHeader>📖 Important Terms</SectionHeader>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="bg-brand-orange text-white font-bold p-2 text-left
                                 border border-orange-600 w-1/3">Term</th>
                  <th className="bg-brand-orange text-white font-bold p-2 text-left
                                 border border-orange-600">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {note.important_terms.map((item, i) => (
                  <tr key={i}>
                    <td className={`p-2 border border-yellow-200 font-bold text-orange-700
                                    ${i % 2 === 0 ? "bg-yellow-50" : "bg-white"}`}>
                      <EditableText
                        value={item.term}
                        onChange={(val) => {
                          const updated = [...note.important_terms];
                          updated[i] = { ...updated[i], term: val };
                          update("important_terms")(updated);
                        }}
                        className="font-bold text-orange-700 text-xs"
                      />
                    </td>
                    <td className={`p-2 border border-yellow-200
                                    ${i % 2 === 0 ? "bg-yellow-50" : "bg-white"}`}>
                      <EditableText
                        value={item.meaning}
                        onChange={(val) => {
                          const updated = [...note.important_terms];
                          updated[i] = { ...updated[i], meaning: val };
                          update("important_terms")(updated);
                        }}
                        className="text-xs leading-relaxed"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </EditableSection>
        )}

        {/* ── Exam questions ── */}
        {(note.exam_questions_short?.length > 0 || note.exam_questions_long?.length > 0) && (
          <EditableSection {...editProps} elementKey="exam_questions_short" elementLabel="Exam Questions" className="mt-4">
            <div className="bg-brand-red rounded p-4 border-2 border-red-800"
                 style={{ background: colors.exam_questions_short || undefined }}>
              <div className="font-black text-center text-sm text-white mb-1
                              border-b border-red-400 pb-2 tracking-wide">
                ⭐ Expected Exam Questions (PYQ Style)
              </div>

              {/* Hint */}
              <p className="text-center text-red-200 text-[10px] mb-3">
                💬 Click any question to get AI help answering it
              </p>

              {note.exam_questions_short?.length > 0 && (
                <>
                  <p className="text-red-200 font-bold text-xs mb-1">
                    🔹 Short Answer (2 Marks)
                  </p>
                  <ol className="list-decimal pl-4 text-xs space-y-1.5 mb-3">
                    {note.exam_questions_short.map((q, i) => (
                      <li key={i} className="leading-relaxed">
                        <ExamQuestion
                          question={q}
                          topic={note.topic}
                          noteObj={note}
                          subject={subject}
                          onChange={(val) => {
                            const updated = [...note.exam_questions_short];
                            updated[i] = val;
                            update("exam_questions_short")(updated);
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {note.exam_questions_long?.length > 0 && (
                <>
                  <p className="text-red-200 font-bold text-xs mb-1">
                    🔹 Long Answer (7 Marks)
                  </p>
                  <ol className="list-decimal pl-4 text-xs space-y-1.5">
                    {note.exam_questions_long.map((q, i) => (
                      <li key={i} className="leading-relaxed">
                        <ExamQuestion
                          question={q}
                          topic={note.topic}
                          noteObj={note}
                          subject={subject}
                          onChange={(val) => {
                            const updated = [...note.exam_questions_long];
                            updated[i] = val;
                            update("exam_questions_long")(updated);
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </EditableSection>
        )}

        {/* Streaming cursor */}
        {isStreaming && (
          <div className="mt-3 text-brand-orange font-bold text-sm cursor">
            Generating
          </div>
        )}

      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div className="inline-flex items-center gap-1.5 border border-gray-800
                    px-3 py-1 font-bold text-xs bg-white rounded-sm mb-1.5 mt-1">
      {children}
    </div>
  );
}

// ── Exam question — clickable to open AI chat ─────────────────────────────────
function ExamQuestion({ question, topic, noteObj, subject, onChange }) {
  const { openChat } = useChatStore();

  const handleClick = () => {
    openChat(
      topic,
      noteObj,
      `Help me write a complete answer for this exam question: "${question}"`
    );
  };

  return (
    <div className="flex items-start gap-2 group/q">
      <div className="flex-1 text-white leading-relaxed">
        <EditableText
          value={question}
          onChange={onChange}
          className="text-white text-xs"
        />
      </div>
      <button
        onClick={handleClick}
        className="flex-shrink-0 opacity-0 group-hover/q:opacity-100
                   transition-opacity bg-white bg-opacity-20
                   hover:bg-opacity-40 text-white text-[9px] font-bold
                   px-2 py-1 rounded whitespace-nowrap mt-0.5"
        title="Get AI help answering this"
      >
        💬 Answer
      </button>
    </div>
  );
}