import { getClients } from "@/actions/crm";
import { Users, Phone, Mail, MapPin, Calendar, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddClientDialog } from "@/components/crm/AddClientDialog";

export default async function CRMPage() {
    const clients = await getClients();
    const prospects = clients.filter(c => c.isProspect);
    const actualClients = clients.filter(c => !c.isProspect);

    const ClientCard = ({ client }: { client: any }) => (
        <Card className="hover:shadow-2xl transition-all group border-none bg-white rounded-[28px] overflow-hidden shadow-xl shadow-slate-200/50 relative">
            <div className={`absolute top-0 right-0 w-2 h-full ${client.isProspect ? "bg-amber-400" : "bg-emerald-500"}`} />
            <CardHeader className="pb-2 pt-8 px-8">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-orange-50 transition-colors shadow-sm">
                        <Users className="h-6 w-6 text-slate-400 group-hover:text-orange-600" />
                    </div>
                    {client.isProspect ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full">Prospect</Badge>
                    ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 h-6 font-black uppercase text-[9px] rounded-full tracking-wider">Client Actif</Badge>
                    )}
                </div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors uppercase">{client.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-6 px-8 relative z-10">
                <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <Mail className="h-4 w-4 mr-3 text-slate-300" />
                    {client.email || "—"}
                </div>
                <div className="flex items-center text-xs font-bold text-slate-600">
                    <Phone className="h-4 w-4 mr-3 text-orange-400" />
                    {client.phone || "—"}
                </div>
                <div className="flex items-start text-xs font-bold text-slate-400 leading-relaxed">
                    <MapPin className="h-4 w-4 mr-3 mt-0.5 text-slate-300" />
                    <span className="line-clamp-2 uppercase tracking-tighter">{client.address || "Casablanca, Maroc"}</span>
                </div>
            </CardContent>
            <CardFooter className="bg-slate-50/80 border-t border-slate-100 py-4 px-8 flex justify-between items-center group-hover:bg-white transition-colors">
                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="h-3 w-3 mr-2" />
                    CRÉÉ LE {new Date(client.createdAt).toLocaleDateString()}
                </div>
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">Dossier</Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-3 underline decoration-orange-500 decoration-4 underline-offset-8">Réseau Partenaires</h1>
                    <p className="text-slate-500 font-medium">
                        Pilotez votre portefeuille clients et convertissez vos prospects en revenus.
                    </p>
                </div>
                <AddClientDialog />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 gap-4">
                    <TabsList className="bg-transparent border-none h-14 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <TabsTrigger value="all" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white h-full">Tout ({clients.length})</TabsTrigger>
                        <TabsTrigger value="clients" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white h-full">Gagnés ({actualClients.length})</TabsTrigger>
                        <TabsTrigger value="prospects" className="px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white h-full">Pistes ({prospects.length})</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 pr-4 pl-4 md:pl-0">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-orange-600"><LayoutGrid className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300"><List className="h-5 w-5" /></Button>
                    </div>
                </div>

                <TabsContent value="all" className="mt-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {clients.slice(0, 9).map(c => <ClientCard key={c.id} client={c} />)}
                        {clients.length === 0 && (
                            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Users className="h-16 w-16 text-slate-200 mx-auto mb-6 relative z-10" />
                                <p className="text-xl font-black text-slate-400 uppercase tracking-widest relative z-10">Clientèle en expansion</p>
                                <p className="text-slate-400 font-medium mt-2 relative z-10">Lancez votre activité en ajoutant votre premier partenaire.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="clients" className="mt-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {actualClients.map(c => <ClientCard key={c.id} client={c} />)}
                    </div>
                </TabsContent>

                <TabsContent value="prospects" className="mt-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {prospects.map(c => <ClientCard key={c.id} client={c} />)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
