import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { entities, entityGroups } from "@/lib/entityConfig";
import { LogOut, FlaskConical, ChevronDown, ChevronUp, Home, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/context/LoadingContext";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { showLoading } = useLoading();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    showLoading(1500);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await signOut();
    navigate("/");
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Administration": true,
    "Laboratoire": true,
    "Ressources": true,
    "Système": true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleGroupClick = async (label: string) => {
    toggleGroup(label);
    handleNavigation(`/dashboard/section/${label.toLowerCase()}`);
  };

  const isHomeActive = location.pathname === "/dashboard";

  return (
    <Sidebar className="border-r-0 bg-slate-900 text-white z-50">
      <SidebarHeader className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/20 rounded-[1.25rem] shadow-lg shadow-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
             <img 
               src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png" 
               alt="DCC Logo" 
               className="h-10 w-10 object-contain brightness-110"
             />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">LABO</h1>
            <span className="text-[9px] font-black tracking-[0.3em] text-primary/80 uppercase">Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-900 px-3 py-8 space-y-3">
        {/* Home Button added here */}
        <SidebarGroup className="py-0 px-1 mb-2">
          <button 
            onClick={() => handleNavigation("/dashboard")}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-black uppercase text-[11px] tracking-[0.15em] border border-transparent ${
              isHomeActive 
                ? "bg-white/10 text-white border-white/10 shadow-lg" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${isHomeActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-800 text-slate-500"}`}>
              <Home className="h-5 w-5" />
            </div>
            <span>Tableau de bord</span>
          </button>
        </SidebarGroup>
        {entityGroups.map((group) => {
          const isOpen = openGroups[group.label];
          const isSectionActive = location.pathname === `/dashboard/section/${group.label.toLowerCase()}`;
          const groupItems = group.items.map(key => entities.find(e => e.key === key)).filter(Boolean);

          return (
            <SidebarGroup key={group.label} className="py-1">
              <button 
                onClick={() => handleGroupClick(group.label)}
                className={`w-full flex items-center justify-between font-black uppercase text-[11px] tracking-[0.15em] px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isSectionActive 
                    ? "text-white bg-primary shadow-lg shadow-primary/30" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isSectionActive ? "bg-white scale-125 shadow-[0_0_8px_white]" : "bg-slate-700 group-hover:bg-slate-500"
                  }`} />
                  <span>{group.label}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"} ${isSectionActive ? "text-white" : "text-slate-600"}`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              
              {isOpen && (
                <SidebarGroupContent className="mt-2 pl-4">
                  <SidebarMenu className="space-y-1 mt-1 border-l border-slate-800">
                    {groupItems.map((item: any) => {
                      const isActive = location.pathname === `/dashboard/${item.key}`;
                      return (
                        <SidebarMenuItem key={item.key}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => handleNavigation(`/dashboard/${item.key}`)}
                            className={`flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 ${
                              isActive 
                                ? "bg-white/10 text-white font-black border-l-4 border-primary shadow-sm" 
                                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 active:scale-95"
                            }`}
                          >
                            <item.icon className={`h-5 w-5 shrink-0 transition-colors duration-300 ${isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"}`} />
                            <span className="text-sm font-bold tracking-wide truncate">{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-900 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-black transition-all px-5 py-8 rounded-2xl group"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="tracking-[0.1em] text-xs">DÉCONNEXION</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
