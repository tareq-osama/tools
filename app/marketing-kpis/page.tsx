"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KpiInfo } from "@/components/kpi-info"
import { 
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CircleStackIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
  PresentationChartLineIcon,
  GlobeAltIcon,
  ArrowPathRoundedSquareIcon,
  BanknotesIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  SignalIcon,
  PuzzlePieceIcon,
  FingerPrintIcon,
  PlusIcon,
  MinusIcon
} from "@heroicons/react/24/solid"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from "recharts"
import NumberFlow from "@number-flow/react"

export default function MarketingKPIs() {
   // Core Metrics
   const [adSpend, setAdSpend] = React.useState<number>(5000)
   const [revenue, setRevenue] = React.useState<number>(15000)
   const [grossMargin, setGrossMargin] = React.useState<number>(60) // %
   const [newCustomers, setNewCustomers] = React.useState<number>(200)
   const [avgLtv, setAvgLtv] = React.useState<number>(350)
   
   // Funnel Metrics
   const [impressions, setImpressions] = React.useState<number>(100000)
   const [clicks, setClicks] = React.useState<number>(5000)
   
   // Entrance Animation
   const [isMounted, setIsMounted] = React.useState(false)
   React.useEffect(() => {
     setIsMounted(true)
   }, [])

   
   // Retention Metrics
   const [retentionBase, setRetentionBase] = React.useState<number>(1000)
   const [lostCustomers, setLostCustomers] = React.useState<number>(50)

   // Unit Economics Calculations
   const roas = adSpend > 0 ? revenue / adSpend : 0
   const mer = adSpend > 0 ? revenue / adSpend : 0 // Same here but conceptually different if we had other costs
   const grossProfit = revenue * (grossMargin / 100)
   const poas = adSpend > 0 ? grossProfit / adSpend : 0
   const netProfit = grossProfit - adSpend
   const cac = newCustomers > 0 ? adSpend / newCustomers : 0
   const ltvCac = cac > 0 ? avgLtv / cac : 0
   const paybackPeriod = avgLtv > 0 && cac > 0 ? (cac / (avgLtv / 12)) : 0 // Months

   // Funnel Calculations
   const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
   const cpc = clicks > 0 ? adSpend / clicks : 0
   const conversionRateFromClicks = clicks > 0 ? (newCustomers / clicks) * 100 : 0
   const cpm = impressions > 0 ? (adSpend / impressions) * 1000 : 0

   // Retention Calculations
   const churnRate = retentionBase > 0 ? (lostCustomers / retentionBase) * 100 : 0
   const retentionRate = 100 - churnRate
   const avgLifeInMonths = churnRate > 0 ? (100 / churnRate) : 0

   // Visual Data
   const benchmarkData = [
      { name: 'ROAS', value: Number(roas.toFixed(2)), target: 4.0 },
      { name: 'LTV/CAC', value: Number(ltvCac.toFixed(1)), target: 3.5 },
      { name: 'CTR (%)', value: Number(ctr.toFixed(2)), target: 1.5 },
      { name: 'Conv. (%)', value: Number(conversionRateFromClicks.toFixed(1)), target: 3.0 },
   ]

   const radarData = [
      { subject: 'Economics', A: (roas / 4) * 100, fullMark: 150 },
      { subject: 'Efficiency', A: (conversionRateFromClicks / 3) * 100, fullMark: 150 },
      { subject: 'Retention', A: (retentionRate / 90) * 100, fullMark: 150 },
      { subject: 'Attraction', A: (ctr / 1.5) * 100, fullMark: 150 },
      { subject: 'Persistence', A: (avgLifeInMonths / 24) * 100, fullMark: 150 },
   ]

   const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

   return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-6xl mx-auto w-full pb-20">
          <div className="flex flex-col gap-2 pb-6 border-b">
            <h1 className="text-2xl font-bold tracking-tight">Marketing KPI Suite</h1>
            <p className="text-xs text-muted-foreground">High-performance attribution center focusing on profitable advertising.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             <Card className="lg:col-span-1 shadow-none border h-fit">
               <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest italic text-muted-foreground">Calibration</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Ad spend</Label>
                       <InputGroup>
                         <InputGroupAddon className="bg-muted/50 border-r">
                           <InputGroupText className="font-bold">$</InputGroupText>
                         </InputGroupAddon>
                         <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={adSpend} onChange={(e) => setAdSpend(Number(e.target.value))} />
                         <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                           <InputGroupButton onClick={() => setAdSpend(Math.max(0, adSpend - 100))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                           <InputGroupButton onClick={() => setAdSpend(adSpend + 100)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                         </InputGroupAddon>
                       </InputGroup>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Revenue</Label>
                       <InputGroup>
                         <InputGroupAddon className="bg-muted/50 border-r">
                           <InputGroupText className="font-bold">$</InputGroupText>
                         </InputGroupAddon>
                         <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} />
                         <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                           <InputGroupButton onClick={() => setRevenue(Math.max(0, revenue - 1000))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                           <InputGroupButton onClick={() => setRevenue(revenue + 1000)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                         </InputGroupAddon>
                       </InputGroup>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Gross Margin</Label>
                         <KpiInfo description="The percentage of revenue surpassing the cost of goods sold. Crucial for POAS calculations." />
                       </div>
                       <InputGroup>
                         <InputGroupAddon className="p-0 border-r">
                           <InputGroupButton onClick={() => setGrossMargin(Math.max(0, grossMargin - 1))} className="h-full rounded-none w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                         </InputGroupAddon>
                         <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={grossMargin} onChange={(e) => setGrossMargin(Number(e.target.value))} />
                         <InputGroupAddon align="inline-end" className="bg-muted/50 border-l px-0">
                           <InputGroupText className="font-bold px-2">%</InputGroupText>
                           <InputGroupButton onClick={() => setGrossMargin(Math.min(100, grossMargin + 1))} className="h-full rounded-none border-l w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                         </InputGroupAddon>
                       </InputGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed">
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Impressions</Label>
                          <InputGroup>
                            <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={impressions} onChange={(e) => setImpressions(Number(e.target.value))} />
                            <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                              <InputGroupButton onClick={() => setImpressions(Math.max(0, impressions - 1000))} className="h-full rounded-none border-r w-7 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                              <InputGroupButton onClick={() => setImpressions(impressions + 1000)} className="h-full rounded-none w-7 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                       </div>
                       <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Clicks</Label>
                           <InputGroup>
                             <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={clicks} onChange={(e) => setClicks(Number(e.target.value))} />
                             <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                               <InputGroupButton onClick={() => setClicks(Math.max(0, clicks - 100))} className="h-full rounded-none border-r w-7 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                               <InputGroupButton onClick={() => setClicks(clicks + 100)} className="h-full rounded-none w-7 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                             </InputGroupAddon>
                           </InputGroup>

                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">New Customers</Label>
                       <InputGroup>
                         <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={newCustomers} onChange={(e) => setNewCustomers(Number(e.target.value))} />
                         <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                            <InputGroupButton onClick={() => setNewCustomers(Math.max(0, newCustomers - 1))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                            <InputGroupButton onClick={() => setNewCustomers(newCustomers + 1)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                         </InputGroupAddon>
                       </InputGroup>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-dashed">
                       <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Estimated LTV</Label>
                       <InputGroup>
                         <InputGroupAddon className="bg-muted/50 border-r">
                           <InputGroupText className="font-bold">$</InputGroupText>
                         </InputGroupAddon>
                         <InputGroupInput type="number" className="h-8 text-xs font-mono text-center" value={avgLtv} onChange={(e) => setAvgLtv(Number(e.target.value))} />
                         <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                           <InputGroupButton onClick={() => setAvgLtv(Math.max(0, avgLtv - 100))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                           <InputGroupButton onClick={() => setAvgLtv(avgLtv + 100)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                         </InputGroupAddon>
                       </InputGroup>
                    </div>
                  </div>
               </CardContent>
             </Card>

             <div className="lg:col-span-3 space-y-6">
                <Tabs defaultValue="economics" className="w-full">
                  <TabsList className="mb-6 border-b rounded-none bg-transparent h-10 w-full justify-start gap-8 p-0">
                    <TabsTrigger value="economics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent shadow-none font-bold text-xs uppercase tracking-widest px-0">Unit Economics</TabsTrigger>
                    <TabsTrigger value="profitability" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent shadow-none font-bold text-xs uppercase tracking-widest px-0">Profitability (POAS)</TabsTrigger>
                    <TabsTrigger value="funnel" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent shadow-none font-bold text-xs uppercase tracking-widest px-0">Efficiency</TabsTrigger>
                    <TabsTrigger value="retention" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent shadow-none font-bold text-xs uppercase tracking-widest px-0">Retention</TabsTrigger>
                  </TabsList>

                  <TabsContent value="economics" className="space-y-6 animate-in fade-in duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="shadow-none border-border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">ROAS</CardDescription>
                                <KpiInfo description="Return On Ad Spend. Calculated as Revenue / Ad Spend. Measures immediate advertising revenue efficiency." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? roas : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
                                />x
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border-border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">MER</CardDescription>
                                <KpiInfo description="Marketing Efficiency Ratio. Total Revenue / Total Marketing Spend. Provides a holistic view of marketing contribution." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? mer : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
                                />x
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border-border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">LTV / CAC</CardDescription>
                                <KpiInfo description="The ratio between Life Time Value and Cost of Acquisition. A healthy business typically targets 3x or higher." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? ltvCac : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                                />x
                              </CardTitle>
                           </CardHeader>
                        </Card>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-none border h-[300px]">
                           <CardHeader>
                              <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">Benchmarks</CardTitle>
                           </CardHeader>
                           <CardContent className="h-[220px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={benchmarkData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} axisLine={false} width={80} dy={2} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={14}>
                                       {benchmarkData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.value >= entry.target ? '#64748b' : '#cbd5e1'} />
                                       ))}
                                    </Bar>
                                    <Bar dataKey="target" fill="#f1f5f9" radius={[0, 2, 2, 0]} barSize={14} />
                                 </BarChart>
                              </ResponsiveContainer>
                           </CardContent>
                        </Card>

                        <Card className="shadow-none border h-[300px]">
                           <CardHeader>
                              <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">Strategic Balance</CardTitle>
                           </CardHeader>
                           <CardContent className="h-[220px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" fontSize={10} />
                                    <Radar name="Strategy" dataKey="A" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                                 </RadarChart>
                              </ResponsiveContainer>
                           </CardContent>
                        </Card>
                     </div>
                  </TabsContent>

                  <TabsContent value="profitability" className="space-y-6 animate-in fade-in duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="shadow-none border-border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">POAS</CardDescription>
                                <KpiInfo description="Profit On Ad Spend. (Gross Profit / Ad Spend). Measures the profit earned for every dollar spent on ads." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? poas : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
                                />x
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border-border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">Net Profit After Ad Spend</CardDescription>
                                <KpiInfo description="Total Gross Profit minus Ad Spend. The ultimate 'Contribution Margin' for your campaigns." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={netProfit} 
                                  format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                                />
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border-border bg-slate-50/50">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">CAC Payback</CardDescription>
                                <KpiInfo description="Estimated months to recoup your acquisition cost based on LTV. Crucial for cashflow planning." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? paybackPeriod : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                                /> <span className="text-xs">Mo.</span>
                              </CardTitle>
                           </CardHeader>
                        </Card>
                     </div>
                     <p className="text-[10px] text-muted-foreground p-4 bg-muted/20 border-l-2 rounded-r italic">
                        POAS is the standard for high-performance marketing. A POAS of 1.0 means you've broken even on profit, while a ROAS of 1.0 might still be unprofitable depending on your margins.
                     </p>
                  </TabsContent>

                  <TabsContent value="funnel" className="space-y-6 animate-in fade-in duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">CTR (%)</CardDescription>
                                <KpiInfo description="Click-Through Rate. Percentage of impressions that turned into clicks. Measures creative / hook strength." />
                              </div>
                              <CardTitle className="text-xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? ctr : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
                                />%
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">CPC</CardDescription>
                                <KpiInfo description="Cost Per Click. Ad Spend / Clicks. Measures traffic acquisition price." />
                              </div>
                              <CardTitle className="text-xl font-bold">
                                <NumberFlow 
                                  value={cpc} 
                                  format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                                />
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">Conv. Rate (%)</CardDescription>
                                <KpiInfo description="Conversion Rate. Percentage of clickers who became customers. Measures landing page and offer strength." />
                              </div>
                              <CardTitle className="text-xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? conversionRateFromClicks : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                                />%
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">CPM</CardDescription>
                                <KpiInfo description="Cost Per Mille. Cost for 1,000 impressions. Measures the competitive cost of your audience." />
                              </div>
                              <CardTitle className="text-xl font-bold">
                                <NumberFlow 
                                  value={cpm} 
                                  format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                                />
                              </CardTitle>
                           </CardHeader>
                        </Card>
                     </div>
                  </TabsContent>

                  <TabsContent value="retention" className="space-y-6 animate-in fade-in duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">Retention Rate</CardDescription>
                                <KpiInfo description="The percentage of existing customers who remain with your business over the period." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? retentionRate : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                                />%
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">Monthly Churn</CardDescription>
                                <KpiInfo description="The percentage of customers lost during the period. Crucial for long-term compounding." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? churnRate : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                                />%
                              </CardTitle>
                           </CardHeader>
                        </Card>
                        <Card className="shadow-none border">
                           <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">Avg. Lifetime</CardDescription>
                                <KpiInfo description="Average duration (in months) a customer continues paying you. Inversely related to churn." />
                              </div>
                              <CardTitle className="text-2xl font-bold">
                                <NumberFlow 
                                  value={isMounted ? avgLifeInMonths : 0} 
                                  format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                                /> <span className="text-xs">Mo.</span>
                              </CardTitle>
                           </CardHeader>
                        </Card>
                     </div>
                  </TabsContent>
                </Tabs>
             </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
   )
}
