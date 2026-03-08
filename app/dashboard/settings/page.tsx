"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { getCompany, updateCompany, addBankAccount, updateBankAccount, deleteBankAccount, setMainBankAccount, updateRolePermissions } from "@/actions/settings";
import { getUserProfile, updateUserProfile, createSubUser, getSubUsers, archiveSubUser } from "@/actions/users";
import { uploadFile } from "@/actions/upload";
import { Loader2, Building2, Landmark, Save, Shield, UserCircle, Users, PlusCircle, Trash2, CheckCircle, Upload, FileImageIcon, ShieldCheck, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input as BaseInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Composant Input enveloppé pour appliquer le placeholder gris semi-transparent par défaut
const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { register?: any }) => {
    const { register, ...rest } = props;
    return (
        <BaseInput {...register} {...rest} className={`${props.className || ''} placeholder:text-slate-400/60 font-medium`} />
    );
};

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [subUserLoading, setSubUserLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"profil" | "societe" | "banque" | "permissions">("profil");
    const [userRole, setUserRole] = useState<string>("USER");
    const [subUsersList, setSubUsersList] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [isAddingBank, setIsAddingBank] = useState(false);
    const [rolePermissions, setRolePermissions] = useState<any>({
        COMMERCIAL: ["CRM", "INVOICES"],
        MAGASINIER: ["STOCK"],
    });

    const profileForm = useForm({
        defaultValues: { name: "", email: "", phone: "", image: "", password: "", }
    });

    const companyForm = useForm({
        defaultValues: { name: "", logo: "", ice: "", if: "", rc: "", address: "", email: "", phone: "", pdfFooter: "", }
    });

    const bankForm = useForm({
        defaultValues: { bankName: "", bankAddress: "", rib: "", swift: "", contactName: "", contactPhone: "", }
    });

    const subUserForm = useForm({
        defaultValues: { name: "", email: "", password: "", role: "COMMERCIAL", }
    });

    const loadData = async () => {
        try {
            const user = await getUserProfile();
            if (user) {
                profileForm.reset({
                    name: user.name || "",
                    email: user.email || "",
                    // @ts-ignore
                    phone: user.phone || "",
                    image: user.image || "",
                    password: "",
                });
                setUserRole(user.role);

                if (user.role === "ADMIN" || user.role === "USER") {
                    const subs = await getSubUsers();
                    setSubUsersList(subs || []);
                }
            }

            const company = await getCompany();
            if (company) {
                companyForm.reset({
                    name: company.name || "",
                    logo: company.logo || "",
                    ice: company.ice || "",
                    if: company.if || "",
                    rc: company.rc || "",
                    address: company.address || "",
                    email: company.email || "",
                    phone: company.phone || "",
                    // @ts-ignore
                    pdfFooter: company.pdfFooter || "",
                });
                // @ts-ignore
                if (company.rolePermissions) {
                    // @ts-ignore
                    setRolePermissions(company.rolePermissions);
                }
                // @ts-ignore
                if (company.bankAccounts) {
                    // @ts-ignore
                    setBankAccounts(company.bankAccounts);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, formSetter: (url: string) => void) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setLoading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await uploadFile(formData);
            if (res.error) {
                alert(res.error);
            } else if (res.success && res.url) {
                formSetter(res.url);
            }
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi de l'image.");
        } finally {
            setLoading(false);
            // Reset input file value
            e.target.value = "";
        }
    };

    const onProfileSubmit = async (values: any) => {
        setLoading(true);
        try {
            const dataToUpdate = { ...values };
            if (!dataToUpdate.password) {
                delete dataToUpdate.password;
            }
            await updateUserProfile(dataToUpdate);
            alert("Profil mis à jour avec succès !");
            profileForm.setValue("password", "");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour du profil.");
        } finally {
            setLoading(false);
        }
    };

    const onCompanySubmit = async (values: any) => {
        if (userRole === "COMMERCIAL" || userRole === "MAGASINIER") {
            alert("Vous n'avez pas l'autorisation de modifier les données de la société.");
            return;
        }
        setLoading(true);
        try {
            await updateCompany(values);
            alert("Données de la société mises à jour !");
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour de la société.");
        } finally {
            setLoading(false);
        }
    };

    const onBankSubmit = async (values: any) => {
        if (userRole === "COMMERCIAL" || userRole === "MAGASINIER") {
            alert("Vous n'avez pas l'autorisation de modifier les données bancaires.");
            return;
        }
        setLoading(true);
        try {
            await addBankAccount(values);
            alert("Nouveau compte bancaire ajouté avec succès !");
            bankForm.reset();
            setIsAddingBank(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout du compte bancaire.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetMainBank = async (id: string) => {
        setLoading(true);
        try {
            await setMainBankAccount(id);
            loadData();
        } catch (err) {
            alert("Erreur de sélection.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBank = async (id: string) => {
        if (!confirm("Supprimer ce compte bancaire ?")) return;
        setLoading(true);
        try {
            await deleteBankAccount(id);
            loadData();
        } catch (err) {
            alert("Erreur de suppression.");
        } finally {
            setLoading(false);
        }
    };

    const onSubUserSubmit = async (values: any) => {
        setSubUserLoading(true);
        try {
            await createSubUser(values);
            alert("Utilisateur créé avec succès !");
            subUserForm.reset();
            loadData();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erreur lors de la création de l'utilisateur.");
        } finally {
            setSubUserLoading(false);
        }
    };

    const handleDeleteSubUser = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Son profil sera archivé en base de données.")) return;
        setLoading(true);
        try {
            await archiveSubUser(id);
            alert("Utilisateur archivé avec succès !");
            loadData();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression.");
        } finally {
            setLoading(false);
        }
    };

    const handleRolePermissionToggle = async (role: string, module: string) => {
        const current = rolePermissions[role] || [];
        const updated = current.includes(module)
            ? current.filter((m: string) => m !== module)
            : [...current, module];

        const newPermissions = { ...rolePermissions, [role]: updated };
        setRolePermissions(newPermissions);

        try {
            await updateRolePermissions(newPermissions);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour des permissions.");
        }
    };

    if (initialLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    const isAdmin = userRole === "ADMIN" || userRole === "USER";

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">
                    Paramètres <span className="text-orange-600">Généraux</span>
                </h1>
                <p className="text-slate-500 font-medium pb-2">
                    Gérez votre profil, les informations de votre entreprise et vos données bancaires.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-1/4 space-y-3">
                    <Button
                        onClick={() => setActiveTab("profil")}
                        variant="ghost"
                        type="button"
                        className={`w-full justify-start rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'profil' ? 'text-blue-600 bg-blue-50 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <UserCircle className="mr-3 h-5 w-5" /> Mon Profil
                    </Button>
                    <Button
                        onClick={() => setActiveTab("societe")}
                        variant="ghost"
                        type="button"
                        className={`w-full justify-start rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'societe' ? 'text-orange-600 bg-orange-50 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <Building2 className="mr-3 h-5 w-5" /> Données Société
                    </Button>
                    <Button
                        onClick={() => setActiveTab("banque")}
                        variant="ghost"
                        type="button"
                        className={`w-full justify-start rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'banque' ? 'text-emerald-600 bg-emerald-50 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <Landmark className="mr-3 h-5 w-5" /> Banque
                    </Button>
                    <Button
                        onClick={() => setActiveTab("permissions")}
                        variant="ghost"
                        type="button"
                        className={`w-full justify-start rounded-2xl p-6 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'permissions' ? 'text-purple-600 bg-purple-50 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <ShieldCheck className="mr-3 h-5 w-5" /> Rôles & Accès
                    </Button>
                </aside>

                <div className="flex-1 space-y-8">
                    {/* ONGLET PROFIL */}
                    {activeTab === "profil" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                                <Card className="shadow-2xl border-none rounded-[40px] bg-white overflow-hidden">
                                    <div className="h-3 bg-blue-600 w-full" />
                                    <CardHeader className="p-10 pb-4">
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Informations Personnelles</CardTitle>
                                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                            Mettez à jour les données de votre compte.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-10 pt-4">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* Photo upload section */}
                                            <div className="md:w-1/3 flex flex-col items-center justify-center space-y-4">
                                                <div className="relative group rounded-[30px] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 w-40 h-40 flex items-center justify-center transition-all hover:border-blue-300">
                                                    {profileForm.watch("image") ? (
                                                        <img src={profileForm.watch("image")} alt="Profil" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle className="w-16 h-16 text-slate-300" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <label className="cursor-pointer flex flex-col items-center text-white">
                                                            <Upload className="w-6 h-6 mb-1" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Modifier</span>
                                                            <input type="file" accept="image/*" className="hidden" disabled={loading} onChange={(e) => handleFileUpload(e, (url) => profileForm.setValue("image", url))} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Photo de Profil</p>
                                            </div>

                                            <div className="flex-1 space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Nom Complet</Label>
                                                        <Input register={profileForm.register("name")} placeholder="Ex: Jean Dupont" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Email</Label>
                                                        <Input register={profileForm.register("email")} type="email" placeholder="Ex: contact@email.com" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Téléphone</Label>
                                                        <Input register={profileForm.register("phone")} placeholder="Ex: +212 600 000 000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Changer Mot de Passe</Label>
                                                        <Input register={profileForm.register("password")} type="password" placeholder="Le laisser vide pour ignorer" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-10 pt-0 border-t border-slate-50 flex justify-end mt-4">
                                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 border-none text-white transition-all">
                                            {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
                                            Sauvegarder mon profil
                                        </Button>
                                    </div>
                                </Card>
                            </form>

                            {/* Section Administrateur : Création d'utilisateurs */}
                            {isAdmin && (
                                <div className="space-y-8 mt-12">
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3 ml-2">
                                        <Users className="text-purple-600" /> Gestion <span className="text-purple-600">des Équipes</span>
                                    </h2>

                                    <form onSubmit={subUserForm.handleSubmit(onSubUserSubmit)}>
                                        <Card className="shadow-2xl border-none rounded-[40px] bg-gradient-to-br from-purple-50 to-white overflow-hidden border border-purple-100">
                                            <CardHeader className="p-10 pb-4">
                                                <CardTitle className="text-xl font-black text-purple-900 tracking-tight">Ajouter un Collaborateur</CardTitle>
                                                <CardDescription className="text-purple-600/60 font-bold uppercase text-[10px] tracking-widest mt-1">
                                                    Donnez accès à vos collègues selon leur rôle.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6 p-10 pt-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-purple-900/70 uppercase text-[9px] tracking-[0.2em] ml-1">Nom</Label>
                                                        <Input register={subUserForm.register("name", { required: true })} placeholder="Ex: Ali" className="h-12 rounded-xl border-purple-200/50 bg-white/60 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-purple-900/70 uppercase text-[9px] tracking-[0.2em] ml-1">Email</Label>
                                                        <Input register={subUserForm.register("email", { required: true })} type="email" placeholder="Ex: ali@email.com" className="h-12 rounded-xl border-purple-200/50 bg-white/60 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-purple-900/70 uppercase text-[9px] tracking-[0.2em] ml-1">Mot De Passe</Label>
                                                        <Input register={subUserForm.register("password")} type="password" placeholder="Par défaut: 123456" className="h-12 rounded-xl border-purple-200/50 bg-white/60 focus:bg-white transition-all font-bold" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="font-black text-purple-900/70 uppercase text-[9px] tracking-[0.2em] ml-1">Rôle Type</Label>
                                                        <select {...subUserForm.register("role")} className="h-12 w-full rounded-xl border border-purple-200/50 bg-white/60 px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                                                            <option value="COMMERCIAL">COMMERCIAL (CRM & Client)</option>
                                                            <option value="MAGASINIER">MAGASINIER (Stock & Dépôt)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <div className="p-10 pt-0 flex justify-end">
                                                <Button type="submit" disabled={subUserLoading} className="bg-purple-600 hover:bg-purple-700 h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-purple-600/20 border-none text-white transition-all">
                                                    {subUserLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                                    Créer le profil
                                                </Button>
                                            </div>
                                        </Card>
                                    </form>

                                    {subUsersList.length > 0 && (
                                        <Card className="shadow-sm border border-slate-100 rounded-[30px] bg-white overflow-hidden">
                                            <div className="p-8">
                                                <h3 className="font-black text-sm text-slate-900 uppercase tracking-widest mb-6">Membres de L'équipe</h3>
                                                <div className="space-y-4">
                                                    {subUsersList.map((su: any) => (
                                                        <div key={su.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                                                            <div className="flex-1 w-full text-center sm:text-left mb-3 sm:mb-0">
                                                                <p className="font-bold text-slate-800">{su.name || "Sans Nom"}</p>
                                                                <p className="text-xs text-slate-500 font-medium">{su.email}</p>
                                                            </div>
                                                            <div className="flex gap-4 items-center">
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${su.role === 'COMMERCIAL' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {su.role}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                                    onClick={() => handleDeleteSubUser(su.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ONGLET SOCIETE */}
                    {activeTab === "societe" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {!isAdmin && (
                                <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold flex gap-3 items-center">
                                    <Shield className="h-6 w-6" /> Accès restreint. Seul un administrateur peut modifier ces données.
                                </div>
                            )}
                            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
                                <Card className={`shadow-2xl border-none rounded-[40px] bg-white overflow-hidden ${!isAdmin ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="h-3 bg-orange-600 w-full" />
                                    <CardHeader className="p-10 pb-4">
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Identité Légale</CardTitle>
                                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                            Ces informations apparaîtront sur vos factures et devis PDF.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-10 pt-4">

                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="md:w-1/3 flex flex-col justify-start space-y-4">
                                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Logo Société</Label>
                                                <div className="relative group rounded-[30px] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 w-full h-36 flex items-center justify-center transition-all hover:border-orange-300">
                                                    {companyForm.watch("logo") ? (
                                                        <img src={companyForm.watch("logo")} alt="Logo" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <FileImageIcon className="w-12 h-12 text-slate-300" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <label className="cursor-pointer flex flex-col items-center text-white">
                                                            <Upload className="w-6 h-6 mb-1" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Parcourir Photo</span>
                                                            <input type="file" accept="image/*" className="hidden" disabled={loading} onChange={(e) => handleFileUpload(e, (url) => companyForm.setValue("logo", url))} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-8">
                                                <div className="space-y-3">
                                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Raison Sociale</Label>
                                                    <Input register={companyForm.register("name")} placeholder="Ex: Ma Société SARL" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Adresse Siège Social</Label>
                                                    <Input register={companyForm.register("address")} placeholder="Ex: Rue Ibn Khaldoun, Casablanca" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">N° ICE</Label>
                                                <Input register={companyForm.register("ice")} placeholder="Ex: 00123456789000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">IF</Label>
                                                <Input register={companyForm.register("if")} placeholder="Ex: 12345678" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">RC</Label>
                                                <Input register={companyForm.register("rc")} placeholder="Ex: 99999" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Email Société</Label>
                                                <Input register={companyForm.register("email")} type="email" placeholder="Ex: contact@masociete.com" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Téléphone Société</Label>
                                                <Input register={companyForm.register("phone")} placeholder="Ex: +212 600 000 000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                            </div>
                                        </div>

                                        <div className="py-2"><Separator className="bg-slate-100" /></div>

                                        <div className="space-y-3">
                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Pieds de page PDF (Mentions légales)</Label>
                                            <textarea
                                                {...companyForm.register("pdfFooter")}
                                                className="w-full min-h-[140px] p-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-400/60"
                                                placeholder="Ex: S.A.R.L. au capital de 100 000 MAD - Siège social : Casablanca - RC 12345 - ICE 0000000000000..."
                                            ></textarea>
                                        </div>
                                    </CardContent>
                                    <div className="p-10 pt-0 border-t border-slate-50 flex justify-end mt-4">
                                        <Button type="submit" disabled={loading || !isAdmin} className="bg-orange-600 hover:bg-orange-700 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/20 border-none text-white transition-all">
                                            {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
                                            Sauvegarder les modifications
                                        </Button>
                                    </div>
                                </Card>
                            </form>
                        </div>
                    )}

                    {/* ONGLET BANQUE */}
                    {activeTab === "banque" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {!isAdmin && (
                                <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold flex gap-3 items-center">
                                    <Shield className="h-6 w-6" /> Accès restreint. Seul un administrateur peut modifier ces données.
                                </div>
                            )}

                            {/* List of existing bank accounts */}
                            {bankAccounts.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {bankAccounts.map((account: any) => (
                                        <Card key={account.id} className={`shadow-xl border-2 rounded-[30px] overflow-hidden transition-all ${account.isMain ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                                            <CardContent className="p-8">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-black text-xl text-slate-900">{account.bankName}</h3>
                                                        {account.isMain ? (
                                                            <div className="inline-flex items-center mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Principal
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wide">Compte Auxiliaire</p>
                                                        )}
                                                    </div>
                                                    {isAdmin && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-full" onClick={() => handleDeleteBank(account.id)} disabled={loading}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="space-y-2 mt-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RIB</p>
                                                        <p className="font-bold text-slate-900 font-mono text-sm tracking-wider">{account.rib}</p>
                                                    </div>
                                                    {account.swift && (
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SWIFT</p>
                                                            <p className="font-bold text-slate-700 font-mono text-sm">{account.swift}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                            {isAdmin && !account.isMain && (
                                                <CardFooter className="p-4 pt-0">
                                                    <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleSetMainBank(account.id)} disabled={loading}>
                                                        Définir Principal
                                                    </Button>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Form to add a new bank account */}
                            {isAdmin && (
                                <>
                                    {!isAddingBank ? (
                                        <Button onClick={() => setIsAddingBank(true)} className="w-full border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 h-20 rounded-[30px] font-black uppercase tracking-widest text-xs transition-all hover:border-emerald-300 hover:text-emerald-700">
                                            <PlusCircle className="mr-3 w-5 h-5" /> Ajouter un compte bancaire
                                        </Button>
                                    ) : (
                                        <form onSubmit={bankForm.handleSubmit(onBankSubmit)}>
                                            <Card className="shadow-2xl border-none rounded-[40px] bg-white overflow-hidden">
                                                <div className="h-3 bg-emerald-500 w-full" />
                                                <CardHeader className="p-10 pb-4">
                                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Nouveau Compte Bancaire</CardTitle>
                                                    <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                                        Saisissez les coordonnées de la nouvelle banque.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-8 p-10 pt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Nom de la Banque</Label>
                                                            <Input register={bankForm.register("bankName", { required: true })} placeholder="Ex: Attijariwafa Bank" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">RIB</Label>
                                                            <Input register={bankForm.register("rib", { required: true })} placeholder="Ex: 007 000 0000000000000000 00" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-emerald-900" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Code SWIFT (Optionnel)</Label>
                                                            <Input register={bankForm.register("swift")} placeholder="Ex: ABCDEF12XXX" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Adresse (Agence)</Label>
                                                            <Input register={bankForm.register("bankAddress")} placeholder="Ex: Agence Principale, Rabat" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Contact Banque</Label>
                                                            <Input register={bankForm.register("contactName")} placeholder="Ex: M. Youssef" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-[0.2em] ml-1">Téléphone de la banque</Label>
                                                            <Input register={bankForm.register("contactPhone")} placeholder="Ex: 05 22 00 00 00" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <div className="p-10 pt-0 border-t border-slate-50 flex justify-end gap-4 mt-4">
                                                    <Button type="button" variant="ghost" onClick={() => { setIsAddingBank(false); bankForm.reset(); }} className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-100">
                                                        Annuler
                                                    </Button>
                                                    <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 border-none text-white transition-all">
                                                        {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
                                                        Enregistrer
                                                    </Button>
                                                </div>
                                            </Card>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ONGLET ROLES & PERMISSIONS */}
                    {activeTab === "permissions" && isAdmin && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Card className="shadow-2xl border-none rounded-[40px] bg-white overflow-hidden">
                                <div className="h-3 bg-purple-600 w-full" />
                                <CardHeader className="p-10 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Rôles & Module d'Accès</CardTitle>
                                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                                                Définissez quels modules sont accessibles pour chaque profil.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 pt-4 space-y-10">
                                    {[
                                        { id: "COMMERCIAL", label: "Commercial", color: "text-blue-600", bg: "bg-blue-50" },
                                        { id: "MAGASINIER", label: "Magasinier / Stockiste", color: "text-orange-600", bg: "bg-orange-50" }
                                    ].map((role) => (
                                        <div key={role.id} className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-4 py-2 rounded-xl ${role.bg} ${role.color} font-black uppercase text-[10px] tracking-widest`}>
                                                    Profil: {role.label}
                                                </div>
                                                <div className="flex-1 h-px bg-slate-100" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {[
                                                    { id: "STOCK", label: "Gestion de Stock", desc: "Produits, mouvements et transferts" },
                                                    { id: "CRM", label: "CRM / Clients", desc: "Fiches clients et prospects" },
                                                    { id: "INVOICES", label: "Ventes (Devis/Factures)", desc: "Création et suivi des documents" },
                                                    { id: "PURCHASES", label: "Achats & Fournisseurs", desc: "BC, Réceptions et fiches fournisseurs" }
                                                ].map((module) => {
                                                    const isSelected = (rolePermissions[role.id] || []).includes(module.id);
                                                    return (
                                                        <div
                                                            key={module.id}
                                                            onClick={() => handleRolePermissionToggle(role.id, module.id)}
                                                            className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all ${isSelected
                                                                    ? "border-purple-600 bg-purple-50/50"
                                                                    : "border-slate-100 bg-white hover:border-slate-200"
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`font-black text-xs uppercase tracking-tight ${isSelected ? "text-purple-700" : "text-slate-600"}`}>
                                                                    {module.label}
                                                                </span>
                                                                {isSelected && <CheckCircle className="h-5 w-5 text-purple-600" />}
                                                            </div>
                                                            <p className="text-[10px] font-medium text-slate-400 leading-tight">
                                                                {module.desc}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="p-10 pt-0 bg-slate-50/50 flex items-center gap-4">
                                    <Shield className="h-5 w-5 text-purple-400" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                        Les modifications sont appliquées instantanément aux utilisateurs. <br />
                                        <span className="text-purple-600">Note:</span> Certains accès peuvent nécessiter une reconnexion pour s'actualiser totalement.
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
