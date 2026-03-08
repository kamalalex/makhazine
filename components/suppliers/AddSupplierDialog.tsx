"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema } from "@/lib/validations";
import { createSupplier } from "@/actions/suppliers";
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
import { Truck, Loader2 } from "lucide-react";

export function AddSupplierDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "",
            contactName: "",
            email: "",
            phone: "",
            address: "",
            ice: "",
        },
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await createSupplier(values);
            setOpen(false);
            form.reset();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la création du fournisseur");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 text-white rounded-xl px-6 font-black border-none h-12 transition-all">
                    <Truck className="mr-2 h-5 w-5" />
                    Nouveau Fournisseur
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <div className="h-2 bg-emerald-600 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl">
                            <Truck className="h-6 w-6 text-emerald-600" />
                        </div>
                        Profil Fournisseur
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <div className="px-8 flex-1 overflow-y-auto space-y-6 min-h-0 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Raison Sociale / Nom*</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nom du fournisseur..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contactName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Nom du Contact</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: M. Rachid" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">ICE</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optionnel..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Téléphone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: 06..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="test@test.com" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
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
                                        <FormLabel className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Adresse complète</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Quartier industriel..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="p-8 pt-4 flex gap-3 bg-white border-t border-slate-50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2">
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest border-none md:col-span-1 shadow-xl shadow-emerald-500/20" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Créer le Fournisseur"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
