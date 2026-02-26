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
import { DownloadInvoiceBtn } from "@/components/invoices/DownloadInvoiceBtn";
import { DownloadBLBtn } from "@/components/invoices/DownloadBLBtn";
import { UploadDocumentBtn } from "@/components/invoices/UploadDocumentBtn";
import { ShareDocumentBtn } from "@/components/invoices/ShareDocumentBtn";
import { InvoicePaymentsDialog } from "@/components/invoices/InvoicePaymentsDialog";

interface RecentInvoicesProps {
    invoices?: any[];
}

export function RecentInvoices({ invoices: propInvoices }: RecentInvoicesProps) {
    const defaultInvoices = [
        {
            id: "DEMO-001",
            client: { name: "Société Atlas SARL" },
            total: 12500,
            status: "Payée",
            createdAt: new Date("2026-02-15"),
        },
        {
            id: "DEMO-002",
            client: { name: "Maroc Telecom" },
            total: 4300,
            status: "En attente",
            createdAt: new Date("2026-02-18"),
        }
    ];

    const displayInvoices = propInvoices ?? defaultInvoices;

    const getStatusBadge = (invoice: any) => {
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);
        const paid = invoice.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
        const remaining = invoice.total - paid;

        // Calculate effective status
        let effectiveStatus = invoice.status;
        if (remaining > 0 && dueDate < today) {
            effectiveStatus = "OVERDUE";
        }

        switch (effectiveStatus) {
            case "PAID":
            case "Payée":
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Encaissé</Badge>;
            case "PARTIAL":
                return (
                    <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full text-nowrap">Recouvrement Partiel</Badge>
                        <span className="text-[10px] font-black text-blue-600 tracking-tighter">Reste: {remaining.toLocaleString()} DH</span>
                    </div>
                );
            case "PENDING":
            case "En attente":
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">À Recouvrer</Badge>;
            case "OVERDUE":
            case "En retard":
                return (
                    <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Impayé / Retard</Badge>
                        {remaining < invoice.total && remaining > 0 && (
                            <span className="text-[10px] font-black text-red-600 tracking-tighter">Reste: {remaining.toLocaleString()} DH</span>
                        )}
                    </div>
                );
            case "DRAFT":
            case "Brouillon":
                return <Badge variant="outline" className="border-slate-200 text-slate-400 px-2 h-5 font-black uppercase text-[8px] rounded-full">Brouillon</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-600">{effectiveStatus}</Badge>;
        }
    };

    return (
        <Card className="col-span-3 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Dernières Opérations</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Suivi des flux de facturation récents.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="pl-8 font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Réf. Document</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Client / Société</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Montant Net</TableHead>
                            <TableHead className="pr-8 font-black text-[9px] uppercase tracking-widest text-slate-400 h-14 text-right">Etat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayInvoices.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-slate-50 cursor-pointer border-slate-50 transition-colors group">
                                <TableCell className="pl-8 py-5 font-black text-xs text-orange-600 group-hover:underline">{invoice.number || invoice.id}</TableCell>
                                <TableCell>
                                    <div className="font-bold text-slate-900 text-sm">{invoice.client?.name || "Client Inconnu"}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                                </TableCell>
                                <TableCell className="font-black text-slate-900">{invoice.total.toLocaleString()} DH</TableCell>
                                <TableCell className="pr-8 text-right flex items-center justify-end gap-2">
                                    {getStatusBadge(invoice)}
                                    <InvoicePaymentsDialog
                                        invoiceId={invoice.id}
                                        invoiceNumber={invoice.number}
                                        totalAmount={invoice.total}
                                    />
                                    <UploadDocumentBtn
                                        invoiceId={invoice.id}
                                        attachments={invoice.attachments}
                                        quoteNumber={invoice.quoteNumber}
                                        poNumber={invoice.poNumber}
                                    />
                                    <DownloadBLBtn invoiceId={invoice.id} />
                                    <ShareDocumentBtn
                                        documentId={invoice.id}
                                        type="INVOICE"
                                        documentNumber={invoice.number}
                                        clientEmail={invoice.client?.email || ""}
                                        clientPhone={invoice.client?.phone || ""}
                                    />
                                    <DownloadInvoiceBtn invoiceId={invoice.id} invoiceNumber={invoice.number} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {displayInvoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Aucune facture émise</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
