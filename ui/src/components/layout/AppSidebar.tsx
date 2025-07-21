
import {
  Home,
  Trophy,
  ShoppingBag,
  Users,
  Settings,
  Star,
  Sparkles,
  Gift,
  Award,
  BookOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const studentItems = [
  { title: "Dashboard", url: "/", icon: Home, color: "text-red-500" },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy, color: "text-orange-500" },
  { title: "Store", url: "/store", icon: ShoppingBag, color: "text-yellow-500" },
  { title: "Profile", url: "/profile", icon: Settings, color: "text-green-500" },
];

const teacherItems = [
  { title: "Dashboard", url: "/", icon: Home, color: "text-red-500" },
  { title: "Students", url: "/students", icon: Users, color: "text-orange-500" },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy, color: "text-yellow-500" },
  { title: "Store Management", url: "/store-management", icon: Gift, color: "text-green-500" },
  { title: "Transactions", url: "/transactions", icon: Award, color: "text-blue-500" },
  { title: "User Management", url: "/user-management", icon: BookOpen, color: "text-indigo-500" },
  { title: "Profile", url: "/profile", icon: Settings, color: "text-purple-500" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  
  const items = user?.role === 'TEACHER' ? teacherItems : studentItems;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-60"} bg-gradient-to-b from-violet-50 to-purple-50 border-r-2 border-purple-200`}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-800 font-bold text-lg m-8">
            {isCollapsed ? "🌈" : "🌈 Dev XP"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-200 to-pink-200 shadow-md transform scale-105 font-semibold"
                            : "hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 hover:shadow-lg hover:transform hover:scale-102"
                        }`
                      }
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </motion.div>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-gray-700 font-medium"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
