"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validations";
import { z } from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle, Package, Loader2, Save, Building2 } from "lucide-react";
import { createProduct } from "@/actions/stock";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddProductDialogProps {
    warehouses: any[];
}

export function AddProductDialog({ warehouses }: AddProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("default");
    const router = useRouter();

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            reference: "",
            name: "",
            brand: "",
            description: "",
            price: 0,
            stock: 0,
            lowStockAlert: 5,
            category: "",
        },
    });

    async function onSubmit(values: z.infer<typeof productSchema>) {
        setLoading(true);
        try {
            await createProduct(values, selectedWarehouse);
            setOpen(false);
            form.reset();
            setSelectedWarehouse("default");
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
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl px-6 h-12 shadow-xl shadow-orange-600/20 border-none transition-all hover:scale-105">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Ajouter un Produit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0 bg-white scrollbar-hide">
                <div className="h-2 bg-orange-600 w-full sticky top-0 z-50" />
                <DialogHeader className="p-8 pb-4">
                    <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Nouvel Article en Stock</DialogTitle>
                    <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mt-1">
                        Renseignez les détails techniques et logistiques.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8 pt-0">
                        <div className="grid grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Référence SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: PRD-001" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300 pointer-events-auto" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Marque / Fabricant</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Samsung, Apple..." {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Désignation du Produit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Smartphone Galaxy S21" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Catégorie</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Électronique" {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all placeholder:text-slate-300" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-3">
                                <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Affecter à un Dépôt</FormLabel>
                                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold transition-all">
                                        <SelectValue placeholder="Choisir un dépôt" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        <SelectItem value="default" className="font-bold text-xs">Inventaire Global (Par défaut)</SelectItem>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={w.id} className="font-bold text-xs py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3 w-3 text-orange-500" />
                                                    <span>{w.name} ({w.city})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-2">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Prix Achat (DH)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-black text-right transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Stock Initial</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-center transition-all underline decoration-orange-500/30 decoration-2 underline-offset-4" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lowStockAlert"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Seuil d'Alerte</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ""} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-center transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2 mt-4 border-t border-slate-50 pt-6">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-14 rounded-2xl font-bold border-2">
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black border-none shadow-xl shadow-orange-600/20 transition-all hover:scale-[1.02]" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Enregistrer l'article <Save className="h-5 w-5" />
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
