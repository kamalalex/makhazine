"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "@/lib/validations";
import { createClient } from "@/actions/crm";
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
import { UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddClientDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            isProspect: true,
        },
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await createClient(values);
            setOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 text-white rounded-xl px-6 font-black border-none h-12">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Ajouter un Partenaire
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <div className="h-2 bg-orange-600 w-full" />
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Contact</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8 pt-0">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1">Nom Complet / Raison Sociale</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Client ou Entreprise..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="contact@..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1">Téléphone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="06..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest ml-1">Adresse</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Casablanca, Maroc..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isProspect"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-100 p-4 bg-slate-50/30">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-black text-slate-800 tracking-tight">C'est un Prospect ?</FormLabel>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compte non validé commercialement</p>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="h-5 w-5 rounded border-slate-200 text-orange-600 focus:ring-orange-500"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12 rounded-xl font-bold border-2">
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black border-none" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
