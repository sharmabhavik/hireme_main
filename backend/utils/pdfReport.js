import PDFDocument from "pdfkit";
import {
  formatFeedbackBullets,
  formatInterviewQuestion,
  getAnsweredTurns,
  sanitizeText,
} from "./interviewFormat.js";

function writeWrapped(doc, text, options = {}) {
  doc.fontSize(options.size || 12).text(text || "", {
    align: options.align || "left",
    width: options.width || doc.page.width - doc.page.margins.left - doc.page.margins.right,
  });
}

export function buildInterviewPdfBuffer(session) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      const answeredTurns = getAnsweredTurns(session.turns || []);

      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text("Mock Interview Report", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#555555").text("HireMe — partial or full session", {
        align: "center",
      });
      doc.fillColor("#000000");
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Target Role: ${sanitizeText(session.targetRole)}`);
      if (session.round) {
        doc.text(`Round: ${String(session.round).toUpperCase()}`);
      }
      doc.text(`Difficulty: ${sanitizeText(session.difficulty)}`);
      doc.text(`Status: ${sanitizeText(session.status)}`);
      doc.text(`Questions answered: ${answeredTurns.length}`);
      doc.text(`Date: ${new Date(session.createdAt).toLocaleString()}`);
      if (typeof session.finalScore === "number") {
        doc.text(`Final Score: ${session.finalScore}/10`);
      }
      doc.moveDown();

      if (session.overallFeedback) {
        doc.fontSize(14).text("Overall Feedback", { underline: true });
        doc.moveDown(0.35);
        writeWrapped(doc, session.overallFeedback);
        doc.moveDown();
      }

      if (!answeredTurns.length) {
        writeWrapped(doc, "No answered questions in this session.");
        doc.end();
        return;
      }

      doc.fontSize(14).text("Question & Answer Transcript", { underline: true });
      doc.moveDown(0.5);

      answeredTurns.forEach((t, idx) => {
        const q = formatInterviewQuestion(t.question);
        doc.fontSize(13).fillColor("#0f766e").text(`Question ${idx + 1}`);
        doc.fillColor("#000000");
        doc.moveDown(0.2);
        writeWrapped(doc, q);
        doc.moveDown(0.35);

        doc.fontSize(11).fillColor("#444444").text("Your answer");
        doc.fillColor("#000000");
        doc.moveDown(0.15);
        writeWrapped(doc, sanitizeText(t.answer) || "(no answer recorded)");
        doc.moveDown(0.35);

        const bullets = formatFeedbackBullets(t.feedback);
        if (bullets.length) {
          doc.fontSize(11).fillColor("#444444").text("Feedback");
          doc.fillColor("#000000");
          doc.moveDown(0.15);
          bullets.forEach((b) => {
            writeWrapped(doc, `• ${b}`, { size: 11 });
            doc.moveDown(0.15);
          });
        }

        if (typeof t.score === "number") {
          doc.moveDown(0.15);
          doc.fontSize(11).text(`Score: ${t.score}/10`, { continued: false });
        }

        doc.moveDown(0.75);
      });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
