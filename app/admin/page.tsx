import { getAllUsers, updateUserStatus, updateUserSubscription, deleteUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    ShieldCheck,
    UserX,
    Calendar,
    CheckCircle,
    Trash2,
    Zap,
    Users,
    Activity,
    Crown
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MakhazineLogo } from "@/components/MakhazineLogo";

// Explicit type for User from Prisma include
type AdminUser = Awaited<ReturnType<typeof getAllUsers>>[number];

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const users: AdminUser[] = await getAllUsers();

    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-12">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <MakhazineLogo className="h-12 w-12" textClassName="hidden" />
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 underline decoration-orange-500 decoration-4 underline-offset-8">Console d'Excellence</h1>
                            <p className="text-slate-500 font-medium">Administration de la plateforme Makhazine ERP</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-2 font-bold hover:bg-white px-6">
                        <Link href="/dashboard">Bureau Gestionnaire</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white border-none shadow-xl rounded-[28px] overflow-hidden group hover:-translate-y-1 transition-transform">
                        <div className="h-2 bg-slate-900 w-full" />
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Utilisateurs</p>
                                <Users className="h-5 w-5 text-slate-300" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{users.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-xl rounded-[28px] overflow-hidden group hover:-translate-y-1 transition-transform">
                        <div className="h-2 bg-orange-600 w-full" />
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-orange-600 text-xs font-black uppercase tracking-[0.2em]">En Attente</p>
                                <Activity className="h-5 w-5 text-orange-200" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{users.filter((u: AdminUser) => u.status === "PENDING").length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-xl rounded-[28px] overflow-hidden group hover:-translate-y-1 transition-transform">
                        <div className="h-2 bg-emerald-500 w-full" />
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.2em]">Compte Actifs</p>
                                <CheckCircle className="h-5 w-5 text-emerald-200" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{users.filter((u: AdminUser) => u.status === "ACTIVE").length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-xl rounded-[28px] overflow-hidden group hover:-translate-y-1 transition-transform">
                        <div className="h-2 bg-indigo-600 w-full" />
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-indigo-600 text-xs font-black uppercase tracking-[0.2em]">Offres Payantes</p>
                                <Crown className="h-5 w-5 text-indigo-200" />
                            </div>
                            <p className="text-4xl font-black text-slate-900">{users.filter((u: AdminUser) => u.subscriptionType !== "DEMO").length}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="p-10 border-b border-slate-100">
                        <CardTitle className="text-2xl font-black">Registre des Partenaires</CardTitle>
                        <CardDescription className="font-medium">Makhazine vérifie l'identité de chaque entreprise pour garantir la sécurité du réseau.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-10 h-14">Identité Gérant</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Légalité Société</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Statut</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Licence</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14">Expiration</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-right pr-10">Gestion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: AdminUser) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50 transition-colors border-slate-50 group">
                                        <TableCell className="pl-10 py-6">
                                            <div className="font-black text-slate-900 text-base">{user.name}</div>
                                            <div className="text-xs font-bold text-slate-400 mb-2 lowercase">{user.email}</div>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-2 h-5 rounded-md font-bold uppercase text-[9px] tracking-tight">
                                                {user.company?.name || "Particulier"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[10px] font-bold space-y-1.5 text-slate-500">
                                                <div className="flex gap-2">
                                                    <span className="text-slate-300 w-8">ICE</span>
                                                    <span className="text-slate-900">{user.company?.ice || "—"}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-slate-300 w-8">RC</span>
                                                    <span className="text-slate-900">{user.company?.rc || "—"}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-slate-300 w-8">IF</span>
                                                    <span className="text-slate-900 font-black text-xs text-orange-600">{user.company?.if || "—"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.status === "ACTIVE" ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 font-black uppercase text-[9px] h-6 rounded-full">Actif</Badge>
                                            ) : user.status === "PENDING" ? (
                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-3 font-black uppercase text-[9px] h-6 rounded-full animate-pulse">En Validation</Badge>
                                            ) : (
                                                <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-300 border-none px-3 font-black uppercase text-[9px] h-6 rounded-full tracking-wider">Suspendu</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={user.subscriptionType === "GOLD" ? "border-amber-400 bg-amber-50 text-amber-700 font-black h-6 pr-3" : "border-slate-200 font-bold h-6 pr-3"}>
                                                {user.subscriptionType === "GOLD" && <Crown className="h-3 w-3 mr-1.5" />}
                                                {user.subscriptionType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-100/50 px-2 py-1.5 rounded-lg w-fit">
                                                <Calendar className="h-3 w-3 mr-2 text-slate-400" />
                                                {user.subscriptionExpiresAt
                                                    ? new Date(user.subscriptionExpiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : <span className="text-emerald-600 font-black uppercase text-[9px] tracking-widest">Permanent</span>
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-10 space-x-1">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <form action={updateUserStatus.bind(null, user.id, user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE")}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title={user.status === "ACTIVE" ? "Suspendre" : "Activer"}
                                                        className={user.status === "ACTIVE" ? "text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-9 w-9 p-0" : "text-emerald-600 hover:bg-emerald-50 rounded-lg h-9 w-9 p-0"}
                                                    >
                                                        {user.status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    </Button>
                                                </form>

                                                <form action={updateUserSubscription.bind(null, user.id, "DEMO", 1)}>
                                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg h-9 w-9 p-0" title="Passer en Démo (30j)">
                                                        <Zap className="h-4 w-4" />
                                                    </Button>
                                                </form>

                                                <form action={updateUserSubscription.bind(null, user.id, "GOLD", "unlimited")}>
                                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg h-9 w-9 p-0" title="Accès Gold Illimité">
                                                        <Crown className="h-4 w-4" />
                                                    </Button>
                                                </form>

                                                <form action={deleteUser.bind(null, user.id)}>
                                                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-red-700 hover:bg-red-50 rounded-lg h-9 w-9 p-0">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
