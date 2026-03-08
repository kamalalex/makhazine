"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema } from "@/lib/validations";
import { updateSupplier, deleteSupplier } from "@/actions/suppliers";
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
import { Truck, Loader2, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function EditSupplierDialog({ supplier }: { supplier: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: supplier.name || "",
            contactName: supplier.contactName || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            ice: supplier.ice || "",
        },
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await updateSupplier(supplier.id, values);
            setOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la modification du fournisseur");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ? Cette action est irréversible, et est impossible si des bons de commande existent ou ont existé avec ce fournisseur.")) return;

        setIsDeleting(true);
        try {
            const res = await deleteSupplier(supplier.id);
            if (res?.error) {
                alert(res.error);
            } else {
                setOpen(false);
                router.push("/dashboard/suppliers");
            }
        } catch (error: any) {
            alert(error.message || "Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="shadow-sm rounded-xl px-6 border-slate-200 font-bold hover:bg-slate-50 text-slate-700 h-10 transition-all">
                    <Edit className="mr-2 h-4 w-4" />
                    Éditer ou Supprimer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <div className="h-2 bg-emerald-600 w-full shrink-0" />
                <DialogHeader className="p-8 pb-4 shrink-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl">
                            <Truck className="h-6 w-6 text-emerald-600" />
                        </div>
                        Modifier Fournisseur
                    </DialogTitle>
                    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </Button>
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
                            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest border-none lg:col-span-1 shadow-xl shadow-emerald-500/20" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer les modifications"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
