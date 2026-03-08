"use client";

import { useState } from "react";
import { processPurchaseOrder } from "@/actions/purchases";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, Check, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvoicePOBtn({ po, receivedTotal }: { po: any, receivedTotal: number }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceTotal, setInvoiceTotal] = useState(receivedTotal + (po.additionalCosts || 0));
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleInvoice() {
        setLoading(true);
        setError(null);
        try {
            await processPurchaseOrder(po.id, "INVOICED", {
                invoiceNumber,
                invoiceTotal
            });
            setOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Erreur de conformité");
        } finally {
            setLoading(false);
        }
    }

    const expectedTotal = receivedTotal + (po.additionalCosts || 0);
    const discrepancy = invoiceTotal - expectedTotal;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 text-white rounded-xl font-black border-none h-12 transition-all">
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Saisir Facture (Conformité)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <div className="h-2 bg-slate-900 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-xl">
                            <ShieldCheck className="h-6 w-6 text-slate-900" />
                        </div>
                        Contrôle Facture Fournisseur
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-8 pt-0 space-y-6">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-500">
                                Le système va vérifier la conformité entre la marchandise reçue et la facture de votre fournisseur. Une alarme sera déclenchée si le montant facturé dépasse ce qui est attendu.
                            </p>

                            {error && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-200">
                                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold flex-1">{error}</p>
                                </div>
                            )}

                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex justify-between items-center mb-6">
                                <div>
                                    <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-1">Montant Attendu (Landed Cost)</p>
                                    <p className="text-xl font-black text-slate-900">{expectedTotal.toLocaleString()} DH</p>
                                </div>
                                <ShieldCheck className="h-8 w-8 text-emerald-500 opacity-20" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1 mb-1 block">Numéro de la Facture Fournisseur</label>
                                    <Input
                                        type="text"
                                        placeholder="Ex: FAC-2023-..."
                                        value={invoiceNumber}
                                        onChange={e => setInvoiceNumber(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1 mb-1 block">Montant Total Facturé (TTC)</label>
                                    <Input
                                        type="number"
                                        value={invoiceTotal}
                                        onChange={e => setInvoiceTotal(Number(e.target.value))}
                                        className={`h-12 rounded-xl font-black text-xl flex items-center ${discrepancy > 1 ? 'border-red-500 bg-red-50 text-red-700 focus-visible:ring-red-500' : 'border-slate-200 bg-slate-50'}`}
                                    />
                                    {discrepancy > 1 && (
                                        <p className="text-[9px] font-black text-red-500 uppercase mt-2 tracking-widest">
                                            ⚠️ Écart Positif détecté: +{discrepancy.toLocaleString()} DH
                                        </p>
                                    )}
                                    {discrepancy < -1 && (
                                        <p className="text-[9px] font-black text-emerald-600 uppercase mt-2 tracking-widest">
                                            💡 Écart Négatif: -{Math.abs(discrepancy).toLocaleString()} DH (Facture inférieure au prévisionnel)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4 flex gap-3 bg-white border-t border-slate-50 shrink-0">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
                        Annuler
                    </Button>
                    <Button onClick={handleInvoice} disabled={loading || !invoiceNumber} className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-xl shadow-slate-900/20">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                Terminer & Créer Dette <Check className="h-4 w-4" />
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
