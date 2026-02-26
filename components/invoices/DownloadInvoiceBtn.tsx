"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { getInvoiceById } from "@/actions/invoices";
import { generateDocumentPDF } from "@/lib/pdf-generator";

export function DownloadInvoiceBtn({ invoiceId, invoiceNumber }: { invoiceId: string, invoiceNumber: string }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        setLoading(true);
        try {
            const fullInvoice = await getInvoiceById(invoiceId);
            if (fullInvoice && fullInvoice.user.company) {
                await generateDocumentPDF({
                    ...fullInvoice,
                    company: fullInvoice.user.company
                }, "INVOICE");
            } else {
                alert("Données de la société manquantes. Veuillez les configurer dans les réglages.");
            }
        } catch (error) {
            console.error("Erreur PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors"
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        </Button>
    );
}
