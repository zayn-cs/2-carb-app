import { useParams, Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import EntityPage from "@/components/EntityPage";
import { entities, entityGroups } from "@/lib/entityConfig";
import { useAuth } from "@/hooks/useAuth";
import { FlaskConical, ArrowRight, Layers, LogOut } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAll, initSqlDatabase } from "@/lib/db";
import { useLoading } from "@/context/LoadingContext";

export default function Dashboard() {
  const { entity, sectionName } = useParams();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { showLoading } = useLoading();
  const [dbReady, setDbReady] = useState<boolean>(false);

  useEffect(() => {
    initSqlDatabase()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  const handleNavigation = (path: string) => {
    showLoading(600);
    setTimeout(() => navigate(path), 200);
  };

  // Debug: Check sessionStorage
  useEffect(() => {
    console.log("Dashboard loaded, user:", user, "loading:", loading, "section:", sectionName);
  }, [user, loading, sectionName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const currentEntity = entities.find((e) => e.key === entity);
  const currentSection = entityGroups.find((g) => g.label.toLowerCase() === sectionName?.toLowerCase());

  const renderContent = () => {
    if (currentEntity) {
      return <EntityPage config={currentEntity} />;
    }

    if (currentSection) {
      const sectionItems = currentSection.items
        .map(key => entities.find(e => e.key === key))
        .filter(Boolean);

      return (
        <div className="container mx-auto py-12 px-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-[1.5rem] shadow-inner border border-primary/20">
                <Layers className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{currentSection.label}</h1>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold px-6" onClick={() => handleNavigation("/dashboard")}>
              RETOUR
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sectionItems.map((item: any) => {
              const count = getAll(item.table).length;
              return (
                <Card 
                  key={item.key} 
                  className="group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 border-slate-100 hover:border-primary/30 cursor-pointer overflow-hidden rounded-[2.5rem] bg-white bg-gradient-to-br from-white to-slate-50/30"
                  onClick={() => handleNavigation(`/dashboard/${item.key}`)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 transition-all duration-500`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <CardTitle className="mt-6 text-2xl font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs font-black uppercase tracking-[0.1em] text-primary group-hover:translate-x-2 transition-transform">
                      Accéder au module
                      <ArrowRight className="ml-2 h-4 w-4 stroke-[3px]" />
                    </div>
                  </CardContent>
                  <div className="h-2 w-0 bg-primary group-hover:w-full transition-all duration-700" />
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-8 animate-in zoom-in-95 duration-1000">
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full scale-150 group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative w-44 h-44 rounded-[3rem] bg-white flex items-center justify-center border-4 border-white shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
            <img
              src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png"
              alt="DCC Logo"
              className="h-28 w-28 object-contain transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
        
        <div className="space-y-4 max-w-2xl">
          
          
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.95]">
            Bienvenue sur le Portail <span className="text-primary">Labo Carburants</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mt-12 w-full max-w-2xl px-4">
            {entityGroups.map(group => (
              <Button 
                key={group.key}
                variant="outline" 
                className="h-32 flex flex-col items-center justify-center gap-3 bg-white rounded-[2rem] border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-primary/20 hover:scale-[1.02] transition-all group overflow-hidden relative"
                onClick={() => handleNavigation(`/dashboard/section/${group.key}`)}
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <Layers className="h-24 w-24" />
                </div>
                <span className="text-xl font-black text-slate-800 uppercase tracking-tighter group-hover:text-primary">{group.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };



  return (
    <SidebarProvider>
      <AnimatedBackground />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 bg-slate-50/50">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card sticky top-0 z-10">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h2 className="font-semibold text-foreground">
                {currentEntity?.label || currentSection?.label || "Tableau de bord"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black tracking-widest px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 uppercase">
                Session: {user.nom}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="h-9 px-4 text-red-500 hover:text-white hover:bg-red-500 transition-all rounded-xl font-black tracking-widest text-[10px] group"
              >
                <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
                DÉCONNEXION
              </Button>
            </div>
          </header>
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
}
