"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
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
import { Building2, Loader2, Save, PlusCircle, MapPin, User, Mail, Tags, Phone } from "lucide-react";
import { createWarehouse } from "@/actions/warehouse";
import { useRouter } from "next/navigation";

export function AddWarehouseDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            name: "",
            address: "",
            city: "",
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            allowedCategories: "",
        },
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            const categories = values.allowedCategories
                ? values.allowedCategories.split(',').map((c: string) => c.trim())
                : [];

            await createWarehouse({
                ...values,
                allowedCategories: categories
            });
            setOpen(false);
            form.reset();
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl px-6 h-12 shadow-xl shadow-orange-600/20 border-none transition-all hover:scale-105">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Ajouter un Dépôt
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0 bg-white scrollbar-hide">
                <div className="h-2 bg-orange-600 w-full sticky top-0 z-50" />
                <DialogHeader className="p-8 pb-4">
                    <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Site de Stockage</DialogTitle>
                    <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mt-1">
                        Configurez un déport pour vos inventaires.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8 pt-0">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Nom du Dépôt</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Ex: Dépôt Central" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold pl-10 placeholder:text-slate-300" />
                                            <Building2 className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Adresse</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="Ex: Rue 123, Zone Industrielle" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold pl-10 placeholder:text-slate-300" />
                                                <MapPin className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Ville</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Tanger" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold px-4 placeholder:text-slate-300" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4 border-t border-slate-50 pt-6">
                            <FormField
                                control={form.control}
                                name="contactName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Responsable du Site</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="Nom du responsable" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold pl-10 text-xs placeholder:text-slate-300" />
                                                <User className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input type="email" placeholder="email@depot.com" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold pl-10 text-xs placeholder:text-slate-300" />
                                                    <Mail className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Téléphone</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input placeholder="06 12 34 56 78" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold pl-10 text-xs placeholder:text-slate-300" />
                                                    <Phone className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="allowedCategories"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Catégories autorisées (Optionnel)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Ex: Électronique, Alimentaire" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold pl-10 text-xs placeholder:text-slate-300" />
                                            <Tags className="h-4 w-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2 border-t border-slate-50 mt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-14 rounded-2xl font-bold border-2">
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black border-none shadow-xl shadow-orange-600/20 transition-all hover:scale-[1.02]" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Créer le Dépôt <Save className="h-5 w-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
