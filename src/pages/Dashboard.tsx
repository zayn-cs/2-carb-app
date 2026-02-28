import { useParams, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import EntityPage from "@/components/EntityPage";
import { entities } from "@/lib/entityConfig";
import { useAuth } from "@/hooks/useAuth";
import { FlaskConical } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useEffect } from "react";

export default function Dashboard() {
  const { entity } = useParams();
  const { user, loading } = useAuth();

  // Debug: Check sessionStorage
  useEffect(() => {
    console.log("Dashboard loaded, user:", user, "loading:", loading);
    console.log("sessionStorage currentUser:", sessionStorage.getItem("currentUser"));
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    // Debug: redirect to login if no user
    console.log("No user, redirecting to login");
    return <Navigate to="/" replace />;
  }

  const currentEntity = entities.find((e) => e.key === entity);

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <h2 className="font-semibold text-foreground">
              {currentEntity?.label ?? "Tableau de bord"}
            </h2>
          </header>
          {currentEntity ? (
            <EntityPage config={currentEntity} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] text-center p-6">
              <img 
                src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png" 
                alt="DCC Logo" 
                className="h-16 w-16 text-primary/30 mb-4"
              />
              <h2 className="text-2xl font-bold text-foreground mb-2">Bienvenue sur DCC-Lab</h2>
              <p className="text-muted-foreground max-w-md">
                Sélectionnez une entité dans le menu pour commencer à gérer vos données.
              </p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
