import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  UsersRound,
  Settings,
  Activity,
  ChevronDown,
  CheckSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useCrm } from "@/contexts/CrmContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const menuItemsTop = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const menuItemsBottom = [
  { title: "Pacientes", url: "/pacientes", icon: UserCheck },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
  { title: "Orçamentos", url: "/orcamentos", icon: FileText },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Equipe", url: "/equipe", icon: UsersRound },
  { title: "Reativação", url: "/reativacao", icon: Activity },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { pipelines } = useCrm();
  const [leadsOpen, setLeadsOpen] = useState(location.pathname.startsWith("/leads"));

  const renderMenuItem = (item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.url === "/"}
          className="hover:bg-sidebar-accent"
          activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
        >
          <item.icon className="h-4 w-4 mr-2" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-primary">
                Via clinic
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItemsTop.map(renderMenuItem)}

              {/* Leads expandable */}
              <SidebarMenuItem>
                {collapsed ? (
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={pipelines[0] ? `/leads/${pipelines[0].id}` : "/leads"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                    >
                      <Users className="h-4 w-4 mr-2" />
                    </NavLink>
                  </SidebarMenuButton>
                ) : (
                  <Collapsible open={leadsOpen} onOpenChange={setLeadsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">Leads</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${leadsOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 mt-1 space-y-0.5">
                      {pipelines.map((pipeline) => (
                        <SidebarMenuButton key={pipeline.id} asChild>
                          <NavLink
                            to={`/leads/${pipeline.id}`}
                            className="hover:bg-sidebar-accent text-sm"
                            activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                          >
                            <span>{pipeline.nome}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </SidebarMenuItem>

              {menuItemsBottom.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
