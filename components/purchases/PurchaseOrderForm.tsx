"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseOrderSchema } from "@/lib/validations";
import { createPurchaseOrder } from "@/actions/purchases";
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
import { Plus, Trash2, Loader2, PackageSearch, Check, ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function PurchaseOrderForm({ suppliers, products }: { suppliers: any[], products: any[] }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultSupplierId = searchParams?.get("supplier") || "";

    const form = useForm({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            number: `BC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            supplierId: defaultSupplierId,
            date: new Date(),
            expectedDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            items: [{ productId: "", name: "", orderedQuantity: 1, unitPrice: 0, taxRate: 20, unitOfMeasure: "UNIT", conversionFactor: 1 }],
            notes: "",
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "items",
    });

    async function onSubmit(values: any) {
        setLoading(true);
        try {
            await createPurchaseOrder(values);
            router.push("/dashboard/purchases");
            router.refresh();
        } catch (error: any) {
            alert(error.message || "Erreur lors de la création du bon de commande");
        } finally {
            setLoading(false);
        }
    }

    const watchItems = form.watch("items") as any[];
    const subtotal = watchItems.reduce((acc: number, item: any) => {
        const p = Number(item.unitPrice) || 0;
        const q = Number(item.orderedQuantity) || 0;
        return acc + (p * q);
    }, 0);
    const taxTotal = watchItems.reduce((acc: number, item: any) => {
        const p = Number(item.unitPrice) || 0;
        const q = Number(item.orderedQuantity) || 0;
        const t = Number(item.taxRate) || 0;
        return acc + (p * q * t / 100);
    }, 0);
    const total = subtotal + taxTotal;

    const handleProductSelect = (index: number, product: any) => {
        update(index, {
            ...form.getValues(`items.${index}`),
            productId: product.id,
            name: product.name,
            unitPrice: product.costPrice || product.price, // Prefer costPrice for purchases if available
            taxRate: product.taxRate || 20,
        });
    };

    return (
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="h-2 bg-emerald-600 w-full" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Numéro du Bon</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-black text-emerald-600" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Sélectionner un Fournisseur</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold">
                                                    <SelectValue placeholder="Choisir un partenaire B2B" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-none shadow-2xl bg-white max-h-[300px]">
                                                {suppliers.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id} className="font-bold py-3">{c.name}</SelectItem>
                                                ))}
                                                {suppliers.length === 0 && <p className="p-4 text-center text-xs text-slate-400 font-bold uppercase">Aucun fournisseur trouvé</p>}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Date d'Émission</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expectedDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Reçu estimé le</FormLabel>
                                            <FormControl>
                                                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-2">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Détails des Articles</h3>
                            <Button type="button" onClick={() => append({ productId: "", name: "", orderedQuantity: 1, unitPrice: 0, taxRate: 20, unitOfMeasure: "UNIT", conversionFactor: 1 })} variant="ghost" size="sm" className="h-8 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50">
                                <Plus className="h-3 w-3 mr-1" /> Ajouter une ligne
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 px-2">
                                <div className="col-span-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Produit</div>
                                <div className="col-span-2 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Qté Commandée</div>
                                <div className="col-span-2 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Prix Unitaire</div>
                                <div className="col-span-1 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Unité</div>
                                <div className="col-span-1 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Conv</div>
                                <div className="col-span-1 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">TVA</div>
                                <div className="col-span-1"></div>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-3 items-start group relative">
                                    <div className="col-span-4 flex gap-2">
                                        <div className="flex-1">
                                            <Input placeholder="Produit..." {...form.register(`items.${index}.name` as const)} readOnly className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium text-xs text-slate-700" title="Cliquez sur l'icone pour choisir le produit" />
                                            {/* We need the hidden productId for submission */}
                                            <input type="hidden" {...form.register(`items.${index}.productId` as const)} />
                                        </div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100 bg-slate-50/50 text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                                                    <PackageSearch className="h-5 w-5" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[350px] p-0 rounded-2xl border-slate-100 shadow-2xl bg-white overflow-hidden" align="end">
                                                <Command className="rounded-2xl bg-white">
                                                    <CommandInput placeholder="Chercher un produit existant..." className="h-12 text-[10px] uppercase font-bold tracking-widest border-none" />
                                                    <CommandList className="max-h-[300px] bg-white">
                                                        <CommandEmpty className="py-6 text-center text-xs text-slate-400 font-bold uppercase bg-white">Aucun produit</CommandEmpty>
                                                        <CommandGroup className="p-2 bg-white">
                                                            {products.map((p) => (
                                                                <CommandItem
                                                                    key={p.id}
                                                                    onSelect={() => handleProductSelect(index, p)}
                                                                    className="rounded-xl py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-black text-slate-900 uppercase text-[10px] tracking-tight">{p.name}</span>
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{p.reference}</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-end">
                                                                            <span className="text-[10px] font-black text-emerald-600">
                                                                                {(p.costPrice || p.price)?.toLocaleString()} DH
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="col-span-2">
                                        <Input type="number" placeholder="Qté" {...form.register(`items.${index}.orderedQuantity` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black text-center text-xs px-1" />
                                    </div>
                                    <div className="col-span-2">
                                        <Input type="number" placeholder="Prix Unitaire" {...form.register(`items.${index}.unitPrice` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black text-right pr-2 text-xs" />
                                    </div>
                                    <div className="col-span-1">
                                        <Select value={form.watch(`items.${index}.unitOfMeasure`) || "UNIT"} onValueChange={(val) => form.setValue(`items.${index}.unitOfMeasure`, val)}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold px-1 text-[10px]">
                                                <SelectValue placeholder="Unité" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white border border-slate-200">
                                                <SelectItem value="UNIT">Unité</SelectItem>
                                                <SelectItem value="CARTON">Carton</SelectItem>
                                                <SelectItem value="PALLET">Palette</SelectItem>
                                                <SelectItem value="KG">Kg</SelectItem>
                                                <SelectItem value="TON">Tonne</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-1">
                                        <Input type="number" placeholder="Factor" {...form.register(`items.${index}.conversionFactor` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-right text-xs px-1 text-slate-500" title="Coefficient de conversion (ex: 12 unités par carton)" />
                                    </div>
                                    <div className="col-span-1">
                                        <Input type="number" placeholder="TVA" {...form.register(`items.${index}.taxRate` as const)} className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black text-right pr-2 text-xs" />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Button type="button" onClick={() => remove(index)} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50" disabled={fields.length === 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 justify-between bg-slate-900 text-white rounded-[24px] p-8 mt-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full -mr-32 -mt-32 opacity-20" />
                        <div className="space-y-4 max-w-sm relative z-10 w-full">
                            <FormLabel className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] ml-1">Notes / Instructions Fournisseur</FormLabel>
                            <textarea {...form.register("notes")} className="w-full bg-slate-800 rounded-xl border-none p-4 text-xs font-medium focus:ring-1 focus:ring-emerald-500 h-24 placeholder:text-slate-600" placeholder="Ex: Livraison après 14h, utiliser palettes consignées..."></textarea>
                        </div>

                        <div className="space-y-4 min-w-[240px] relative z-10">
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Sous-Total HT</span>
                                <span>{subtotal.toFixed(2)} DH</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>TVA Totale</span>
                                <span>{taxTotal.toFixed(2)} DH</span>
                            </div>
                            <div className="h-[1px] bg-slate-800 w-full" />
                            <div className="flex justify-between items-center py-2">
                                <span className="font-black text-emerald-500 uppercase text-xs tracking-[0.2em]">Montant TTC</span>
                                <span className="text-3xl font-black">{total.toFixed(2)} DH</span>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black border-none text-base shadow-xl shadow-emerald-500/20" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Valider la Commande <Check className="h-5 w-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
