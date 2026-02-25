"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Zap,
  Shield,
  BarChart3,
  Package,
  Users,
  FileText,
  CreditCard,
  LayoutDashboard,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { MakhazineLogo } from "@/components/MakhazineLogo";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 overflow-x-hidden">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b bg-white fixed top-0 left-0 right-0 z-[1001]">
        <MakhazineLogo className="h-10 w-10" textClassName="text-2xl font-black" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-orange-600 transition-colors">Fonctionnalités</Link>
          <Link href="#pricing" className="hover:text-orange-600 transition-colors">Tarifs</Link>
          <Link href="/login" className="px-4 py-2 text-slate-900 hover:text-orange-600">Connexion</Link>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 rounded-lg px-6 shadow-lg shadow-orange-200 border-none text-white">
            <Link href="/register">Essai Gratuit</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-orange-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-20 z-[1000] md:hidden bg-white border-t border-slate-100 flex flex-col pt-4 overflow-y-auto">
            <nav className="flex flex-col p-6 gap-6 text-lg font-bold text-slate-900">
              <a
                href="#features"
                className="hover:text-orange-600 transition-colors py-2 border-b border-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Fonctionnalités
              </a>
              <a
                href="#pricing"
                className="hover:text-orange-600 transition-colors py-2 border-b border-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Tarifs
              </a>
              <Link
                href="/login"
                className="hover:text-orange-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
              <Button asChild className="bg-orange-600 hover:bg-orange-700 rounded-xl py-7 shadow-lg shadow-orange-200 border-none text-white text-lg mt-4">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Essai Gratuit
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-20 pb-32 text-center lg:text-left grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-orange-100">
              <Zap className="h-3 w-3 fill-orange-500" /> Élu meilleur ERP Stock 2026
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              Simplifiez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Gestion de Stock</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              Makhazine est la plateforme tout-en-un pour les entreprises marocaines. Gérez vos entrepôts, suivez vos ventes et automatisez votre facturation en conformité avec la réglementation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-10 py-7 rounded-xl shadow-2xl shadow-orange-200 border-none group text-white font-bold" asChild>
                <Link href="/register">
                  Démarrer Makhazine <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-xl border-2 bg-white hover:bg-slate-50 font-bold">
                Voir la Démo
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Paiement Sécurisé</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Facile à utiliser</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Automatisé</div>
            </div>
          </div>

          <div className="relative">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200/20 rounded-full blur-[100px] animate-pulse hidden sm:block"></div>
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px] animate-pulse hidden sm:block"></div>

            {/* Glassmorphism Mockup */}
            <div className="bg-white/40 backdrop-blur-xl p-4 rounded-[32px] shadow-[0_32px_80px_-16px_rgba(30,41,59,0.15)] border border-white/60 relative z-20 overflow-hidden transform hover:-rotate-1 transition-transform duration-700 hidden lg:block">
              <div className="w-full h-[450px] bg-slate-900 rounded-[24px] p-6 overflow-hidden">
                <div className="flex gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center"><LayoutDashboard className="h-6 w-6 text-orange-500" /></div>
                  <div className="space-y-2 py-1">
                    <div className="h-2 w-32 bg-slate-700 rounded-full"></div>
                    <div className="h-3 w-48 bg-slate-800 rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="h-32 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col justify-end p-4">
                    <div className="h-1 w-12 bg-orange-500 mb-2"></div>
                    <div className="h-6 w-20 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-32 rounded-2xl bg-orange-600 border border-orange-500 flex flex-col justify-end p-4">
                    <div className="h-1 w-12 bg-white/50 mb-2"></div>
                    <div className="h-6 w-20 bg-white/30 rounded"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl bg-slate-800/30 border border-slate-700/50"></div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -right-6 top-1/4 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 z-30 animate-bounce duration-[5000ms] hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg"><BarChart3 className="h-5 w-5 text-emerald-600" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ventes du jour</p>
                  <p className="text-sm font-black text-slate-900">+12,500 DH</p>
                </div>
              </div>
            </div>
            <div className="absolute -left-10 bottom-1/4 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 z-30 animate-bounce duration-[7000ms] hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg"><Package className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Alerte Stock</p>
                  <p className="text-sm font-black text-slate-900">3 Articles bas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-5 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-sm font-black text-orange-600 uppercase tracking-[0.3em] mb-4">Fonctionnalités B2B</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-16">Un écosystème complet pour votre logistique</h3>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Dashboard Décisionnel", desc: "Vision 360° sur votre trésorerie et vos performances commerciales en temps réel.", icon: BarChart3 },
                { title: "Entrepôts & Stocks", desc: "Multi-dépôts, suivi des dates de péremption et alertes de stock critique.", icon: Package },
                { title: "CRM & Fidélisation", desc: "Suivez vos clients, gérez les encours et automatisez vos relances.", icon: Users },
                { title: "Facturation Normée IF/RC", desc: "Edition de documents légaux (Factures, Devis, BL) aux normes marocaines.", icon: FileText },
                { title: "Analyses de Mouvement", desc: "Historique complet des entrées/sorties pour une traçabilité totale.", icon: LayoutDashboard },
                { title: "Sécurité & Multi-Comptes", desc: "Gestion sophistiquée des accès pour vos collaborateurs avec audits.", icon: Shield },
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 p-10 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:bg-white transition-all duration-300 group hover:-translate-y-2">
                  <div className="bg-white w-16 h-16 shadow-sm rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                    <f.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-slate-900 tracking-tight">{f.title}</h4>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-orange-200">Tarification Directe</div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Investissez dans votre organisation</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-20 text-lg font-medium">
              Profitez d'une période de démo de <span className="text-orange-600 font-bold">30 jours</span> pour tester l'intégralité de la plateforme.
            </p>

            <div className="grid md:grid-cols-3 gap-8 items-end">
              {/* Basic Pack */}
              <div className="bg-white p-12 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Pack Basic</h4>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-5xl font-black text-slate-900">99</span>
                  <span className="text-slate-400 font-bold text-lg">DHS/mois</span>
                </div>
                <ul className="text-left space-y-4 mb-10 text-slate-600 text-sm font-bold">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Stock jusqu'à 50 articles</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> 100 Factures PDF / mois</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> 1 Utilisateur unique</li>
                </ul>
                <Button variant="outline" className="w-full rounded-xl py-6 border-2 hover:bg-slate-50 font-bold h-14" asChild>
                  <Link href="/register">Commencer l'essai</Link>
                </Button>
              </div>

              {/* Premium Pack */}
              <div className="bg-slate-900 p-12 rounded-[40px] border-[6px] border-orange-600 shadow-2xl transition-all duration-500 relative scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-b-2xl">Plus Populaire</div>
                <h4 className="text-xl font-bold text-white mb-2">Pack Premium</h4>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-6xl font-black text-white">149</span>
                  <span className="text-orange-400 font-bold text-lg">DHS/mois</span>
                </div>
                <ul className="text-left space-y-4 mb-10 text-slate-300 text-sm font-bold">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Stock Illimité</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Factures Illimitées</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Jusqu'à 5 Utilisateurs</li>
                </ul>
                <Button className="w-full rounded-xl py-6 bg-orange-600 hover:bg-orange-700 font-bold shadow-xl shadow-orange-600/30 h-16 text-lg border-none text-white whitespace-nowrap" asChild>
                  <Link href="/register">Accès Premium</Link>
                </Button>
              </div>

              {/* Gold Pack */}
              <div className="bg-white p-12 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Pack Gold</h4>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-5xl font-black text-slate-900">399</span>
                  <span className="text-slate-400 font-bold text-lg">DHS/mois</span>
                </div>
                <ul className="text-left space-y-4 mb-10 text-slate-600 text-sm font-bold">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Tout le Premium</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Gestion Multi-Sociétés</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-orange-600" /> branding personnalisé</li>
                </ul>
                <Button variant="outline" className="w-full rounded-xl py-6 border-2 hover:bg-slate-50 font-bold h-14" asChild>
                  <Link href="/register">Accès Gold</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white pt-24 pb-12 px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <MakhazineLogo className="h-12 w-12" textClassName="text-3xl text-white font-black" />
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
              La solution logistique conçue pour les entrepreneurs marocains ambitieux. Sécurité, traçabilité et simplicité.
            </p>
          </div>
          <div>
            <h5 className="font-black mb-8 text-xs uppercase tracking-[0.3em] text-orange-600">Plateforme</h5>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Dépôts & Stock</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Facturation CRM</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black mb-8 text-xs uppercase tracking-[0.3em] text-orange-600">Légal</h5>
            <ul className="space-y-4 text-slate-400 font-bold text-sm">
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Conditions Générales</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Protection des Données</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Support Technique</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-[10px] font-black tracking-widest uppercase">
          <p>© 2026 Makhazine ERP. Developpé pour le marché Marocain.</p>
          <div className="flex gap-10">
            <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
