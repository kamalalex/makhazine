import { FileText, Search, Filter, Plus, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { getInvoices } from "@/actions/invoices";
import { AddInvoiceDialog } from "@/components/invoices/AddInvoiceDialog";

export default async function InvoicesPage() {
    const invoices = await getInvoices();

    const totalPaid = invoices.filter(i => i.status === "PAID").reduce((acc, i) => acc + i.total, 0);
    const totalPending = invoices.filter(i => i.status === "PENDING").reduce((acc, i) => acc + i.total, 0);
    const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((acc, i) => acc + i.total, 0);

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
                    <Button variant="outline" className="rounded-xl border-2 font-bold px-6 h-12 hover:bg-white text-slate-600">
                        <Plus className="mr-2 h-4 w-4" /> Nouveau Devis
                    </Button>
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

            <Tabs defaultValue="invoices" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <TabsList className="bg-white border p-1 h-14 shadow-xl shadow-slate-200/40 rounded-[24px] w-full md:w-auto">
                        <TabsTrigger value="invoices" className="px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white h-full">Factures</TabsTrigger>
                        <TabsTrigger value="quotes" className="px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white h-full">Devis</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <Input placeholder="Rechercher un document..." className="h-12 pl-12 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 focus-visible:ring-orange-500 font-bold" />
                        </div>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 hover:bg-slate-50">
                            <Filter className="h-5 w-5 text-slate-400" />
                        </Button>
                    </div>
                </div>

                <TabsContent value="invoices" className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <RecentInvoices invoices={invoices} />
                </TabsContent>

                <TabsContent value="quotes" className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white p-20 rounded-[40px] border-4 border-dashed border-slate-100 text-center shadow-xl shadow-slate-200/20 group hover:border-orange-100 transition-colors">
                        <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-50 transition-colors">
                            <FileText className="h-10 w-10 text-slate-200 group-hover:text-orange-200 transition-colors" />
                        </div>
                        <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Module Devis</p>
                        <p className="text-slate-400 font-medium mt-2">La gestion avancée des devis sera activée lors de la prochaine mise à jour.</p>
                        <Button variant="link" className="text-orange-600 font-black uppercase text-[10px] tracking-widest mt-6">Accéder à la version Beta</Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
