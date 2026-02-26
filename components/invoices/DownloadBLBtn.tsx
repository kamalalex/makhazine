"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Loader2 } from "lucide-react";
import { createDeliveryNote, getInvoiceById } from "@/actions/invoices";
import { generateDocumentPDF } from "@/lib/pdf-generator";

export function DownloadBLBtn({ invoiceId }: { invoiceId: string }) {
    const [loading, setLoading] = useState(false);

    const handleGenerateBL = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            const invoice = await getInvoiceById(invoiceId);
            if (!invoice || !invoice.user.company) {
                alert("Impossible de générer le BL: veuillez configurer les informations de votre entreprise dans les Paramètres.");
                return;
            }

            // Create BL record in DB
            const deliveryNote = await createDeliveryNote(invoice.id);

            // Prepare data for PDF
            const blData = {
                ...deliveryNote,
                company: invoice.user.company,
                client: invoice.client,
                // These are for the template helpers
                taxRate: 0,
                discount: 0,
                total: 0,
                notes: `Bon de Livraison lié à la facture ${invoice.number}`
            };

            // Generate PDF
            await generateDocumentPDF(blData, "DELIVERY_NOTE");

        } catch (error: any) {
            console.error("Erreur BL:", error);
            alert(error.message || "Erreur lors de la génération du BL");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 group-hover:bg-blue-50 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-tighter transition-all px-2"
            onClick={handleGenerateBL}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
        </Button>
    );
}
