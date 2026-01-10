import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCalculator, IconChartBar, IconCoin, IconTrendingUp, IconClock, IconReceipt } from '@tabler/icons-react'
import Link from 'next/link'

const tools = [
  {
    title: 'Revenue Calculator',
    description: 'Calculate revenue goals and track sales targets for products and services',
    icon: IconCalculator,
    href: '/revenue-calculator',
    available: true,
  },
  {
    title: 'Profit Margin Calculator',
    description: 'Calculate profit margins, markup, and break-even points',
    icon: IconCoin,
    href: '#',
    available: false,
  },
  {
    title: 'ROI Calculator',
    description: 'Calculate return on investment and track campaign performance',
    icon: IconTrendingUp,
    href: '#',
    available: false,
  },
  {
    title: 'Time Tracking',
    description: 'Track billable hours and calculate client billing',
    icon: IconClock,
    href: '#',
    available: false,
  },
  {
    title: 'Expense Tracker',
    description: 'Monitor business expenses and categorize spending',
    icon: IconReceipt,
    href: '#',
    available: false,
  },
  {
    title: 'Analytics Dashboard',
    description: 'View comprehensive business metrics and insights',
    icon: IconChartBar,
    href: '/dashboard',
    available: true,
  },
]

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">Business Tools</h1>
                  <p className="text-muted-foreground mt-2">
                    A collection of essential tools to help you manage and grow your business
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    const CardWrapper = tool.available ? Link : 'div'

                    return (
                      <CardWrapper
                        key={tool.title}
                        href={tool.available ? tool.href : '#'}
                        className={tool.available ? 'block' : 'block'}
                      >
                        <Card className={`h-full transition-all ${
                          tool.available
                            ? 'hover:shadow-lg hover:border-primary/50 cursor-pointer'
                            : 'opacity-60 cursor-not-allowed'
                        }`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  tool.available
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                                  {!tool.available && (
                                    <span className="text-xs text-muted-foreground">Coming Soon</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CardDescription className="mt-2">
                              {tool.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </CardWrapper>
                    )
                  })}
                </div>

                <div className="mt-12 p-6 rounded-lg border bg-muted/50">
                  <h2 className="text-lg font-semibold mb-2">More Tools Coming Soon</h2>
                  <p className="text-sm text-muted-foreground">
                    We're continuously adding new tools to help you manage your business more effectively.
                    Check back regularly for updates!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
