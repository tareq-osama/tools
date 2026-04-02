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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { saveMarketingSimulation } from "@/lib/corvex"
import { toast } from "sonner"
import { 
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
} from "@heroicons/react/24/outline"
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
import { cn } from "@/lib/utils"

// Reusable numeric input pattern for premium standardization.
function NumericField({
  label,
  id,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  className,
  inline = false,
  description
}: {
  label: string
  id?: string
  value: number
  onChange: (val: number) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
  className?: string
  inline?: boolean
  description?: string
}) {
  return (
    <Field className={cn(className, inline && "flex-row items-center justify-between gap-4")}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <FieldLabel htmlFor={id} className={cn("text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-0")}>{label}</FieldLabel>
        {description && <KpiInfo description={description} />}
      </div>
      <InputGroup className={cn("hover:border-primary/40 transition-colors", inline ? "w-44" : "w-full")}>
        {prefix && (
          <InputGroupAddon align="inline-start" className="bg-muted/30 border-r px-2.5">
            <InputGroupText className="font-bold text-[10px]">{prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          type="number"
          className="text-center font-bold text-xs"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          step={step}
          min={min}
        />
        {suffix && (
          <InputGroupAddon align="inline-end" className="bg-muted/30 border-l px-2.5">
            <InputGroupText className="font-bold text-[10px]">{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden bg-muted/10 h-full">
          <InputGroupButton
            onClick={() => onChange(Math.max(min, value - step))}
            className="h-full rounded-none border-r w-8 hover:bg-muted/50 active:bg-muted/80 transition-colors"
          >
            <MinusIcon className="h-3.5 w-3.5 stroke-[3]" />
          </InputGroupButton>
          <InputGroupButton
            onClick={() => onChange(value + step)}
            className="h-full rounded-none w-8 hover:bg-muted/50 active:bg-muted/80 transition-colors"
          >
            <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

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

   const chartConfig = {
    value: {
      label: "Actual",
      color: "hsl(var(--primary))",
    },
    target: {
      label: "Benchmark",
      color: "hsl(var(--muted))",
    },
    A: {
      label: "Performance",
      color: "hsl(var(--primary))",
    }
   } satisfies ChartConfig

   const [isSaving, setIsSaving] = React.useState(false)

   const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveMarketingSimulation({
        adSpend,
        revenue,
        grossMargin,
        newCustomers,
        avgLtv,
        impressions,
        clicks,
        retentionBase,
        lostCustomers
      })
      toast.success("Marketing simulation saved successfully.")
    } catch (err) {
      toast.error("Failed to save simulation. Please try again.")
    } finally {
      setIsSaving(false)
    }
   }

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
                  <FieldGroup className="gap-5">
                    <NumericField
                      label="Ad spend"
                      value={adSpend}
                      onChange={setAdSpend}
                      prefix="$"
                      step={100}
                    />
                    
                    <NumericField
                      label="Revenue"
                      value={revenue}
                      onChange={setRevenue}
                      prefix="$"
                      step={1000}
                    />

                    <NumericField
                      label="Gross Margin"
                      value={grossMargin}
                      onChange={setGrossMargin}
                      suffix="%"
                      step={1}
                      description="The percentage of revenue surpassing the cost of goods sold. Crucial for POAS calculations."
                    />

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                      <NumericField
                        label="Impressions"
                        value={impressions}
                        onChange={setImpressions}
                        step={1000}
                      />
                      <NumericField
                        label="Clicks"
                        value={clicks}
                        onChange={setClicks}
                        step={100}
                      />
                    </div>

                    <NumericField
                      label="New Customers"
                      value={newCustomers}
                      onChange={setNewCustomers}
                      step={1}
                    />

                    <NumericField
                      label="Estimated LTV"
                      value={avgLtv}
                      onChange={setAvgLtv}
                      prefix="$"
                      step={100}
                    />
                  </FieldGroup>

                  <div className="pt-6">
                    <Button 
                      className="w-full text-xs font-bold uppercase tracking-[0.15em] h-10 border-foreground/20 hover:bg-foreground hover:text-background transition-all" 
                      variant="outline"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Secure Workspace Persistence"}
                    </Button>
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
                              <ChartContainer config={chartConfig} className="h-full w-full">
                                 <BarChart data={benchmarkData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} axisLine={false} width={80} dy={2} />
                                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={14}>
                                       {benchmarkData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.value >= entry.target ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.4)'} />
                                       ))}
                                    </Bar>
                                    <Bar dataKey="target" fill="hsl(var(--muted)/.5)" radius={[0, 2, 2, 0]} barSize={14} />
                                 </BarChart>
                              </ChartContainer>
                           </CardContent>
                        </Card>

                        <Card className="shadow-none border h-[300px]">
                           <CardHeader>
                              <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">Strategic Balance</CardTitle>
                           </CardHeader>
                           <CardContent className="h-[220px]">
                              <ChartContainer config={chartConfig} className="h-full w-full">
                                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="hsl(var(--border))" />
                                    <PolarAngleAxis dataKey="subject" fontSize={10} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Radar name="Strategy" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                                 </RadarChart>
                              </ChartContainer>
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
