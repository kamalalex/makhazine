import { getRestockSuggestions } from "@/actions/purchases";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Package, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function RestockNeeds() {
    const suggestions = await getRestockSuggestions();

    if (suggestions.length === 0) {
        return (
            <Card className="col-span-full shadow-sm rounded-3xl border-slate-100 bg-emerald-50/50">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black text-emerald-900 flex items-center gap-3">
                        <Zap className="h-6 w-6 text-emerald-500" />
                        Stocks Optimisés
                    </CardTitle>
                    <CardDescription className="text-emerald-700/70 font-bold text-xs uppercase tracking-widest mt-1">
                        Aucune alerte de réapprovisionnement
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-2">
                    <p className="text-sm font-medium text-emerald-800">Tous vos produits sont au-dessus de leur seuil d'alerte. Maintien parfait !</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full shadow-2xl rounded-[40px] border-none bg-gradient-to-br from-orange-50 to-white overflow-hidden border border-orange-100">
            <div className="h-3 bg-red-500 w-full" />
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black text-red-900 flex items-center gap-3 tracking-tight">
                    <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
                    Besoins d'Achat (Smart Restock)
                </CardTitle>
                <CardDescription className="text-red-700/60 font-bold text-[10px] uppercase tracking-widest mt-1">
                    L'IA suggère des achats pour éviter la rupture de stock
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 flex flex-col gap-4 relative overflow-hidden group hover:border-red-300 transition-all">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full flex items-start justify-end p-3">
                                <ShieldAlert className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
                            </div>

                            <div>
                                <h4 className="font-black text-lg text-slate-900 pr-8 leading-tight">{item.product.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {item.product.reference}</p>
                            </div>

                            <div className="bg-red-50 rounded-xl p-4 flex justify-between items-center border border-red-100/50">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-red-500 tracking-wider">Actuel</p>
                                    <p className="text-xl font-black text-red-700">{item.product.stock}</p>
                                </div>
                                <div className="h-8 w-[2px] bg-red-200 rounded-full" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Seuil</p>
                                    <p className="text-xl font-black text-slate-700">{item.product.lowStockAlert}</p>
                                </div>
                                <div className="h-8 w-[2px] bg-red-200 rounded-full" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Suggéré</p>
                                    <p className="text-xl font-black text-orange-600">{item.suggestedQuantity}</p>
                                </div>
                            </div>

                            {item.bestSupplier && (
                                <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5 tracking-widest mb-1.5">
                                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        Meilleur Fournisseur
                                    </p>
                                    <div className="flex justify-between items-end">
                                        <p className="font-black text-sm text-slate-800 truncate">{item.bestSupplier.name}</p>
                                        <p className="text-xs font-black text-emerald-600">{item.bestHistoricalPrice?.toFixed(2)} dhs</p>
                                    </div>
                                </div>
                            )}

                            <Button asChild className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20">
                                <Link href={`/dashboard/purchases/new?product=${item.product.id}&supplier=${item.bestSupplier?.id || ''}&qty=${item.suggestedQuantity}`}>
                                    Créer Bon de Commande
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
