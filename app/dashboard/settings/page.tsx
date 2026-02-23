"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Save, CreditCard, Bell, Shield, Landmark } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-3 underline decoration-orange-500 decoration-4 underline-offset-8">Configuration Système</h1>
                <p className="text-slate-500 font-medium">
                    Centralisez la gestion de votre structure et les préférences de votre plateforme.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-1/4 space-y-3">
                    <Button variant="ghost" className="w-full justify-start text-orange-600 bg-orange-50 rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest shadow-sm">
                        <Building2 className="mr-3 h-5 w-5" /> Entreprise
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all">
                        <Landmark className="mr-3 h-5 w-5" /> Fiscalité & RIB
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all">
                        <Bell className="mr-3 h-5 w-5" /> Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all">
                        <Shield className="mr-3 h-5 w-5" /> Sécurité
                    </Button>
                </aside>

                <div className="flex-1 space-y-8">
                    <Card className="shadow-2xl border-none rounded-[40px] bg-white overflow-hidden">
                        <div className="h-3 bg-slate-900 w-full" />
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Identité de l'Entreprise</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                Informations légales pour vos documents PDF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 p-10 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="company-name" className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Raison Sociale</Label>
                                    <Input id="company-name" placeholder="Ex: Ma Société SARL" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" defaultValue="Makhazine Solutions" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="tax-id" className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">N° ICE</Label>
                                    <Input id="tax-id" placeholder="00123456789000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" defaultValue="001234567890" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="address" className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Adresse Professionnelle</Label>
                                <Input id="address" placeholder="Rue Ibn Khaldoun, Casablanca" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" defaultValue="123 Rue du Commerce, Casablanca" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Email de Facturation</Label>
                                    <Input id="email" type="email" placeholder="facturation@makhazine.ma" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" defaultValue="contact@makhazine.ma" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Standard Téléphonique</Label>
                                    <Input id="phone" placeholder="+212 5..." className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" defaultValue="+212 600 000 000" />
                                </div>
                            </div>

                            <div className="py-2"><Separator className="bg-slate-100" /></div>

                            <div className="space-y-3">
                                <Label htmlFor="legal" className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Mentions Légales (Pied de page PDF)</Label>
                                <textarea
                                    id="legal"
                                    className="w-full min-h-[140px] p-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                    placeholder="RIB: 007 000 0000000000000000 00 • RC: 12345 • IF: 67890..."
                                ></textarea>
                            </div>
                        </CardContent>
                        <div className="p-10 pt-0 border-t border-slate-50 flex justify-end mt-4">
                            <Button className="bg-orange-600 hover:bg-orange-700 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/20 border-none text-white">
                                <Save className="mr-3 h-5 w-5" />
                                Sauvegarder
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 rounded-[32px] overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600 rounded-full -mr-24 -mt-24 opacity-20" />
                        <CardHeader className="p-10 relative z-10">
                            <CardTitle className="text-white text-xl font-black">Certifications & Sécurité</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">
                                État des services et protections de données.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="bg-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-900/50">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white uppercase text-xs tracking-widest">Protection SSL Active</p>
                                        <p className="text-sm text-slate-400 font-medium">Vos données sont cryptées en AES-256.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="border-slate-800 text-white hover:bg-slate-800 rounded-xl h-12 font-black uppercase text-[10px] tracking-widest">
                                    Vérifier
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
