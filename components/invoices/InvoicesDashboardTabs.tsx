"use client";

import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { RecentQuotes } from "@/components/dashboard/RecentQuotes";
import { RecentPayments } from "@/components/dashboard/RecentPayments";

export function InvoicesDashboardTabs({
    invoices,
    quotes,
    payments = []
}: {
    invoices: any[],
    quotes: any[],
    payments?: any[]
}) {
    const [searchQuery, setSearchQuery] = useState("");

    // Invoices Pagination
    const [invoicesPage, setInvoicesPage] = useState(1);
    const INVOICES_PER_PAGE = 10;

    // Quotes Pagination
    const [quotesPage, setQuotesPage] = useState(1);
    const QUOTES_PER_PAGE = 10;

    // Payments Pagination
    const [paymentsPage, setPaymentsPage] = useState(1);
    const PAYMENTS_PER_PAGE = 10;

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const term = searchQuery.toLowerCase();
            return (
                inv.number?.toLowerCase().includes(term) ||
                inv.client?.name?.toLowerCase().includes(term) ||
                inv.status?.toLowerCase().includes(term) ||
                inv.id.toLowerCase().includes(term)
            );
        });
    }, [invoices, searchQuery]);

    const filteredQuotes = useMemo(() => {
        return quotes.filter(q => {
            const term = searchQuery.toLowerCase();
            return (
                q.number?.toLowerCase().includes(term) ||
                q.client?.name?.toLowerCase().includes(term) ||
                q.status?.toLowerCase().includes(term) ||
                q.id.toLowerCase().includes(term)
            );
        });
    }, [quotes, searchQuery]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const term = searchQuery.toLowerCase();
            return (
                p.method?.toLowerCase().includes(term) ||
                p.reference?.toLowerCase().includes(term) ||
                p.invoice?.client?.name?.toLowerCase().includes(term) ||
                p.invoice?.number?.toLowerCase().includes(term)
            );
        });
    }, [payments, searchQuery]);

    const paginatedInvoices = useMemo(() => {
        const start = (invoicesPage - 1) * INVOICES_PER_PAGE;
        return filteredInvoices.slice(start, start + INVOICES_PER_PAGE);
    }, [filteredInvoices, invoicesPage]);

    const paginatedQuotes = useMemo(() => {
        const start = (quotesPage - 1) * QUOTES_PER_PAGE;
        return filteredQuotes.slice(start, start + QUOTES_PER_PAGE);
    }, [filteredQuotes, quotesPage]);

    const paginatedPayments = useMemo(() => {
        const start = (paymentsPage - 1) * PAYMENTS_PER_PAGE;
        return filteredPayments.slice(start, start + PAYMENTS_PER_PAGE);
    }, [filteredPayments, paymentsPage]);

    const totalInvoicesPages = Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE) || 1;
    const totalQuotesPages = Math.ceil(filteredQuotes.length / QUOTES_PER_PAGE) || 1;
    const totalPaymentsPages = Math.ceil(filteredPayments.length / PAYMENTS_PER_PAGE) || 1;

    // Reset pages when search changes
    useEffect(() => {
        setInvoicesPage(1);
        setQuotesPage(1);
        setPaymentsPage(1);
    }, [searchQuery]);

    return (
        <Tabs defaultValue="invoices" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <TabsList className="bg-white border p-1 h-14 shadow-xl shadow-slate-200/40 rounded-[24px] w-full md:w-auto overflow-x-auto overflow-y-hidden">
                    <TabsTrigger value="invoices" className="px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white h-full shrink-0">Factures {filteredInvoices.length > 0 && `(${filteredInvoices.length})`}</TabsTrigger>
                    <TabsTrigger value="quotes" className="px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white h-full shrink-0">Devis {filteredQuotes.length > 0 && `(${filteredQuotes.length})`}</TabsTrigger>
                    <TabsTrigger value="payments" className="px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white h-full shrink-0">Paiements {filteredPayments.length > 0 && `(${filteredPayments.length})`}</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par numéro, client..."
                            className="h-12 pl-12 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 focus-visible:ring-orange-500 font-bold"
                        />
                    </div>
                </div>
            </div>

            <TabsContent value="invoices" className="animate-in fade-in slide-in-from-left-4 duration-500">
                <RecentInvoices invoices={paginatedInvoices} />
                {filteredInvoices.length > INVOICES_PER_PAGE && (
                    <div className="flex items-center justify-center gap-4 mt-6 bg-white p-4 rounded-[24px] shadow-xl shadow-slate-200/20 max-w-sm mx-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInvoicesPage(p => Math.max(1, p - 1))}
                            disabled={invoicesPage === 1}
                            className="rounded-xl border-slate-200 h-10 px-4"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                        </Button>
                        <span className="text-xs font-bold text-slate-500">Page {invoicesPage} / {totalInvoicesPages}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInvoicesPage(p => Math.min(totalInvoicesPages, p + 1))}
                            disabled={invoicesPage === totalInvoicesPages}
                            className="rounded-xl border-slate-200 h-10 px-4"
                        >
                            Suivant <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="quotes" className="animate-in fade-in slide-in-from-right-4 duration-500">
                <RecentQuotes quotes={paginatedQuotes} />
                {filteredQuotes.length > QUOTES_PER_PAGE && (
                    <div className="flex items-center justify-center gap-4 mt-6 bg-white p-4 rounded-[24px] shadow-xl shadow-slate-200/20 max-w-sm mx-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuotesPage(p => Math.max(1, p - 1))}
                            disabled={quotesPage === 1}
                            className="rounded-xl border-slate-200 h-10 px-4"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                        </Button>
                        <span className="text-xs font-bold text-slate-500">Page {quotesPage} / {totalQuotesPages}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuotesPage(p => Math.min(totalQuotesPages, p + 1))}
                            disabled={quotesPage === totalQuotesPages}
                            className="rounded-xl border-slate-200 h-10 px-4"
                        >
                            Suivant <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <RecentPayments payments={paginatedPayments} />
                {filteredPayments.length > PAYMENTS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-4 mt-6 bg-white p-4 rounded-[24px] shadow-xl shadow-slate-200/20 max-w-sm mx-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}
                            disabled={paymentsPage === 1}
                            className="rounded-xl border-slate-200 h-10 px-4"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                        </Button>
                        <span className="text-xs font-bold text-slate-500">Page {paymentsPage} / {totalPaymentsPages}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaymentsPage(p => Math.min(totalPaymentsPages, p + 1))}
                            disabled={paymentsPage === totalPaymentsPages}
                            className="rounded-xl border-slate-200 h-10 px-4"
                        >
                            Suivant <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
