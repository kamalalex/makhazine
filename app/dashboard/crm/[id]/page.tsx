import { getClientStats } from "@/actions/crm";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Mail, Phone, MapPin, TrendingUp, CreditCard, ShoppingBag, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditClientDialog } from "@/components/crm/EditClientDialog";
import { AutoReminderToggle } from "@/components/crm/AutoReminderToggle";
import { ReminderHistory } from "@/components/crm/ReminderHistory";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const clientRaw = await prisma.client.findUnique({
        where: { id: id },
    });

    if (!clientRaw) return notFound();
    const client = clientRaw as any;

    const stats = await getClientStats(id);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="rounded-2xl h-12 w-12 p-0 hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors">
                        <Link href="/dashboard/crm"><ChevronLeft className="h-6 w-6" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">
                            Détails <span className="text-orange-600">Client</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Expertise 360° du partenaire commercial.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AutoReminderToggle clientId={client.id} initialStatus={client.autoRemindersEnabled} />
                    <EditClientDialog client={client} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identity Card */}
                <Card className="lg:col-span-1 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                    <div className="h-2 bg-slate-900 w-full" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-orange-50 p-4 rounded-2xl">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                            <Badge className={`${client.isProspect ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"} border-none px-4 h-7 font-black uppercase text-[10px] rounded-full`}>
                                {client.isProspect ? "Prospect" : "Client Actif"}
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900 leading-tight uppercase">{client.name}</CardTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {client.id.slice(-6)}</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center text-sm font-bold text-slate-600">
                                <Mail className="h-4 w-4 mr-4 text-orange-400" />
                                {client.email || "Non renseigné"}
                            </div>
                            <div className="flex items-center text-sm font-bold text-slate-600">
                                <Phone className="h-4 w-4 mr-4 text-orange-400" />
                                {client.phone || "Non renseigné"}
                            </div>
                            <div className="flex items-start text-sm font-bold text-slate-600">
                                <MapPin className="h-4 w-4 mr-4 mt-1 text-orange-400" />
                                <span className="flex-1">{client.billingAddress || client.address || "Adresse non renseignée"}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ICE</p>
                                    <p className="text-xs font-black text-slate-900">{client.ice || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">IF</p>
                                    <p className="text-xs font-black text-slate-900">{client.if || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Summary */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="shadow-xl border-none rounded-[32px] bg-white p-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Lifetime Value</span>
                            <div className="text-2xl font-black text-slate-900">{stats.ltv.toLocaleString()} DH</div>
                            <div className="mt-2 text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" /> {stats.invoiceCount} Factures
                            </div>
                        </Card>
                        <Card className={`shadow-xl border-none rounded-[32px] p-6 ${stats.isOverLimit ? 'bg-red-50' : 'bg-white'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${stats.isOverLimit ? 'text-red-600' : 'text-slate-400'}`}>Encours Actuel</span>
                            <div className={`text-2xl font-black ${stats.isOverLimit ? 'text-red-600' : 'text-slate-900'}`}>{stats.encours.toLocaleString()} DH</div>
                            <p className="text-[9px] font-bold uppercase mt-2 text-slate-400">Plafond: {client.creditLimit?.toLocaleString() || 0} DH</p>
                        </Card>
                        <Card className="shadow-xl border-none rounded-[32px] bg-slate-900 p-6 text-white">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Retards de Paiement</span>
                            <div className="text-2xl font-black">{stats.overdueCount}</div>
                            {stats.hasOverdue && (
                                <div className="mt-2 text-[9px] font-bold text-orange-400 uppercase flex items-center gap-1.5 animate-pulse">
                                    <Clock className="h-3 w-3" /> Relance requise
                                </div>
                            )}
                        </Card>
                    </div>

                    <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Activité Récente</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="space-y-6">
                                {stats.recentQuotes.length > 0 ? (
                                    stats.recentQuotes.map((quote: any) => (
                                        <div key={quote.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white p-3 rounded-xl shadow-sm">
                                                    <FileText className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm">{quote.number}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Devis du {new Date(quote.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 text-sm">{quote.total.toLocaleString()} DH</p>
                                                <Badge className="bg-orange-100 text-orange-700 border-none px-2 h-5 font-black uppercase text-[8px] rounded-full">{quote.status}</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucun document récent</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <ReminderHistory invoices={(stats as any).invoices || []} />
                </div>
            </div>
        </div>
    );
}
