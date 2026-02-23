"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { MakhazineLogo } from "@/components/MakhazineLogo";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
            } else {
                const session = await getSession();
                if (session?.user?.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-6">
            <div className="w-full max-w-lg space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center">
                    <MakhazineLogo className="h-20 w-20 mb-4" textClassName="text-5xl font-black" />
                    <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-[0.2em] leading-none">Accès Gestionnaire</p>
                </div>

                <Card className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-none rounded-[40px] bg-white overflow-hidden">
                    <div className="h-3 bg-orange-600 w-full"></div>
                    <CardHeader className="pt-12 px-10 text-center">
                        <CardTitle className="text-3xl font-black tracking-tight">Content de vous revoir</CardTitle>
                        <CardDescription className="font-medium text-slate-400">
                            Entrez vos identifiants pour piloter votre activité
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 p-10 pt-4">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 font-bold">
                                    Identifiants incorrects ou compte non validé.
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-slate-700 ml-1 uppercase text-[10px] tracking-widest">Email Professionnel</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nom@societe.ma"
                                    className="h-14 rounded-2xl border-slate-200 focus-visible:ring-orange-500 bg-slate-50/50 focus:bg-white transition-all font-medium text-lg px-6"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Mot de passe</Label>
                                    <Link href="#" className="text-[10px] font-black text-orange-600 hover:underline uppercase tracking-widest">Oublié ?</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="h-14 rounded-2xl border-slate-200 focus-visible:ring-orange-500 bg-slate-50/50 focus:bg-white transition-all text-lg px-6"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-6 p-10 pt-0">
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 py-8 rounded-2xl text-xl font-black text-white shadow-2xl shadow-orange-600/30 border-none group" disabled={loading}>
                                {loading ? "Connexion..." : (
                                    <span className="flex items-center gap-2">Se Connecter</span>
                                )}
                            </Button>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-widest">Nouveau ici ?</span></div>
                            </div>
                            <Button asChild variant="outline" className="w-full py-8 rounded-2xl text-lg font-bold border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200">
                                <Link href="/register">Créer un compte Makhazine</Link>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Makhazine ERP v2.0 • Cloud Sécurisé</p>
            </div>
        </div>
    );
}
