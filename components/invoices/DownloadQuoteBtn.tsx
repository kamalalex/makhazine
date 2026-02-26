"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { getQuoteById } from "@/actions/invoices";
import { generateDocumentPDF } from "@/lib/pdf-generator";

export function DownloadQuoteBtn({ quoteId, quoteNumber }: { quoteId: string, quoteNumber: string }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const fullQuote = await getQuoteById(quoteId);
            if (fullQuote && fullQuote.user.company) {
                await generateDocumentPDF({
                    ...fullQuote,
                    company: fullQuote.user.company,
                }, "QUOTE");
            } else {
                alert("Configuration société manquante.");
            }
        } catch (error) {
            console.error("Erreur PDF Quote:", error);
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
