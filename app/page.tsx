import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BanknotesIcon,
  CursorArrowRaysIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  PuzzlePieceIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tools = [
  {
    title: "Revenue Strategist",
    description:
      "Calculate revenue goals and track sales targets for products and services.",
    icon: BanknotesIcon,
    href: "/revenue-calculator",
    available: true,
  },
  {
    title: "Lead Gen Funnel",
    description:
      "Calculate revenue goals and track sales targets for products and services.",
    icon: CursorArrowRaysIcon,
    href: "/lead-gen-funnel",
    available: true,
  },
  {
    title: "Conversion Engine",
    description:
      "Predict growth, simulate scenarios, and visualize acquisition funnels.",
    icon: CursorArrowRaysIcon,
    href: "/conversion-calculator",
    available: true,
  },
  {
    title: "Break-Even ROAS",
    description:
      "Calculate the minimum ROAS needed to cover costs and reach profitability.",
    icon: CurrencyDollarIcon,
    href: "/break-even-roas",
    available: true,
  },

  {
    title: "Marketing KPIs",
    description:
      "Analyze ROAS, CAC, and retention benchmarks for your campaigns.",
    icon: BeakerIcon,
    href: "/marketing-kpis",
    available: true,
  },
  {
    title: "Profit Margin Suite",
    description:
      "Instantly calculate net margins, expenses, and break-even points.",
    icon: CurrencyDollarIcon,
    href: "/profit-margin-calculator",
    available: true,
  },
  {
    title: "Vehicle Calculator (TR)",
    description:
      "Compare motorbike & car purchases with 2026 Turkish taxes, fees, notary, insurance, and installment plans.",
    icon: TruckIcon,
    href: "/vehicle-calculator",
    available: true,
  },
];

export default function HomePage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="flex flex-col gap-4 py-8 md:py-12 border-b mb-12">
              <h1 className="text-3xl font-bold tracking-tight">Multiplay</h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                A simple and powerful suite of tools to help you manage and grow
                your business metrics with precision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.title} href={tool.href} className="group">
                    <Card className="h-full transition-colors hover:bg-muted/50 border-border/50 shadow-none rounded-xl">
                      <CardHeader className="p-6">
                        <div className="p-2 w-fit bg-primary/5 text-primary rounded-lg mb-4">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-semibold mb-2">
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-20 pt-12 border-t grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Accuracy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Precise mathematical models for business growth.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Flexibility</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Easily simulate different scenarios and strategies.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Simplicity</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Clean, focused interface for rapid calculations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
