"use client";

import * as React from "react";
import {
  HomeIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  CursorArrowRaysIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "User",
    email: "user@multiplay.com",
    avatar: "/avatars/image.png",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: HomeIcon,
    },

    {
      title: "Lead Gen Funnel",
      url: "/lead-gen-funnel",
      icon: CalculatorIcon,
    },
    {
      title: "Break-Even ROAS",
      url: "/break-even-roas",
      icon: CalculatorIcon,
    },
    {
      title: "Revenue Calculator",
      url: "/revenue-calculator",
      icon: CalculatorIcon,
    },
    {
      title: "Profit Margin Calculator",
      url: "/profit-margin-calculator",
      icon: CurrencyDollarIcon,
    },
    {
      title: "Conversion Engine",
      url: "/conversion-calculator",
      icon: CursorArrowRaysIcon,
    },
    {
      title: "Marketing KPIs",
      url: "/marketing-kpis",
      icon: ChartBarIcon,
    },
    {
      title: "Vehicle Calculator (TR)",
      url: "/vehicle-calculator",
      icon: TruckIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <PuzzlePieceIcon className="!size-5 text-primary" />
                <span className="text-base font-bold tracking-tight">
                  Multiplay
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
