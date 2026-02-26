"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getCompany, updateCompany } from "@/actions/settings";
import { Loader2, Building2, Landmark, Save, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const form = useForm({
        defaultValues: {
            name: "",
            logo: "",
            ice: "",
            if: "",
            rc: "",
            address: "",
            email: "",
            phone: "",
            bankAccount: "",
            legal: "",
        }
    });

    useEffect(() => {
        getCompany().then(data => {
            if (data) {
                form.reset({
                    name: data.name || "",
                    logo: data.logo || "",
                    ice: data.ice || "",
                    if: data.if || "",
                    rc: data.rc || "",
                    address: data.address || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    bankAccount: data.bankAccount || "",
                    // @ts-ignore
                    legal: data.legal || "",
                });
            }
            setInitialLoading(false);
        }).catch(err => {
            console.error(err);
            setInitialLoading(false);
        });
    }, [form]);

    const onSubmit = async (values: any) => {
        setLoading(true);
        try {
            await updateCompany(values);
            alert("Profil société mis à jour avec succès !");
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">
                    Profil <span className="text-orange-600">Société</span>
                </h1>
                <p className="text-slate-500 font-medium">
                    Configurez vos données légales pour une facturation conforme aux normes marocaines.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-1/4 space-y-3">
                    <Button variant="ghost" type="button" className="w-full justify-start text-orange-600 bg-orange-50 rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest shadow-sm">
                        <Building2 className="mr-3 h-5 w-5" /> Entreprise
                    </Button>
                    <Button variant="ghost" type="button" className="w-full justify-start text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all">
                        <Landmark className="mr-3 h-5 w-5" /> Fiscalité & RIB
                    </Button>
                </aside>

                <div className="flex-1 space-y-8">
                    <Card className="shadow-2xl border-none rounded-[40px] bg-white overflow-hidden">
                        <div className="h-3 bg-slate-900 w-full" />
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Identité Légale</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                Ces informations apparaîtront sur vos factures et devis PDF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 p-10 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Raison Sociale</Label>
                                    <Input {...form.register("name")} placeholder="Ex: Ma Société SARL" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Logo URL (Optionnel)</Label>
                                    <Input {...form.register("logo")} placeholder="https://votre-site.com/logo.png" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">N° ICE</Label>
                                    <Input {...form.register("ice")} placeholder="00123456789000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Identifiant Fiscal (IF)</Label>
                                    <Input {...form.register("if")} placeholder="12345678" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Registre de Commerce (RC)</Label>
                                    <Input {...form.register("rc")} placeholder="99999" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Adresse Siège Social</Label>
                                    <Input {...form.register("address")} placeholder="Rue Ibn Khaldoun, Casablanca" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Email Facturation</Label>
                                    <Input {...form.register("email")} type="email" placeholder="contact@makhazine.ma" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Téléphone</Label>
                                    <Input {...form.register("phone")} placeholder="+212 600 000 000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Coordonnées Bancaires (RIB)</Label>
                                <Input {...form.register("bankAccount")} placeholder="007 000 0000000000000000 00" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                            </div>

                            <div className="py-2"><Separator className="bg-slate-100" /></div>

                            <div className="space-y-3">
                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Pied de page PDF (Mentions Légales)</Label>
                                <textarea
                                    {...form.register("legal")}
                                    className="w-full min-h-[140px] p-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                    placeholder="SARL au capital de ... DH • Patente n° ..."
                                ></textarea>
                            </div>
                        </CardContent>
                        <div className="p-10 pt-0 border-t border-slate-50 flex justify-end mt-4">
                            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/20 border-none text-white">
                                {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
                                Sauvegarder les modifications
                            </Button>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
