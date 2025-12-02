

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ClipboardList, Upload, Package, Hash, FileText } from "lucide-react";
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
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

const allNavigationItems = [
  {
    title: "InBond Form",
    url: createPageUrl("InBondForm"),
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: "C209 + C208 LOG",
    url: createPageUrl("ShipmentLog"),
    icon: ClipboardList,
    roles: ['admin', 'user'],
  },
  {
    title: "RAMP INPUT",
    url: createPageUrl("RampInput"),
    icon: Upload,
    roles: ['admin', 'user'],
  },
  {
    title: "LOGISTIC INPUT",
    url: createPageUrl("LogisticInput"),
    icon: Package,
    roles: ['admin'],
  },
  {
    title: "Check Numbers",
    url: createPageUrl("CheckNumbers"),
    icon: Hash,
    roles: ['admin'],
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
    initialData: [],
  });

  const expiredCount = shipments.filter(s => s.status === 'EXPIRED').length;

  const userRole = user?.role || 'user';
  const navigationItems = allNavigationItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-slate-50">
        {/* Desktop Sidebar */}
        <Sidebar className="border-r border-blue-100 hidden md:flex">
          <SidebarHeader className="border-b border-blue-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">C209 Book</h2>
                <p className="text-xs text-gray-500">V3.0 - UK Custom</p>
              </div>
            </div>
            {user && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Zalogowany jako:</p>
                <p className="font-semibold text-sm">{user.full_name || user.email}</p>
                <Badge className={userRole === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}>
                  {userRole === 'admin' ? 'Admin' : 'Ramp Agent'}
                </Badge>
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-100 text-blue-700 shadow-sm font-semibold' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-3 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-blue-800">Inbound</span>
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                      {shipments.filter(s => s.status === 'INBOUND').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-green-800">Outbound</span>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      {shipments.filter(s => s.status === 'OUTBOUND').length}
                    </Badge>
                  </div>
                  {expiredCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-sm font-medium text-red-800">Wygasłe (48h)</span>
                      <Badge className="bg-red-600 hover:bg-red-700">{expiredCount}</Badge>
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-blue-100 shadow-2xl">
          <div className="flex justify-around items-center px-2 py-3">
            {navigationItems.slice(0, 4).map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all ${
                  location.pathname === item.url 
                    ? 'text-blue-700 bg-blue-50' 
                    : 'text-gray-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium truncate max-w-[60px]">
                  {item.title.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="bg-white border-b border-blue-100 px-4 py-4 md:hidden shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">C209 Book V3.0</h1>
                  <p className="text-xs text-gray-500">{userRole === 'admin' ? 'Admin' : 'Ramp Agent'}</p>
                </div>
              </div>
              {expiredCount > 0 && (
                <Badge className="bg-red-600 hover:bg-red-700">
                  {expiredCount}
                </Badge>
              )}
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

