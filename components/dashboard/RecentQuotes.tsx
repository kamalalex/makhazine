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
import { DownloadQuoteBtn } from "@/components/invoices/DownloadQuoteBtn";
import { ConvertQuoteDialog } from "@/components/invoices/ConvertQuoteDialog";
import { ShareDocumentBtn } from "@/components/invoices/ShareDocumentBtn";

interface RecentQuotesProps {
    quotes?: any[];
}

export function RecentQuotes({ quotes = [] }: RecentQuotesProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACCEPTED":
                return <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Accepté</Badge>;
            case "SENT":
                return <Badge className="bg-blue-100 text-blue-700 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Envoyé</Badge>;
            case "CONVERTED":
                return <Badge className="bg-orange-100 text-orange-700 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Facturé</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-400 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">Brouillon</Badge>;
        }
    };

    return (
        <Card className="col-span-3 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Offres Commerciales (Devis)</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Suivi de vos propositions en cours.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="pl-8 font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Réf. Devis</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Client / Société</TableHead>
                            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 h-14">Montant Estimé</TableHead>
                            <TableHead className="pr-8 font-black text-[9px] uppercase tracking-widest text-slate-400 h-14 text-right">Etat & PDF</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.map((quote) => (
                            <TableRow key={quote.id} className="hover:bg-slate-50 cursor-pointer border-slate-50 transition-colors group">
                                <TableCell className="pl-8 py-5 font-black text-xs text-orange-600 truncate max-w-[120px]">{quote.number}</TableCell>
                                <TableCell>
                                    <div className="font-bold text-slate-900 text-sm">{quote.client?.name || "Client Inconnu"}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(quote.createdAt).toLocaleDateString()}</div>
                                </TableCell>
                                <TableCell className="font-black text-slate-900">{quote.total.toLocaleString()} DH</TableCell>
                                <TableCell className="pr-8 text-right flex items-center justify-end gap-2 h-full py-5">
                                    {getStatusBadge(quote.status)}
                                    {(!quote.isConverted && quote.status !== 'CONVERTED') && (
                                        <ConvertQuoteDialog quote={quote} />
                                    )}
                                    <ShareDocumentBtn
                                        documentId={quote.id}
                                        type="QUOTE"
                                        documentNumber={quote.number}
                                        clientEmail={quote.client?.email || ""}
                                        clientPhone={quote.client?.phone || ""}
                                    />
                                    <DownloadQuoteBtn quoteId={quote.id} quoteNumber={quote.number} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {quotes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Aucun devis enregistré</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
