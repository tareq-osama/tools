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
import { Button } from "@/components/ui/button"
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ReceiptPercentIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  UsersIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CursorArrowRaysIcon,
  BookmarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline"
import { KpiInfo } from "@/components/kpi-info"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { saveProfitMarginSimulation } from "@/lib/corvex"

interface Expense {
  id: string
  name: string
  amount: number
}

const pieChartConfig = {
  COGS:       { label: "COGS",       color: "#f87171" },
  "Ad Spend": { label: "Ad Spend",   color: "#3b82f6" },
  OpEx:       { label: "OpEx",       color: "#fb923c" },
  "Net Profit":{ label: "Net Profit", color: "#4ade80" },
} satisfies ChartConfig

const barChartConfig = {
  value: { label: "Amount" },
} satisfies ChartConfig

export default function ProfitMarginCalculator() {
  const [price, setPrice]               = React.useState<number>(100)
  const [units, setUnits]               = React.useState<number>(50)
  const [cogsPerUnit, setCogsPerUnit]   = React.useState<number>(40)
  const [adSpend, setAdSpend]           = React.useState<number>(500)
  const [expenses, setExpenses]         = React.useState<Expense[]>([
    { id: "1", name: "Rent",     amount: 1000 },
    { id: "2", name: "Software", amount: 200  },
  ])

  // Conversion Engine toggle
  const [showCE, setShowCE]           = React.useState(false)
  const [ceVisitors, setCeVisitors]   = React.useState<number>(5000)
  const [ceConvRate, setCeConvRate]   = React.useState<number>(2.5)

  // Save state
  const [saving, setSaving]           = React.useState(false)
  const [saveMsg, setSaveMsg]         = React.useState<string | null>(null)

  // Entrance animation
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => { setIsMounted(true) }, [])

  // ── Main calculations ────────────────────────────────────────────────────
  const totalRevenue      = price * units
  const totalCogs         = cogsPerUnit * units
  const grossProfit       = totalRevenue - totalCogs
  const grossMargin       = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  const totalOtherExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalExpenses     = totalOtherExpenses + adSpend
  const netProfit         = grossProfit - totalExpenses
  const netMargin         = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const roas              = adSpend > 0 ? totalRevenue / adSpend : 0
  const cac               = units > 0 ? adSpend / units : 0
  const roi               = (totalCogs + totalExpenses) > 0 ? (netProfit / (totalCogs + totalExpenses)) * 100 : 0

  // ── Conversion Engine calculations ──────────────────────────────────────
  const ceConversions = (ceVisitors * ceConvRate) / 100
  const ceRevenue     = ceConversions * price
  const ceCac         = adSpend > 0 && ceConversions > 0 ? adSpend / ceConversions : 0
  const ceLtvCac      = ceCac > 0 ? (price * 3) / ceCac : 0

  // ── Expense helpers ──────────────────────────────────────────────────────
  const addExpense = () =>
    setExpenses([...expenses, { id: Math.random().toString(36).substr(2,9), name: "New Expense", amount: 0 }])

  const updateExpense = (id: string, field: keyof Expense, value: string | number) =>
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))

  const removeExpense = (id: string) =>
    setExpenses(expenses.filter(e => e.id !== id))

  // ── Chart data ───────────────────────────────────────────────────────────
  const chartData = [
    { name: "Revenue",    value: totalRevenue,          color: "hsl(var(--primary))" },
    { name: "COGS",       value: totalCogs,              color: "#f87171" },
    { name: "Expenses",   value: totalExpenses,          color: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), color: "#4ade80" },
  ]

  const pieData = [
    { name: "COGS",       value: totalCogs,              fill: "#f87171" },
    { name: "Ad Spend",   value: adSpend,                fill: "#3b82f6" },
    { name: "OpEx",       value: totalOtherExpenses,     fill: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), fill: "#4ade80" },
  ]

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val)

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await saveProfitMarginSimulation({
        price, units, cogsPerUnit, adSpend, expenses,
        totalRevenue, netProfit,
        netMargin: Number(netMargin.toFixed(2)),
        grossMargin: Number(grossMargin.toFixed(2)),
      })
      setSaveMsg("Simulation saved!")
    } catch {
      setSaveMsg("Save failed — check CORVEX_API_KEY in .env.local")
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 4000)
    }
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full pb-16">

          {/* Page header */}
          <div className="flex flex-col gap-2 pb-4 border-b">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profit Margin Calculator</h1>
            <p className="text-xs text-muted-foreground">
              Analyze your business performance with real-time KPI calculations and expense tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Inputs column ─────────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Product & Sales */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <BriefcaseIcon className="h-4 w-4 text-primary" />
                    Product & Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Sale Price per Unit</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon className="bg-muted/50 border-r">
                          <InputGroupText className="font-bold text-xs">$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="price"
                          type="number"
                          className="text-center"
                          value={price}
                          onChange={e => setPrice(Number(e.target.value))}
                        />
                        <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                          <InputGroupButton onClick={() => setPrice(Math.max(0, price - 1))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                          <InputGroupButton onClick={() => setPrice(price + 1)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel>Units Sold</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id="units"
                          type="number"
                          className="text-center"
                          value={units}
                          onChange={e => setUnits(Number(e.target.value))}
                        />
                        <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                          <InputGroupButton onClick={() => setUnits(Math.max(0, units - 10))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                          <InputGroupButton onClick={() => setUnits(units + 10)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>

                    <Field>
                      <FieldLabel>Cost per Unit (COGS)</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon className="bg-muted/50 border-r">
                          <InputGroupText className="font-bold text-xs">$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="cogs"
                          type="number"
                          className="text-center"
                          value={cogsPerUnit}
                          onChange={e => setCogsPerUnit(Number(e.target.value))}
                        />
                        <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                          <InputGroupButton onClick={() => setCogsPerUnit(Math.max(0, cogsPerUnit - 1))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                          <InputGroupButton onClick={() => setCogsPerUnit(cogsPerUnit + 1)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Operating Expenses */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <ReceiptPercentIcon className="h-4 w-4 text-primary" />
                    Operating Expenses
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addExpense}>
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field>
                    <FieldLabel>Monthly Ad Spend</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon className="bg-muted/50 border-r">
                        <InputGroupText className="font-bold text-xs">$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="adSpend"
                        type="number"
                        className="text-center"
                        value={adSpend}
                        onChange={e => setAdSpend(Number(e.target.value))}
                      />
                      <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                        <InputGroupButton onClick={() => setAdSpend(Math.max(0, adSpend - 100))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                        <InputGroupButton onClick={() => setAdSpend(adSpend + 100)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>

                  {/* Dynamic expenses */}
                  {expenses.length > 0 && (
                    <div className="pt-2 border-t space-y-2">
                      {expenses.map(expense => (
                        <div key={expense.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Expense name"
                            className="flex-1 h-9"
                            value={expense.name}
                            onChange={e => updateExpense(expense.id, "name", e.target.value)}
                          />
                          <InputGroup className="w-28">
                            <InputGroupAddon className="bg-muted/50 border-r">
                              <InputGroupText className="text-[10px] font-bold">$</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              type="number"
                              className="text-xs text-center px-1"
                              value={expense.amount}
                              onChange={e => updateExpense(expense.id, "amount", Number(e.target.value))}
                            />
                            <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                              <InputGroupButton onClick={() => updateExpense(expense.id, "amount", Math.max(0, expense.amount - 100))} className="h-full rounded-none border-r w-7 shrink-0"><MinusIcon className="h-2.5 w-2.5" /></InputGroupButton>
                              <InputGroupButton onClick={() => updateExpense(expense.id, "amount", expense.amount + 100)} className="h-full rounded-none w-7 shrink-0"><PlusIcon className="h-2.5 w-2.5" /></InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeExpense(expense.id)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {expenses.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground py-2 italic">No additional expenses added.</p>
                  )}
                </CardContent>
              </Card>

              {/* Conversion Engine toggle */}
              <Button
                variant={showCE ? "secondary" : "outline"}
                size="sm"
                className="w-full gap-2 text-xs font-bold uppercase tracking-wide"
                onClick={() => setShowCE(v => !v)}
              >
                <CursorArrowRaysIcon className="h-4 w-4" />
                {showCE ? "Hide Conversion Engine" : "Add Conversion Engine"}
              </Button>

              {showCE && (
                <Card className="border-dashed border-primary/40 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                      <FunnelIcon className="h-4 w-4 text-primary" />
                      Conversion Engine
                    </CardTitle>
                    <CardDescription className="text-[10px]">Uses sale price as AOV. Ad spend is shared.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Monthly Visitors</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            className="text-center"
                            value={ceVisitors}
                            onChange={e => setCeVisitors(Number(e.target.value))}
                          />
                          <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                            <InputGroupButton onClick={() => setCeVisitors(Math.max(0, ceVisitors - 500))} className="h-full rounded-none border-r w-8 shrink-0"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                            <InputGroupButton onClick={() => setCeVisitors(ceVisitors + 500)} className="h-full rounded-none w-8 shrink-0"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel>Conversion Rate</FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            className="text-center"
                            step={0.1}
                            value={ceConvRate}
                            onChange={e => setCeConvRate(Number(e.target.value))}
                          />
                          <InputGroupAddon align="inline-end" className="bg-muted/50 border-l px-2">
                            <InputGroupText className="text-xs font-bold">%</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                    </FieldGroup>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      {[
                        { label: "Conversions",   value: Math.round(ceConversions).toString() },
                        { label: "CE Revenue",    value: formatCurrency(ceRevenue) },
                        { label: "CAC",           value: formatCurrency(ceCac) },
                        { label: "LTV:CAC",       value: `${ceLtvCac.toFixed(1)}x` },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-lg bg-background border p-2">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                          <p className="text-sm font-black text-foreground mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Results column ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Top KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-bold uppercase tracking-wide">Total Revenue</CardDescription>
                      <KpiInfo description="The total dollar amount of products or services sold." />
                    </div>
                    <CardTitle className="text-2xl font-black text-foreground">
                      <NumberFlow value={totalRevenue} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className={cn("border-primary/20 shadow-sm", netProfit >= 0 ? "bg-green-500/5" : "bg-red-500/5")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-bold uppercase tracking-wide italic">Net Profit</CardDescription>
                      <KpiInfo description="Take home earnings after COGS, Ad Spend, and all overhead expenses." />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-3xl font-black", netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                        <NumberFlow value={netProfit} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
                      </CardTitle>
                      {netProfit >= 0
                        ? <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
                        : <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />}
                    </div>
                  </CardHeader>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-bold uppercase tracking-wide">Net Margin</CardDescription>
                      <KpiInfo description="The percentage of revenue that is actual profit after all expenses." />
                    </div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl font-black text-foreground">
                        <NumberFlow value={Number(netMargin.toFixed(1))} />%
                      </CardTitle>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-700", netMargin > 30 ? "bg-green-500" : netMargin > 10 ? "bg-blue-500" : "bg-yellow-500")}
                          style={{ width: `${Math.min(100, Math.max(0, netMargin))}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <MegaphoneIcon className="h-3 w-3" />, label: "ROAS",        value: `${roas.toFixed(2)}x`,       info: "Return On Ad Spend. Revenue generated for every dollar spent on ads." },
                  { icon: <UsersIcon className="h-3 w-3" />,     label: "CAC",         value: formatCurrency(cac),          info: "Customer Acquisition Cost. Total marketing spend divided by units sold." },
                  { icon: <ArrowTrendingUpIcon className="h-3 w-3" />, label: "ROI",   value: `${roi.toFixed(1)}%`,         info: "Return On Investment. Measures the relative profitability of your total spend." },
                  { icon: <ArrowRightIcon className="h-3 w-3" />, label: "Gross Margin", value: `${grossMargin.toFixed(1)}%`, info: "The percentage of revenue that exceeds COGS." },
                ].map(({ icon, label, value, info }) => (
                  <Card key={label} className="hover:border-primary/30 transition-colors bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between w-full mb-1">
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          {icon} {label}
                        </CardDescription>
                        <KpiInfo description={info} />
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground">{value}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                      <ChartPieIcon className="h-4 w-4" /> Expense Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={pieChartConfig} className="h-[200px]">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} className="stroke-background" strokeWidth={2} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(Number(v))} />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                      {pieData.map(e => (
                        <div key={e.name} className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-full border border-border/50">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.fill }} />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">{e.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                      <CurrencyDollarIcon className="h-4 w-4" /> Finance Outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={barChartConfig} className="h-[200px]">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} fontWeight="bold"
                          tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0) + "k" : v}`}
                        />
                        <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />} cursor={{ fill: "hsl(var(--muted)/.3)" }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                          {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* P&L Statement */}
              <Card className="bg-card/50 overflow-hidden">
                <CardHeader className="bg-muted/10 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/70">Simulated P&L Statement</CardTitle>
                    <KpiInfo description="A complete fiscal breakdown including COGS, Ad Spend, and estimated Net Profitability." />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-sm font-medium text-foreground">Revenue ({units} units @ {formatCurrency(price)})</span>
                    <span className="font-black text-green-600 dark:text-green-400">
                      <NumberFlow value={isMounted ? totalRevenue : 0} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-sm font-medium text-foreground">Total COGS ({units} units @ {formatCurrency(cogsPerUnit)})</span>
                    <span className="font-black text-red-500/80">
                      -<NumberFlow value={isMounted ? totalCogs : 0} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-primary/10 px-3 rounded-lg border border-primary/20">
                    <span className="text-sm font-black text-primary uppercase">Gross Profit</span>
                    <span className="font-black text-primary text-lg">
                      <NumberFlow value={isMounted ? grossProfit : 0} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
                    </span>
                  </div>

                  <div className="space-y-1.5 px-1">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Ad Spend
                      </span>
                      <span className="text-sm font-bold text-red-400">-{formatCurrency(adSpend)}</span>
                    </div>
                    {expenses.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center py-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> {exp.name || "Unnamed"}
                        </span>
                        <span className="text-sm font-bold text-red-400">-{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center py-4 mt-2 border-t-2 border-primary/30 bg-primary/5 rounded-xl px-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-foreground">Net Monthly Profit</span>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Final Simulation Result</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn("text-3xl font-black", netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                        <NumberFlow value={isMounted ? netProfit : 0} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
                      </span>
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        <NumberFlow value={isMounted ? netMargin : 0} format={{ maximumFractionDigits: 1 }} />% Margin Performance
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save row */}
              <div className="flex items-center justify-end gap-3">
                {saveMsg && (
                  <span className={cn("text-xs font-bold", saveMsg.includes("failed") ? "text-destructive" : "text-green-600 dark:text-green-400")}>
                    {saveMsg}
                  </span>
                )}
                <Button onClick={handleSave} disabled={saving} className="gap-2 font-bold">
                  <BookmarkIcon className="h-4 w-4" />
                  {saving ? "Saving…" : "Save Simulation"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
