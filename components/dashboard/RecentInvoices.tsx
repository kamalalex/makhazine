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

    const displayInvoices = propInvoices && propInvoices.length > 0 ? propInvoices : defaultInvoices;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
            case "Payée":
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Encaissé</Badge>;
            case "PENDING":
            case "En attente":
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">À Recouvrer</Badge>;
            case "OVERDUE":
            case "En retard":
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Impayé</Badge>;
            case "DRAFT":
            case "Brouillon":
                return <Badge variant="outline" className="border-slate-200 text-slate-400 px-2 h-5 font-black uppercase text-[8px] rounded-full">Brouillon</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-600">{status}</Badge>;
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
                                <TableCell className="pr-8 text-right">
                                    {getStatusBadge(invoice.status)}
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
