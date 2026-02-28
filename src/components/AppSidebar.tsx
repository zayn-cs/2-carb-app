import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { entities } from "@/lib/entityConfig";
import { LogOut, FlaskConical } from "lucide-react";
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

  const handleNavigation = async (path: string) => {
    showLoading(1500);
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate(path);
  };

  const handleSignOut = async () => {
    showLoading(1500);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-sm">
            <img
              src="https://www.mdn.dz/site_principal/sommaire/presentation/images/insignes/dcc.png"
              alt="DCC Logo"
              className="h-8 w-8 object-contain drop-shadow-md"
            />
          </div>
          <span className="font-bold text-xl text-white tracking-wide">DCC-Lab</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {entities.map((entity) => {
                const isActive = location.pathname === `/dashboard/${entity.key}`;
                return (
                  <SidebarMenuItem key={entity.key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleNavigation(`/dashboard/${entity.key}`)}
                      className={isActive ? "bg-blue-600 text-white" : "text-white hover:bg-blue-700"}
                    >
                      <entity.icon className="h-4 w-4" />
                      <span>{entity.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-blue-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
