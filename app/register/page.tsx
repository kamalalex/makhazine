"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, ChevronLeft, Upload } from "lucide-react";
import Link from "next/link";
import { registerUser } from "@/actions/register";
import { MakhazineLogo } from "@/components/MakhazineLogo";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        companyName: "",
        ice: "",
        rc: "",
        if: "",
        cn: "",
        phone: "",
        address: "",
        bankAccount: "",
        cinNumber: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            nextStep();
            return;
        }

        setLoading(true);
        setError("");

        try {
            await registerUser(formData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md shadow-2xl text-center p-8 space-y-6 border-none rounded-[32px]">
                    <div className="mx-auto bg-emerald-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl font-black">Inscription Réussie !</CardTitle>
                        <CardDescription className="text-base mt-2 font-medium">
                            Un email de vérification a été envoyé à <strong>{formData.email}</strong>.<br /><br />
                            Votre dossier est maintenant en attente de validation par l'administration de Makhazine.
                        </CardDescription>
                    </CardHeader>
                    <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 py-6 font-bold rounded-xl text-white">
                        <Link href="/login">Accéder à la connexion</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-2xl space-y-8">
                <div className="flex flex-col items-center">
                    <MakhazineLogo className="h-16 w-16 mb-2" textClassName="text-4xl font-black" />
                    <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-widest">Ouverture de compte — Étape {step}/3</p>
                </div>

                <Card className="shadow-2xl border-none overflow-hidden bg-white rounded-[32px]">
                    <div className="h-2 bg-slate-100 w-full">
                        <div
                            className="h-full bg-orange-600 transition-all duration-700"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <CardHeader className="pt-10 px-10">
                        <CardTitle className="text-2xl font-black">
                            {step === 1 && "Informations de Gérance"}
                            {step === 2 && "Détails de la Société"}
                            {step === 3 && "Documents & Banque"}
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-400">
                            {step === 1 && "Identifiants pour accéder à votre futur tableau de bord."}
                            {step === 2 && "Informations légales obligatoires pour vos futures factures."}
                            {step === 3 && "Éléments requis pour la validation finale de votre compte."}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 p-10 pt-4">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 font-bold">
                                    {error}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-bold text-slate-700">Nom complet du gérant</Label>
                                        <Input id="name" placeholder="Ex: Ahmed Benani" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-bold text-slate-700">Email professionnel</Label>
                                        <Input id="email" type="email" placeholder="ahmed@societe.ma" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="font-bold text-slate-700">Mot de passe de sécurité</Label>
                                        <Input id="password" type="password" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.password} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="font-bold text-slate-700">Numéro de téléphone marocain</Label>
                                        <Input id="phone" placeholder="06XXXXXXXX" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="companyName" className="font-bold text-slate-700">Nom Officiel de la Société</Label>
                                        <Input id="companyName" placeholder="S.A.R.L / Auto-entrepreneur" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.companyName} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ice" className="font-bold text-slate-700">ICE (15 chiffres)</Label>
                                        <Input id="ice" placeholder="15 chiffres" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.ice} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rc" className="font-bold text-slate-700">N° de Registre de Commerce</Label>
                                        <Input id="rc" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.rc} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="if" className="font-bold text-slate-700">Identifiant Fiscal (IF)</Label>
                                        <Input id="if" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.if} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cn" className="font-bold text-slate-700">N° Patente / TP</Label>
                                        <Input id="cn" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.cn} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address" className="font-bold text-slate-700">Adresse du Siège Social</Label>
                                        <Input id="address" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.address} onChange={handleChange} required />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <Label htmlFor="cinNumber" className="font-bold text-slate-700">Numéro de Carte Nationale (CIN)</Label>
                                        <Input id="cinNumber" placeholder="Ex: AB123456" className="h-12 rounded-xl focus-visible:ring-orange-500" value={formData.cinNumber} onChange={handleChange} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700">CIN (Recto)</Label>
                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer hover:bg-orange-50/50 hover:border-orange-200 transition-all group">
                                                <Upload className="h-8 w-8 mb-2 group-hover:text-orange-500 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600">Charger</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700">CIN (Verso)</Label>
                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer hover:bg-orange-50/50 hover:border-orange-200 transition-all group">
                                                <Upload className="h-8 w-8 mb-2 group-hover:text-orange-500 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600">Charger</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bankAccount" className="font-bold text-slate-700">Coordonnées Bancaires (RIB)</Label>
                                        <Input id="bankAccount" placeholder="24 chiffres" className="h-12 rounded-xl focus-visible:ring-orange-500 font-mono" value={formData.bankAccount} onChange={handleChange} required />
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter pt-1">Ce RIB figurera sur vos factures pour vos paiements clients.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-between bg-slate-50/50 p-10 border-t border-slate-100">
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={prevStep} className="rounded-xl px-8 py-6 font-bold border-2 hover:bg-white transition-colors">
                                    <ChevronLeft className="mr-2 h-5 w-5" /> Précédent
                                </Button>
                            ) : (
                                <div />
                            )}

                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 rounded-xl px-12 py-6 font-bold text-white shadow-xl shadow-orange-600/20 text-lg border-none" disabled={loading}>
                                {loading ? "Traitement..." : step === 3 ? "Envoyer le dossier" : (
                                    <>Continuer <ChevronRight className="ml-2 h-5 w-5" /></>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {step === 1 && (
                    <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Déjà inscrit ? <Link href="/login" className="text-orange-600 hover:underline">Se connecter</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
