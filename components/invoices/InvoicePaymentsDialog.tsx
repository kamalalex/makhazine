"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    Plus,
    Trash2,
    Loader2,
    Calendar as CalendarIcon,
    Banknote,
    CreditCard,
    HandCoins
} from "lucide-react";
import { addPayment, deletePayment, getPaymentsByInvoice } from "@/actions/payments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InvoicePaymentsDialog({
    invoiceId,
    invoiceNumber,
    totalAmount
}: {
    invoiceId: string,
    invoiceNumber: string,
    totalAmount: number
}) {
    const [open, setOpen] = useState(false);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [method, setMethod] = useState("CASH");
    const [reference, setReference] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getPaymentsByInvoice(invoiceId);
            setPayments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchPayments();
            setShowForm(false);
        }
    }, [open]);

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const balance = totalAmount - totalPaid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            await addPayment(invoiceId, {
                amount: parseFloat(amount),
                date: new Date(date),
                method,
                reference,
                dueDate: dueDate ? new Date(dueDate) : null,
                notes
            });
            setAmount("");
            setReference("");
            setDueDate("");
            setNotes("");
            setShowForm(false);
            await fetchPayments();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout du paiement");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce paiement ?")) return;
        try {
            await deletePayment(id, invoiceId);
            await fetchPayments();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 group-hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 font-bold text-[10px] uppercase tracking-tighter"
                    >
                        <Wallet className="h-3 w-3 mr-1" /> Paiements
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] border-none shadow-2xl rounded-[32px] p-8">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-emerald-600" /> Paiements Facture {invoiceNumber}
                    </DialogTitle>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Facture</p>
                            <p className="text-lg font-black text-slate-900">{totalAmount.toLocaleString()} DH</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${balance <= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${balance <= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {balance <= 0 ? 'Réglée' : 'Reste à percevoir'}
                            </p>
                            <p className={`text-lg font-black ${balance <= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                                {Math.max(0, balance).toLocaleString()} DH
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Historique des transactions</h3>
                        {!showForm && balance > 0 && (
                            <Button size="sm" onClick={() => {
                                setShowForm(true);
                                setAmount(balance.toString());
                            }} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase">
                                <Plus className="h-3 w-3 mr-1" /> Nouveau Règlement
                            </Button>
                        )}
                    </div>

                    {showForm ? (
                        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Montant (DH)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="h-10 rounded-xl bg-white border-none shadow-sm font-black"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date</Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        className="h-10 rounded-xl bg-white border-none shadow-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mode de Paiement</Label>
                                    <select
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        className="w-full h-10 rounded-xl bg-white border-none shadow-sm text-sm font-bold px-3 focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                                    >
                                        <option value="CASH">Espèces</option>
                                        <option value="CHEQUE">Chèque</option>
                                        <option value="LCN">LCN (Effet)</option>
                                        <option value="VIREMENT">Virement</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Référence / N° Doc</Label>
                                    <Input
                                        placeholder="Ex: CHQ-8293..."
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        className="h-10 rounded-xl bg-white border-none shadow-sm font-bold placeholder:font-medium"
                                    />
                                </div>
                            </div>

                            {(method === "CHEQUE" || method === "LCN") && (
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date d&apos;échéance (Encaissement)</Label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="h-10 rounded-xl bg-white border-none shadow-sm font-bold"
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 rounded-xl font-bold">Annuler</Button>
                                <Button type="submit" disabled={adding} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black">
                                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le règlement"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <HandCoins className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-slate-400 uppercase">Aucun paiement enregistré</p>
                                </div>
                            ) : (
                                payments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors group/item">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-50 p-2.5 rounded-xl text-slate-400 group-hover/item:text-emerald-600 group-hover/item:bg-emerald-50 transition-colors">
                                                {p.method === "CASH" ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{p.amount.toLocaleString()} DH</p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    <span>{format(new Date(p.date), "dd MMMM yyyy", { locale: fr })}</span>
                                                    <span>•</span>
                                                    <span className="text-slate-600 font-black">{p.method}</span>
                                                    {p.reference && <span>• Ref: {p.reference}</span>}
                                                </div>
                                                {p.dueDate && (
                                                    <p className="text-[9px] font-black text-orange-600 uppercase mt-1">Echéance: {format(new Date(p.dueDate), "dd/MM/yyyy")}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(p.id)}
                                            className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover/item:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
