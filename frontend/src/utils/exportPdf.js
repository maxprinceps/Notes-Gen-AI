/**
 * utils/exportPdf.js
 * Triggers browser print dialog to export notes as PDF.
 * Sets document title so the saved filename is meaningful.
 */

export function exportAsPdf(subject) {
  // Set document title — browser uses this as default PDF filename
  const original = document.title;
  document.title = `${subject} - Notes - NoteGenAI`;

  // Small delay to let title update before print dialog opens
  setTimeout(() => {
    window.print();
    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = original;
    }, 1000);
  }, 100);
}