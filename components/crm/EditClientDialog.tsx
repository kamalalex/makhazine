"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "@/lib/validations";
import { updateClient } from "@/actions/crm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EditClientDialog({ client }: { client: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            type: client.type || "B2C",
            name: client.name || "",
            ice: client.ice || "",
            if: client.if || "",
            rc: client.rc || "",
            contactName: client.contactName || "",
            contactPosition: client.contactPosition || "",
            email: client.email || "",
            phone: client.phone || "",
            billingAddress: client.billingAddress || "",
            shippingAddress: client.shippingAddress || "",
            paymentTerms: client.paymentTerms || 0,
            paymentMethod: client.paymentMethod || "CASH",
            defaultDiscount: client.defaultDiscount || 0,
            category: client.category || "",
            tags: client.tags || [],
            creditLimit: client.creditLimit || 0,
            isProspect: client.isProspect ?? true,
        },
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await updateClient(client.id, values);
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all bg-white border border-slate-200">
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Modifier
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <div className="h-2 bg-orange-600 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl">
                            <Pencil className="h-6 w-6 text-orange-600" />
                        </div>
                        Modifier la Fiche : {client.name}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <div className="px-8 flex-1 overflow-y-auto min-h-0 py-2">
                            <Tabs defaultValue="identity" className="w-full">
                                <TabsList className="grid grid-cols-4 w-full bg-slate-50 p-1 rounded-2xl h-12 mb-6">
                                    <TabsTrigger value="identity" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Identité</TabsTrigger>
                                    <TabsTrigger value="contact" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Contact</TabsTrigger>
                                    <TabsTrigger value="logistics" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Logistique</TabsTrigger>
                                    <TabsTrigger value="commercial" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Commerce</TabsTrigger>
                                </TabsList>

                                <TabsContent value="identity" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                                                                <SelectValue placeholder="Type de client" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl bg-white border border-slate-200 shadow-2xl z-50">
                                                            <SelectItem value="B2C">Particulier (B2C)</SelectItem>
                                                            <SelectItem value="B2B">Entreprise (B2B)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Nom / Raison Sociale</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nom du client..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="ice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">ICE</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Identifiant Commun..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="if"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">IF</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Identifiant Fiscal..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="rc"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">RC</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Reg. Commerce..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="isProspect"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/30">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-black text-slate-800 uppercase tracking-tight">C'est un Prospect ?</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-5 w-5 rounded-lg border-slate-200 text-orange-600 focus:ring-orange-500"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="contact" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contactName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Contact Principal</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nom du responsable..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contactPosition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Fonction</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Gérant, Acheteur..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@exemple.com" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Téléphone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="06..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="logistics" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="billingAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Adresse de Facturation</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Adresse complète..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="commercial" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Mode de Règlement</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                                                                <SelectValue placeholder="Mode de paiement" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl bg-white border border-slate-200 shadow-2xl z-50">
                                                            <SelectItem value="CASH">Espèces</SelectItem>
                                                            <SelectItem value="CHEQUE">Chèque</SelectItem>
                                                            <SelectItem value="LCN">LCN</SelectItem>
                                                            <SelectItem value="VIREMENT">Virement</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="paymentTerms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Délai (jours)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            value={field.value as number}
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="creditLimit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Plafond de Crédit (DH)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            value={field.value as number}
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="defaultDiscount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Remise (%)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            value={field.value as number}
                                                            onChange={e => field.onChange(Number(e.target.value))}
                                                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="p-8 pt-4 flex gap-3 bg-white border-t border-slate-50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-xl shadow-slate-900/10" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
