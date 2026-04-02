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
import { Slider } from "@/components/ui/slider"
import { KpiInfo } from "@/components/kpi-info"
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { 
  PlusIcon,
  MinusIcon,
  UsersIcon, 
  ArrowTrendingUpIcon,
  FunnelIcon,
  ChartBarIcon,
  SparklesIcon,
  AcademicCapIcon,
  BanknotesIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline"
import { saveConversionEngineSimulation } from "@/lib/corvex"
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
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  FunnelChart,
  Funnel,
  LabelList,
  AreaChart,
  Area
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
  inline = false
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
}) {
  return (
    <Field className={cn(className, inline && "flex-row items-center justify-between gap-4")}>
      <FieldLabel htmlFor={id} className={cn("text-[10px] font-black uppercase tracking-widest text-muted-foreground/80", inline && "mb-0")}>{label}</FieldLabel>
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

export default function ConversionCalculator() {
  // Baseline Configuration
  const [visitors, setVisitors] = React.useState<number>(10000)
  const [convRate, setConvRate] = React.useState<number>(2.5)
  const [aov, setAov] = React.useState<number>(50)
  const [ltv, setLtv] = React.useState<number>(250)
  const [adSpend, setAdSpend] = React.useState<number>(2000)

  // Entrance Animation
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveConversionEngineSimulation({
        visitors: visitors,
        convRate: convRate,
        aov: aov,
        ltv: ltv,
        adSpend: adSpend,
        conversions: Math.round(calculatedConversions),
        expectedRevenue: Math.round(immediateRevenue),
        cac: cac,
        ltvCacRatio: ltvCacRatio
      })
      toast.success("Conversion simulation saved successfully.")
    } catch (err) {
      toast.error("Failed to save simulation.")
    } finally {
      setIsSaving(false)
    }
  }

  
  // Scenario Planning
  const [trafficIncrease, setTrafficIncrease] = React.useState<number>(10)
  const [convIncrease, setConvIncrease] = React.useState<number>(10)

  // Funnel Steps
  const [funnelSteps, setFunnelSteps] = React.useState([
    { name: "Website Visitors", value: 10000 },
    { name: "Product Page Views", value: 5000 },
    { name: "Add to Cart", value: 1500 },
    { name: "Checkout Start", value: 800 },
    { name: "Purchased", value: 300 },
  ])

  const chartConfig = {
    base: {
      label: "Baseline",
      color: "hsl(var(--muted-foreground))",
    },
    projected: {
      label: "Growth",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  // Calculations
  const calculatedConversions = (visitors * convRate) / 100
  const immediateRevenue = calculatedConversions * aov
  const cac = adSpend > 0 ? adSpend / calculatedConversions : 0
  const roas = adSpend > 0 ? immediateRevenue / adSpend : 0
  const ltvCacRatio = cac > 0 ? ltv / cac : 0

  // Scenario Calculations
  const scenarioVisitors = visitors * (1 + trafficIncrease / 100)
  const scenarioConvRate = convRate * (1 + convIncrease / 100)
  const scenarioConversions = (scenarioVisitors * scenarioConvRate) / 100
  const scenarioRevenue = scenarioConversions * aov
  const revenueGrowth = scenarioRevenue - immediateRevenue

  const growthProjectionData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const baseRev = immediateRevenue * Math.pow(1.05, i)
    const projectedRev = scenarioRevenue * Math.pow(1.05, i)
    return {
      name: `M${month}`,
      base: Math.round(baseRev),
      projected: Math.round(projectedRev),
    }
  })

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(Math.round(val))

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
            <h1 className="text-2xl font-bold tracking-tight">Conversion Engine</h1>
            <p className="text-xs text-muted-foreground">Adjust funnel baseline and simulate growth scenarios.</p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8 border rounded-lg p-1 bg-muted/40">
              <TabsTrigger value="overview" className="gap-2 px-6 py-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Intelligence Dashboard
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="gap-2 px-6 py-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Scenario Planner
              </TabsTrigger>
              <TabsTrigger value="funnel" className="gap-2 px-6 py-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Funnel Architect
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">Monthly Conversions</CardDescription>
                      <KpiInfo description="Estimated number of customers acquired based on traffic and conversion rate." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow value={isMounted ? calculatedConversions : 0} />
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">Expected Revenue</CardDescription>
                      <KpiInfo description="Total revenue generated from new conversions within the period." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow 
                        value={isMounted ? immediateRevenue : 0} 
                        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                      />
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">CAC</CardDescription>
                      <KpiInfo description="Customer Acquisition Cost. Total budget spent divided by conversions." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow 
                        value={isMounted ? cac : 0} 
                        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                      />
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">LTV : CAC</CardDescription>
                      <KpiInfo description="The ratio of Customer Lifetime Value to Acquisition Cost. Targets should be >3x." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow 
                        value={isMounted ? ltvCacRatio : 0} 
                        format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                      />x
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                       Baseline Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FieldGroup className="gap-6">
                      <div>
                        <NumericField
                          label="Monthly Visitors"
                          id="visitors"
                          value={visitors}
                          onChange={setVisitors}
                          step={1000}
                          inline
                        />
                        <div className="pt-3 px-1">
                          <Slider min={100} max={100000} step={100} value={[visitors]} onValueChange={([val]) => setVisitors(val)} />
                        </div>
                      </div>

                      <div>
                        <NumericField
                          label="Conv. Rate"
                          id="convRate"
                          value={convRate}
                          onChange={setConvRate}
                          suffix="%"
                          step={0.1}
                          inline
                        />
                        <div className="pt-3 px-1">
                          <Slider min={0.1} max={20} step={0.1} value={[convRate]} onValueChange={([val]) => setConvRate(val)} />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-dashed grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NumericField
                          label="Ad Budget"
                          id="adSpend"
                          value={adSpend}
                          onChange={setAdSpend}
                          prefix="$"
                          step={100}
                        />
                        <NumericField
                          label="AOV"
                          id="aov"
                          value={aov}
                          onChange={setAov}
                          prefix="$"
                          step={10}
                        />
                      </div>

                      <NumericField
                        label="Projected LTV"
                        id="ltv"
                        value={ltv}
                        onChange={setLtv}
                        prefix="$"
                        step={50}
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

                <Card className="lg:col-span-2 shadow-none border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y border rounded-lg overflow-hidden">
                       <div className="flex justify-between p-4 text-sm font-medium">
                          <span className="text-muted-foreground">ROAS</span>
                          <span className="font-bold">{Number(roas.toFixed(2))}x</span>
                       </div>
                       <div className="flex justify-between p-4 text-sm font-medium">
                          <span className="text-muted-foreground">Conversion Value</span>
                          <span className="font-bold">{formatCurrency(ltv)}</span>
                       </div>
                       <div className="flex justify-between p-4 text-sm font-medium">
                          <span className="text-muted-foreground">LTV:CAC Ratio</span>
                          <span className="font-bold">{Number(ltvCacRatio.toFixed(2))}x</span>
                       </div>
                       <div className="p-4 bg-muted/20 text-xs leading-relaxed italic text-muted-foreground">
                          To achieve 5x LTV:CAC, you need an LTV of {formatCurrency(cac*5)}.
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base font-bold italic">Simulate Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                                <span>Traffic Lift (%)</span>
                                <span className="text-foreground">+{trafficIncrease}%</span>
                            </div>
                            <Slider min={0} max={500} step={5} value={[trafficIncrease]} onValueChange={([val]) => setTrafficIncrease(val)} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                                <span>Conv. Lift (%)</span>
                                <span className="text-foreground">+{convIncrease}%</span>
                            </div>
                            <Slider min={0} max={200} step={1} value={[convIncrease]} onValueChange={([val]) => setConvIncrease(val)} />
                        </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2 shadow-none border border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-8 border-b">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-bold">Compound Forecast</CardTitle>
                            <CardDescription className="text-[10px]">12-Month revenue forecasting.</CardDescription>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-bold text-muted-foreground block uppercase">Revenue Lift</span>
                           <span className="text-xl font-bold text-foreground">+{((revenueGrowth/immediateRevenue)*100).toFixed(0)}%</span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[340px] pt-8">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart data={growthProjectionData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="base" stroke="hsl(var(--muted-foreground)/0.4)" fillOpacity={0} />
                                <Area type="monotone" dataKey="projected" stroke="hsl(var(--primary))" fillOpacity={0.1} fill="hsl(var(--primary))" strokeWidth={2} />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base font-bold italic">Acquisition Mapper</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FieldGroup className="gap-5">
                          {funnelSteps.map((step, index) => (
                            <NumericField
                              key={step.name}
                              label={step.name}
                              value={step.value}
                              onChange={(val) => {
                                  const newFunnel = [...funnelSteps]
                                  newFunnel[index].value = val
                                  setFunnelSteps(newFunnel)
                              }}
                              step={100}
                            />
                          ))}
                      </FieldGroup>
                    </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 shadow-none border border-border">
                        <CardHeader className="border-b bg-muted/10">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visual Acquisition Flow</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px] pt-8">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <FunnelChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Funnel data={funnelSteps.map((step, index) => {
                                  return {
                                    ...step,
                                    fill: `hsl(var(--muted-foreground))`,
                                    fillOpacity: 1 - index * 0.15
                                  }
                                })} dataKey="value" nameKey="name">
                                    <LabelList position="right" fill="hsl(var(--muted-foreground))" stroke="none" dataKey="name" fontSize={10} fontWeight="600" />
                                </Funnel>
                                </FunnelChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
