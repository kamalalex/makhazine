"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Banknote, CreditCard, Landmark, ReceiptText } from "lucide-react";

export function RecentPayments({ payments = [] }: { payments?: any[] }) {
    const getMethodIcon = (method: string) => {
        switch (method) {
            case "CASH": return <Banknote className="h-4 w-4 text-emerald-500" />;
            case "CHEQUE": return <CreditCard className="h-4 w-4 text-blue-500" />;
            case "LCN": return <Landmark className="h-4 w-4 text-orange-500" />;
            case "VIREMENT": return <ReceiptText className="h-4 w-4 text-purple-500" />;
            default: return <Banknote className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <Card className="col-span-3 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Historique des Paiements</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Récapitulatif de toutes les transactions encaissées.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="pl-8 font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Date</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Client / Facture</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Mode</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Référence</TableHead>
                            <TableHead className="pr-8 font-black text-[9px] uppercase tracking-widest text-slate-400 h-14 text-right">Montant</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Aucun paiement enregistré</TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment.id} className="hover:bg-slate-50 border-slate-50 transition-colors">
                                    <TableCell className="pl-8 py-5">
                                        <div className="font-black text-xs text-slate-900">{format(new Date(payment.date), "dd/MM/yyyy")}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(payment.date), "HH:mm")}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-slate-900 text-sm">{payment.invoice?.client?.name || "Client Inconnu"}</div>
                                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Facture: {payment.invoice?.number}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getMethodIcon(payment.method)}
                                            <span className="text-xs font-black text-slate-700 uppercase">{payment.method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-bold text-slate-600">{payment.reference || "-"}</div>
                                        {payment.dueDate && (
                                            <div className="text-[9px] font-black text-orange-500 uppercase">Échéance: {format(new Date(payment.dueDate), "dd/MM/yyyy")}</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="pr-8 text-right font-black text-slate-900">
                                        {payment.amount.toLocaleString()} DH
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
