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
import { 
  IconPlus, 
  IconTrash, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconTarget,
  IconReceipt,
  IconBriefcase,
  IconAd,
  IconUsers,
  IconChartPie,
  IconCurrencyDollar,
  IconArrowRight
} from "@tabler/icons-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts"
import { cn } from "@/lib/utils"

interface Expense {
  id: string
  name: string
  amount: number
}

export default function ProfitMarginCalculator() {
  const [price, setPrice] = React.useState<number>(100)
  const [units, setUnits] = React.useState<number>(50)
  const [cogsPerUnit, setCogsPerUnit] = React.useState<number>(40)
  const [adSpend, setAdSpend] = React.useState<number>(500)
  const [expenses, setExpenses] = React.useState<Expense[]>([
    { id: "1", name: "Rent", amount: 1000 },
    { id: "2", name: "Software", amount: 200 },
  ])

  const totalRevenue = price * units
  const totalCogs = cogsPerUnit * units
  const grossProfit = totalRevenue - totalCogs
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  
  const totalOtherExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalExpenses = totalOtherExpenses + adSpend
  
  const netProfit = grossProfit - totalExpenses
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  
  const roas = adSpend > 0 ? totalRevenue / adSpend : 0
  const cac = units > 0 ? adSpend / units : 0
  const roi = (totalCogs + totalExpenses) > 0 ? (netProfit / (totalCogs + totalExpenses)) * 100 : 0

  const addExpense = () => {
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Expense",
      amount: 0,
    }
    setExpenses([...expenses, newExpense])
  }

  const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
    setExpenses(
      expenses.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    )
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id))
  }

  const chartData = [
    { name: "Revenue", value: totalRevenue, color: "hsl(var(--primary))" },
    { name: "COGS", value: totalCogs, color: "#f87171" },
    { name: "Expenses", value: totalExpenses, color: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), color: "#4ade80" },
  ]

  const pieData = [
    { name: "COGS", value: totalCogs, fill: "#f87171" },
    { name: "Ad Spend", value: adSpend, fill: "#3b82f6" },
    { name: "OpEx", value: totalOtherExpenses, fill: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), fill: "#4ade80" },
  ]

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

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
        <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Profit Margin Calculator</h1>
            <p className="text-muted-foreground">
              Analyze your business performance with real-time KPI calculations and expense tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inputs Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconBriefcase className="h-4 w-4 text-primary" />
                    Product & Sales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Sale Price per Unit</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input 
                        id="price" 
                        type="number" 
                        className="pl-7" 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units Sold</Label>
                    <Input 
                      id="units" 
                      type="number" 
                      value={units} 
                      onChange={(e) => setUnits(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cogs">Cost per Unit (COGS)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input 
                        id="cogs" 
                        type="number" 
                        className="pl-7" 
                        value={cogsPerUnit} 
                        onChange={(e) => setCogsPerUnit(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <IconReceipt className="h-4 w-4 text-primary" />
                    Operating Expenses
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addExpense}>
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adSpend">Monthly Ad Spend</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input 
                        id="adSpend" 
                        type="number" 
                        className="pl-7" 
                        value={adSpend} 
                        onChange={(e) => setAdSpend(Number(e.target.value))} 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center gap-2">
                        <Input 
                          placeholder="Expense name" 
                          className="flex-1" 
                          value={expense.name}
                          onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                        />
                        <div className="relative w-24">
                          <span className="absolute left-2 top-2.5 text-muted-foreground text-xs">$</span>
                          <Input 
                            type="number" 
                            className="pl-5 text-sm" 
                            value={expense.amount}
                            onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive"
                          onClick={() => removeExpense(expense.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {expenses.length === 0 && (
                      <p className="text-xs text-center text-muted-foreground py-2">No additional expenses added.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-2xl font-bold">{formatCurrency(totalRevenue)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className={cn(
                  "border-primary/20",
                  netProfit >= 0 ? "bg-green-50/50 dark:bg-green-950/20" : "bg-red-50/50 dark:bg-red-950/20"
                )}>
                  <CardHeader className="pb-2">
                    <CardDescription>Net Profit</CardDescription>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl font-bold">{formatCurrency(netProfit)}</CardTitle>
                      {netProfit >= 0 ? (
                        <IconTrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <IconTrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </CardHeader>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardDescription>Net Margin</CardDescription>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl font-bold">{netMargin.toFixed(1)}%</CardTitle>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            netMargin > 30 ? "bg-green-500" : netMargin > 10 ? "bg-blue-500" : "bg-yellow-500"
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, netMargin))}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Middle KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <IconTarget className="h-3 w-3" /> ROAS
                    </CardDescription>
                    <CardTitle className="text-lg">{roas.toFixed(2)}x</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <IconUsers className="h-3 w-3" /> CAC
                    </CardDescription>
                    <CardTitle className="text-lg">{formatCurrency(cac)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <IconTrendingUp className="h-3 w-3" /> ROI
                    </CardDescription>
                    <CardTitle className="text-lg">{roi.toFixed(1)}%</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <IconArrowRight className="h-3 w-3" /> Gross Margin
                    </CardDescription>
                    <CardTitle className="text-lg">{grossMargin.toFixed(1)}%</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconChartPie className="h-4 w-4" />
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                      {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span className="text-[10px] text-muted-foreground">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconCurrencyDollar className="h-4 w-4" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monthly Statement Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">Revenue ({units} units @ {formatCurrency(price)})</span>
                      <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">Total COGS ({units} units @ {formatCurrency(cogsPerUnit)})</span>
                      <span className="font-semibold text-red-500">-{formatCurrency(totalCogs)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-muted/30 px-2 rounded">
                      <span className="text-sm font-bold text-primary">Gross Profit</span>
                      <span className="font-bold text-primary">{formatCurrency(grossProfit)}</span>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground ml-4">Ad Spend</span>
                        <span className="text-sm text-red-400">-{formatCurrency(adSpend)}</span>
                      </div>
                      {expenses.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center py-1">
                          <span className="text-sm text-muted-foreground ml-4">{exp.name || "Unnamed"}</span>
                          <span className="text-sm text-red-400">-{formatCurrency(exp.amount)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center py-4 border-t mt-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold">Net Monthly Profit</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">After All Deductions</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "text-2xl font-bold",
                          netProfit >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(netProfit)}
                        </span>
                        <span className="text-sm font-medium">{netMargin.toFixed(1)}% Margin</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
