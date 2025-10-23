import { Building, Zap, Calculator, Car, Factory, Trash2 } from "lucide-react";
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

interface DataCollectionSidebarProps {
  activeScope: string;
  onNavigate: (section: string) => void;
}

const scope1Items = [
  { id: "combustibles", title: "Combustibles fixes", icon: Zap },
  { id: "vehicules", title: "Véhicules", icon: Car },
  { id: "equipements", title: "Équipements mobiles", icon: Factory },
  { id: "refrigerants", title: "Réfrigérants", icon: Building },
];

const scope2Items = [
  { id: "electricite", title: "Électricité", icon: Zap },
  { id: "chauffage", title: "Chauffage/Refroidissement", icon: Building },
];

const scope3Items = [
  { id: "transport", title: "Transport employés", icon: Car },
  { id: "dechets", title: "Déchets", icon: Trash2 },
  { id: "achats", title: "Achats", icon: Factory },
  { id: "voyages", title: "Voyages d'affaires", icon: Car },
  { id: "fret", title: "Fret", icon: Factory },
  { id: "immobilisations", title: "Immobilisations", icon: Building },
];

export function DataCollectionSidebar({ activeScope, onNavigate }: DataCollectionSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getItems = () => {
    switch (activeScope) {
      case "scope1":
        return scope1Items;
      case "scope2":
        return scope2Items;
      case "scope3":
        return scope3Items;
      default:
        return [];
    }
  };

  const items = getItems();

  const getScopeLabel = () => {
    switch (activeScope) {
      case "scope1":
        return "Scope 1";
      case "scope2":
        return "Scope 2";
      case "scope3":
        return "Scope 3";
      default:
        return "";
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{getScopeLabel()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("calculate")}
                  className="w-full bg-primary/10 hover:bg-primary/20"
                >
                  <Calculator className="h-4 w-4" />
                  {!collapsed && <span>Calculer</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
