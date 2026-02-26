import { getClients, getClientStats } from "@/actions/crm";
import { Users, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddClientDialog } from "@/components/crm/AddClientDialog";
import { Separator } from "@/components/ui/separator";
import { ClientTable } from "@/components/crm/ClientTable";

export default async function CRMPage() {
    const allClients = await getClients();

    // Segmentation logic (Client or Prospect)
    const prospects = allClients.filter((c: any) => (c as any).isProspect && !(c as any).isArchived);
    const activeClients = allClients.filter((c: any) => !(c as any).isProspect && !(c as any).isArchived);
    const inactiveClients = allClients.filter((c: any) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const updatedAt = (c as any).updatedAt ? new Date((c as any).updatedAt) : new Date();
        return updatedAt < threeMonthsAgo && !(c as any).isArchived;
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">
                        Centre <span className="text-orange-600">Relation</span> Client
                    </h1>
                    <p className="text-slate-500 font-medium max-w-md">
                        Gérez vos partenaires, suivez leur santé financière et optimisez votre tunnel de vente.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Encours Global Client</span>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">0,00 DH</div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-900/10 flex flex-col justify-center text-white">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaire (LTV)</span>
                    <div className="text-2xl font-black tracking-tighter">0,00 DH</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-[28px] shadow-xl shadow-slate-200/40 border border-slate-100 gap-4 mb-8">
                        <TabsList className="bg-transparent border-none h-14 w-full md:w-auto overflow-x-auto no-scrollbar">
                            <TabsTrigger value="all" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white h-full transition-all">Tout ({allClients.length})</TabsTrigger>
                            <TabsTrigger value="clients" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white h-full transition-all">Partenaires ({activeClients.length})</TabsTrigger>
                            <TabsTrigger value="prospects" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white h-full transition-all">Prospects ({prospects.length})</TabsTrigger>
                            <TabsTrigger value="inactive" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white h-full transition-all">À Relancer ({inactiveClients.length})</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 pr-4 pl-4 md:pl-0">
                            <Separator orientation="vertical" className="h-8 mx-2 hidden md:block" />
                            <AddClientDialog />
                        </div>
                    </div>

                    <TabsContent value="all" className="animate-in fade-in duration-500">
                        <ClientTable data={allClients} />
                    </TabsContent>

                    <TabsContent value="clients" className="animate-in fade-in duration-500">
                        <ClientTable data={activeClients} />
                    </TabsContent>

                    <TabsContent value="prospects" className="animate-in fade-in duration-500">
                        <ClientTable data={prospects} />
                    </TabsContent>

                    <TabsContent value="inactive" className="animate-in fade-in duration-500">
                        <ClientTable data={inactiveClients} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
