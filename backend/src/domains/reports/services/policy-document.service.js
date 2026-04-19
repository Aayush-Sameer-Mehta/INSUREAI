import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const DOC_DIR = path.join(process.cwd(), "storage", "policy-documents");

async function ensureDir() {
  await fs.mkdir(DOC_DIR, { recursive: true });
}

export async function generatePolicyDocument({
  policyNumber,
  user,
  policy,
  premiumAmount,
  validFrom,
  validTo,
}) {
  await ensureDir();
  const fileName = `policy-${policyNumber}.pdf`;
  const filePath = path.join(DOC_DIR, fileName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fsSync.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text("INSUREAI POLICY DOCUMENT", { align: "center" });
      doc.moveDown(2);

      // Details
      doc.fontSize(12);
      doc.text(`Policy Number: ${policyNumber}`);
      doc.text(`Holder: ${user.fullName} (${user.email})`);
      doc.text(`Policy: ${policy.name} - ${policy.category}`);
      doc.text(`Coverage: ${policy.coverage || "Standard"}`);
      doc.text(`Premium: ${premiumAmount}`);
      doc.text(`Validity: ${new Date(validFrom).toLocaleDateString()} to ${new Date(validTo).toLocaleDateString()}`);
      doc.moveDown(2);

      // Terms
      doc.fontSize(14).text("Terms and Conditions:", { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(10);
      const terms = policy.termsAndConditions || ["Standard terms apply."];
      terms.forEach((term, idx) => {
        doc.text(`${idx + 1}. ${term}`);
        doc.moveDown(0.2);
      });

      doc.end();

      stream.on("finish", () => {
        resolve({ filePath, fileName });
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
