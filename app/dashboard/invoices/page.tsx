import { FileText, Search, Filter, Plus, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";
import { AddQuoteDialog } from "@/components/invoices/AddQuoteDialog";
import { InvoicesDashboardTabs } from "@/components/invoices/InvoicesDashboardTabs";
import { getInvoices, getQuotes } from "@/actions/invoices";
import { getAllPayments } from "@/actions/payments";

export default async function InvoicesPage() {
    const invoices = await getInvoices();
    const quotes = await getQuotes();
    const payments = await getAllPayments();

    const today = new Date();

    // Sum of all payments (partial or full)
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    // Sum of remaining balances for pending and overdue invoices
    let totalPending = 0;
    let totalOverdue = 0;

    invoices.forEach(i => {
        const paidForThisInvoice = i.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
        const remaining = i.total - paidForThisInvoice;

        if (remaining > 0) {
            const isOverdue = new Date(i.dueDate) < today && i.status !== "PAID";
            if (isOverdue) {
                totalOverdue += remaining;
            } else {
                totalPending += remaining;
            }
        }
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-3 underline decoration-orange-500 decoration-4 underline-offset-8">Flux Financiers</h1>
                    <p className="text-slate-500 font-medium">
                        Gérez vos factures et suivez la santé de votre trésorerie en temps réel.
                    </p>
                </div>
                <div className="flex gap-3">
                    <AddQuoteDialog />
                    <AddInvoiceDialog />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[32px] border-none shadow-xl shadow-emerald-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="bg-emerald-100 p-2 rounded-lg"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
                        <p className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">Encaissé</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2 relative z-10">{totalPaid.toLocaleString()} DH</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border-none shadow-xl shadow-orange-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="bg-orange-100 p-2 rounded-lg"><Clock className="h-4 w-4 text-orange-600" /></div>
                        <p className="text-orange-700 font-black text-[10px] uppercase tracking-widest">À Recouvrer</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2 relative z-10">{totalPending.toLocaleString()} DH</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border-none shadow-xl shadow-red-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="bg-red-100 p-2 rounded-lg"><AlertCircle className="h-4 w-4 text-red-600" /></div>
                        <p className="text-red-700 font-black text-[10px] uppercase tracking-widest">Retards</p>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mt-2 relative z-10">{totalOverdue.toLocaleString()} DH</p>
                </div>
            </div>

            <InvoicesDashboardTabs invoices={invoices} quotes={quotes} payments={payments} />
        </div>
    );
}
