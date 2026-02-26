import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PDFData {
    id: string;
    number: string;
    date: Date;
    dueDate?: Date;
    validUntil?: Date;
    status: string;
    taxRate?: number;
    discount?: number;
    total: number;
    notes?: string | null;
    items: any[];
    client: any;
    company: any;
    quoteNumber?: string | null;
    poNumber?: string | null;
}

export const generateDocumentPDF = async (data: PDFData, type: "INVOICE" | "QUOTE" | "DELIVERY_NOTE" = "INVOICE", returnBase64: boolean = false) => {
    const doc = new jsPDF();
    const taxRate = data.taxRate ?? 20;
    const discount = data.discount ?? 0;
    const { number, date, dueDate, validUntil, total, items, client, company, notes, quoteNumber, poNumber } = data;
    const expiryDate = validUntil || dueDate || new Date();

    const isBL = type === "DELIVERY_NOTE";

    // --- Helpers ---
    const primaryColor = [249, 115, 22]; // Orange-600
    const secondaryColor = [71, 85, 105]; // Slate-600
    const lightText = [148, 163, 184]; // Slate-400
    const darkText = [15, 23, 42]; // Slate-900

    // --- Header ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 8, "F");

    if (company.logo) {
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const i = new Image();
                i.crossOrigin = "anonymous";
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = company.logo;
            });
            doc.addImage(img, "PNG", 20, 15, 30, 15);
        } catch (e) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(company.name || "MAKHAZINE", 20, 30);
        }
    } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(company.name || "MAKHAZINE", 20, 30);
    }

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(company.address || "", 20, 37);
    doc.text(`${company.email || ""} | ${company.phone || ""}`, 20, 42);

    // Document Type
    doc.setFontSize(14);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont("helvetica", "bold");
    let typeLabel = "FACTURE";
    if (type === "QUOTE") typeLabel = "DEVIS";
    if (type === "DELIVERY_NOTE") typeLabel = "BON DE LIVRAISON";
    doc.text(typeLabel, 190, 30, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(number, 190, 38, { align: "right" });

    // Client & Dates
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 55, 190, 55);
    doc.setFontSize(10);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATAIRE", 20, 65);
    doc.setFontSize(12);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(client.name, 20, 72);
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(client.billingAddress || client.address || "Adresse non renseignée", 20, 78);

    doc.text(`ICE: ${client.ice || "—"} | IF: ${client.if || "—"}`, 20, 84);

    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DÉTAILS", 190, 65, { align: "right" });
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${format(new Date(date), "dd/MM/yyyy")}`, 190, 72, { align: "right" });
    if (!isBL) {
        doc.text(`Échéance/Validité: ${format(new Date(expiryDate), "dd/MM/yyyy")}`, 190, 78, { align: "right" });
        let refY = 84;
        if (quoteNumber) {
            doc.text(`Réf Devis: ${quoteNumber}`, 190, refY, { align: "right" });
            refY += 6;
        }
        if (poNumber) {
            doc.text(`Réf BC: ${poNumber}`, 190, refY, { align: "right" });
        }
    }

    // Table
    const tableTop = 100;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, tableTop, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text("RÉF.", 22, tableTop + 6.5);
    doc.text("DÉSIGNATION", 45, tableTop + 6.5);

    if (!isBL) {
        doc.text("QTÉ", 110, tableTop + 6.5, { align: "center" });
        doc.text("P.U HT", 135, tableTop + 6.5, { align: "center" });
        doc.text("TVA", 158, tableTop + 6.5, { align: "center" });
        doc.text("TOTAL HT", 185, tableTop + 6.5, { align: "right" });
    } else {
        doc.text("QTÉ", 130, tableTop + 6.5, { align: "center" });
    }

    let currentY = tableTop + 15;
    doc.setFont("helvetica", "normal");

    items.forEach((item: any, index: number) => {
        if (index % 2 === 0) {
            doc.setFillColor(252, 252, 253);
            doc.rect(20, currentY - 5, 170, 10, "F");
        }
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(item.reference || "—", 22, currentY);

        // Truncate long descriptions
        const desc = item.description.length > 28 ? item.description.substring(0, 25) + "..." : item.description;
        doc.text(desc, 45, currentY);

        if (!isBL) {
            doc.text(item.quantity.toString(), 110, currentY, { align: "center" });
            doc.text(`${item.price.toFixed(2)} DH`, 135, currentY, { align: "center" });
            const itemTaxRate = item.taxRate ?? taxRate;
            doc.text(`${itemTaxRate}%`, 158, currentY, { align: "center" });
            doc.text(`${(item.quantity * item.price).toFixed(2)} DH`, 185, currentY, { align: "right" });
        } else {
            doc.text(item.quantity.toString(), 130, currentY, { align: "center" });
        }
        currentY += 10;
    });

    // Totals Section (Only for Facture/Devis)
    if (!isBL) {
        currentY += 10;
        const totalsX = 140;
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

        // Per-item TVA calculation
        const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const taxAmount = items.reduce((acc: number, item: any) => {
            const itemTaxRate = item.taxRate ?? taxRate;
            return acc + (item.price * item.quantity * itemTaxRate / 100);
        }, 0);

        // Group TVA by rate for display
        const taxGroups: Record<number, number> = {};
        items.forEach((item: any) => {
            const rate = item.taxRate ?? taxRate;
            const itemHT = item.price * item.quantity;
            taxGroups[rate] = (taxGroups[rate] || 0) + itemHT * rate / 100;
        });

        doc.text("TOTAL HT", totalsX, currentY);
        doc.text(`${subtotal.toFixed(2)} DH`, 185, currentY, { align: "right" });
        currentY += 8;

        // Show each TVA rate group
        Object.entries(taxGroups).forEach(([rate, amount]) => {
            doc.text(`TVA (${rate}%)`, totalsX, currentY);
            doc.text(`${amount.toFixed(2)} DH`, 185, currentY, { align: "right" });
            currentY += 8;
        });

        if (discount > 0) {
            doc.text("REMISE", totalsX, currentY);
            doc.text(`-${discount.toFixed(2)} DH`, 185, currentY, { align: "right" });
            currentY += 8;
        }
        currentY += 4;
        doc.setFillColor(darkText[0], darkText[1], darkText[2]);
        doc.rect(totalsX - 5, currentY - 8, 55, 12, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("TOTAL NET TTC", totalsX, currentY);
        doc.text(`${total.toFixed(2)} DH`, 185, currentY, { align: "right" });
    } else {
        // BL Signature Area
        currentY += 20;
        doc.setFont("helvetica", "bold");
        doc.text("Cachet et signature du client :", 120, currentY);
        doc.setDrawColor(200, 200, 200);
        doc.rect(120, currentY + 5, 70, 30);
    }

    if (notes) {
        currentY += isBL ? 50 : 15;
        if (currentY > 230) doc.addPage();
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("Notes / Conditions :", 20, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(notes, 20, currentY + 6, { maxWidth: 170 });
    }

    const footerTop = 275;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, footerTop, 190, footerTop);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    const legalInfo = [company.name, `ICE: ${company.ice || "—"} | IF: ${company.if || "—"} | RC: ${company.rc || "—"}`].join(" • ");
    doc.text(legalInfo, 105, footerTop + 6, { align: "center" });
    doc.text("Géré avec Makhazine.com", 105, footerTop + 12, { align: "center" });

    if (returnBase64) {
        return doc.output("datauristring");
    } else {
        doc.save(`${typeLabel.replace(/ /g, "_")}_${number}.pdf`);
    }
};
