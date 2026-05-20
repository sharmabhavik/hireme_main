import PDFDocument from "pdfkit";

export function buildInterviewPdfBuffer(session) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];

      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text("Mock Interview Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Target Role: ${session.targetRole}`);
      if (session.round) {
        doc.text(`Round: ${session.round}`);
      }
      doc.text(`Difficulty: ${session.difficulty}`);
      doc.text(`Status: ${session.status}`);
      doc.text(`Date: ${new Date(session.createdAt).toLocaleString()}`);
      if (typeof session.finalScore === "number") {
        doc.text(`Final Score: ${session.finalScore}/10`);
      }
      doc.moveDown();

      if (session.overallFeedback) {
        doc.fontSize(14).text("Overall Feedback", { underline: true });
        doc.fontSize(12).text(session.overallFeedback);
        doc.moveDown();
      }

      doc.fontSize(14).text("Transcript", { underline: true });
      doc.moveDown(0.5);

      (session.turns || []).forEach((t, idx) => {
        doc.fontSize(12).text(`Q${idx + 1}: ${t.question}`);
        doc.moveDown(0.25);
        doc.text(`A${idx + 1}: ${t.answer || ""}`);
        if (t.feedback) {
          doc.moveDown(0.25);
          doc.text(`Feedback: ${t.feedback}`);
        }
        if (typeof t.score === "number") {
          doc.text(`Score: ${t.score}/10`);
        }
        doc.moveDown();
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
