import { getPurchaseOrder } from "@/actions/purchases";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Package, Calendar, Settings2, ShieldCheck, CheckCircle2, FileText, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReceivePOBtn } from "@/components/purchases/ReceivePOBtn";
import { InvoicePOBtn } from "@/components/purchases/InvoicePOBtn";

export default async function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const po = await getPurchaseOrder(id);

    if (!po) return notFound();

    let statusColor = "bg-slate-100 text-slate-700";
    let statusText = "BROUILLON";
    let progress = 25;

    if (po.status === "ORDERED") { statusColor = "bg-blue-100 text-blue-700"; statusText = "COMMANDÉ"; progress = 50; }
    if (po.status === "PARTIAL") { statusColor = "bg-orange-100 text-orange-700"; statusText = "PARTIELLEMENT REÇU"; progress = 75; }
    if (po.status === "RECEIVED") { statusColor = "bg-green-100 text-green-700"; statusText = "MARCHANDISE REÇUE"; progress = 90; }
    if (po.status === "INVOICED") { statusColor = "bg-emerald-100 text-emerald-700"; statusText = "CLÔTURÉ (FACTURE)"; progress = 100; }

    const orderedTotal = po.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const receivedTotal = po.items.reduce((acc, item) => acc + ((item.receivedQuantity || 0) * item.unitPrice), 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="rounded-2xl h-12 w-12 p-0 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                        <Link href="/dashboard/purchases"><ChevronLeft className="h-6 w-6" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">
                            Bon de Commande <span className="text-emerald-600">#{po.number}</span>
                        </h1>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            {po.supplier?.name} • <Badge className={`${statusColor} border-none px-2 h-5 font-black uppercase text-[8px] rounded-full tracking-wider`}>{statusText}</Badge>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl font-bold h-12 px-6 border-slate-200">
                        <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status & Actions Card */}
                <Card className="lg:col-span-1 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white flex flex-col">
                    <div className="h-2 bg-slate-900 w-full shrink-0" />
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-emerald-600" />
                            Workflow d'Achat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="relative">
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />

                                {/* Step 1: Commande */}
                                <div className="flex gap-4 relative z-10 mb-8">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${progress >= 50 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-100 text-slate-400'}`}>
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm">Émission BC</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{new Date(po.date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Step 2: Réception */}
                                <div className="flex gap-4 relative z-10 mb-8">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${progress >= 75 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-100 text-slate-400'}`}>
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm">Réception Marchandise</p>
                                        {progress < 75 ? (
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-snug">Attente de livraison. Prévue le {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : "—"}</p>
                                        ) : (
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1">Landed Cost Calculé</p>
                                        )}
                                    </div>
                                </div>

                                {/* Step 3: Facturation */}
                                <div className="flex gap-4 relative z-10">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${progress >= 100 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-100 text-slate-400'}`}>
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm">Conformité & Facture</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 leading-snug">Rapprochement BC/Réception/Facture</p>
                                        {po.invoiceNumber && <Badge className="mt-2 bg-emerald-50 text-emerald-700 font-bold border-emerald-200">Facture: {po.invoiceNumber}</Badge>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 space-y-3 border-t border-slate-50 mt-8">
                            {progress < 75 && (
                                <ReceivePOBtn po={po} />
                            )}
                            {(progress >= 75 && progress < 100) && (
                                <InvoicePOBtn po={po} receivedTotal={receivedTotal} />
                            )}
                            {progress === 100 && (
                                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Cycle complet & PMP à jour
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Détails des Articles</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4">Désignation</th>
                                            <th className="px-4 py-4 text-center">Cmd</th>
                                            <th className="px-4 py-4 text-center">Reçu</th>
                                            <th className="px-4 py-4 text-right">P.U HT</th>
                                            <th className="px-8 py-4 text-right">Total HT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {po.items.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <p className="font-black text-slate-900">{item.product?.name || "Produit inconnu"}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">{item.product?.reference}</p>
                                                </td>
                                                <td className="px-4 py-4 text-center font-bold text-slate-600">
                                                    {item.quantity} {item.unitOfMeasure}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <Badge className={`${item.receivedQuantity === item.quantity ? 'bg-emerald-100 text-emerald-700' : (item.receivedQuantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500')} border-none font-black text-[10px]`}>
                                                        {item.receivedQuantity || 0}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right font-black text-slate-900">{item.unitPrice.toLocaleString()}</td>
                                                <td className="px-8 py-4 text-right font-black text-orange-600">
                                                    {((item.receivedQuantity > 0 ? item.receivedQuantity : item.quantity) * item.unitPrice).toLocaleString()} DH
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-slate-900 p-8 text-white grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes d'Achat</p>
                                    <p className="text-xs font-medium text-slate-300 bg-slate-800 p-4 rounded-2xl leading-relaxed">
                                        {po.notes || "Aucune note additionnelle."}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Total Prévisionnel</span>
                                        <span>{orderedTotal.toLocaleString()} DH</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Frais d'Approche (Prévu)</span>
                                        <span>{po.additionalCosts || 0} DH</span>
                                    </div>
                                    <div className="h-[1px] bg-slate-800 w-full" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-emerald-500 uppercase text-xs tracking-[0.2em]">Total Réel (Reçu)</span>
                                        <span className="text-3xl font-black">{receivedTotal.toLocaleString()} DH</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
