import { getSupplier } from "@/actions/suppliers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Mail, Phone, MapPin, Package, FileText, ShoppingBag, TrendingUp, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";

export default async function SupplierDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supplier = await getSupplier(id);

    if (!supplier) return notFound();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="rounded-2xl h-12 w-12 p-0 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                        <Link href="/dashboard/suppliers"><ChevronLeft className="h-6 w-6" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">
                            Détails <span className="text-emerald-600">Fournisseur</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Informations et historique des commandes.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <EditSupplierDialog supplier={supplier} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identity Card */}
                <Card className="lg:col-span-1 shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                    <div className="h-2 bg-slate-900 w-full" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-emerald-50 p-4 rounded-2xl">
                                <Truck className="h-6 w-6 text-emerald-600" />
                            </div>
                            <Badge className={`bg-emerald-100 text-emerald-700 border-none px-4 h-7 font-black uppercase text-[10px] rounded-full`}>
                                Actif
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900 leading-tight uppercase">{supplier.name}</CardTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Contact: {supplier.contactName || "—"}</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center text-sm font-bold text-slate-600">
                                <Mail className="h-4 w-4 mr-4 text-emerald-400" />
                                {supplier.email || "Non renseigné"}
                            </div>
                            <div className="flex items-center text-sm font-bold text-slate-600">
                                <Phone className="h-4 w-4 mr-4 text-emerald-400" />
                                {supplier.phone || "Non renseigné"}
                            </div>
                            <div className="flex items-start text-sm font-bold text-slate-600">
                                <MapPin className="h-4 w-4 mr-4 mt-1 text-emerald-400" />
                                <span className="flex-1">{supplier.address || "Adresse non renseignée"}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ICE</p>
                                <p className="text-xs font-black text-slate-900">{supplier.ice || "—"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders History */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-xl border-none rounded-[32px] bg-white p-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Commandes</span>
                            <div className="text-2xl font-black text-slate-900">{supplier.purchaseOrders.length}</div>
                            <div className="mt-2 text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" /> Historique complet
                            </div>
                        </Card>
                        <Card className="shadow-xl border-none rounded-[32px] bg-slate-900 p-6 text-white">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Dernier Achat</span>
                            <div className="text-2xl font-black">
                                {supplier.purchaseOrders.length > 0
                                    ? new Date(supplier.purchaseOrders[0].date).toLocaleDateString()
                                    : "—"}
                            </div>
                        </Card>
                    </div>

                    <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Activité Récente (Achats)</CardTitle>
                                <Button asChild variant="outline" size="sm" className="h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest text-emerald-600 border-emerald-200">
                                    <Link href={`/dashboard/purchases/new?supplier=${supplier.id}`}>
                                        + Nouvelle Commande
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="space-y-6">
                                {supplier.purchaseOrders.length > 0 ? (
                                    supplier.purchaseOrders.map((po: any) => {
                                        let statusColor = "bg-slate-100 text-slate-700";
                                        let statusText = "BROUILLON";

                                        if (po.status === "ORDERED") { statusColor = "bg-blue-100 text-blue-700"; statusText = "COMMANDÉ"; }
                                        if (po.status === "RECEIVED") { statusColor = "bg-green-100 text-green-700"; statusText = "REÇU"; }
                                        if (po.status === "PARTIAL") { statusColor = "bg-orange-100 text-orange-700"; statusText = "PARTIEL"; }
                                        if (po.status === "INVOICED") { statusColor = "bg-emerald-100 text-emerald-700"; statusText = "FACTURE REÇUE"; }

                                        return (
                                            <div key={po.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                                        <Package className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm">BC #{po.number}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Du {new Date(po.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={`${statusColor} border-none px-2 h-5 font-black uppercase text-[8px] rounded-full`}>{statusText}</Badge>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucune commande enregistrée</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
