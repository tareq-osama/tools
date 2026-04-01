'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { KpiInfo } from '@/components/kpi-info'
import { 
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { 
  PlusIcon, 
  MinusIcon,
  XMarkIcon, 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowPathIcon,
  ShoppingBagIcon,
  ChartPieIcon,
  CircleStackIcon
} from '@heroicons/react/24/solid'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
} from 'recharts'
import NumberFlow from '@number-flow/react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface Offering {
  id: string
  name: string
  price: number
  quantity?: number
  type: 'one-time' | 'recurring'
}

export default function RevenueCalculator() {
  const [annualGoal, setAnnualGoal] = React.useState<number>(500000)
  const [churnRate, setChurnRate] = React.useState<number>(5)

  // Entrance Animation
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  
  const [offerings, setOfferings] = React.useState<Offering[]>([
    { id: '1', name: 'Starter Plan', price: 49, quantity: 200, type: 'recurring' },
    { id: '2', name: 'Pro Plan', price: 149, quantity: 100, type: 'recurring' },
    { id: '3', name: 'Consulting', price: 2500, quantity: 10, type: 'one-time' },
  ])

  // Calculations
  const mrr = offerings
    .filter(o => o.type === 'recurring')
    .reduce((acc, o) => acc + (o.price * (o.quantity || 0)), 0)
  
  const oneTimeRev = offerings
    .filter(o => o.type === 'one-time')
    .reduce((acc, o) => acc + (o.price * (o.quantity || 0)), 0)

  const arr = mrr * 12 * (1 - churnRate / 100)
  const totalProjectedRevenue = arr + oneTimeRev
  const progressPercent = Math.min((totalProjectedRevenue / annualGoal) * 100, 100)

  const chartData = offerings.map(o => ({
    id: o.id,
    name: o.name,
    value: o.type === 'recurring' ? o.price * (o.quantity || 0) * 12 : o.price * (o.quantity || 0),
    type: o.type
  }))

  const COLORS = ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9']

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  const addOffering = (type: 'one-time' | 'recurring') => {
    const newId = Math.random().toString(36).substr(2, 9)
    setOfferings([...offerings, { 
      id: newId, 
      name: `New ${type === 'recurring' ? 'Subscription' : 'Service'}`, 
      price: 0, 
      quantity: 0, 
      type 
    }])
  }

  const removeOffering = (id: string) => {
    setOfferings(offerings.filter(o => o.id !== id))
  }

  const updateOffering = (id: string, updates: Partial<Offering>) => {
    setOfferings(offerings.map(o => o.id === id ? { ...o, ...updates } : o))
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Revenue Strategist</h1>
            <p className="text-xs text-muted-foreground">Engineer your fiscal goals with simple revenue modeling.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="shadow-none border border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">Goal Progress</CardDescription>
                  <KpiInfo description="Measures how close your current projected revenue is to your annual goal." />
                </div>
                <div className="space-y-3">
                  <InputGroup className="border-none shadow-none h-8 pr-1">
                    <InputGroupAddon className="pl-0 border-none">
                      <InputGroupText className="font-bold text-muted-foreground text-sm">$</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput 
                      type="number" 
                      className="text-xl font-bold px-0 h-8" 
                      value={annualGoal} 
                      onChange={(e) => setAnnualGoal(Number(e.target.value))} 
                    />
                    <InputGroupAddon align="inline-end" className="p-0 border-none overflow-hidden">
                      <InputGroupButton onClick={() => setAnnualGoal(Math.max(0, annualGoal - 10000))} className="h-full rounded-none border-r w-8 shrink-0 hover:bg-muted/50"><MinusIcon className="h-3 w-3" /></InputGroupButton>
                      <InputGroupButton onClick={() => setAnnualGoal(annualGoal + 10000)} className="h-full rounded-none w-8 shrink-0 hover:bg-muted/50"><PlusIcon className="h-3 w-3" /></InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div className="bg-foreground h-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-none border border-border bg-muted/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">Projected ARR</CardDescription>
                  <KpiInfo description="Projected Annual Recurring Revenue, taking into account churn and one-time sales." />
                </div>
                <CardTitle className="text-2xl font-bold">
                  <NumberFlow 
                    value={isMounted ? totalProjectedRevenue : 0} 
                    format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                  />
                </CardTitle>
                <p className="text-[10px] font-bold tracking-tight uppercase text-muted-foreground">Incl. {churnRate}% Churn</p>
              </CardHeader>
            </Card>

            <Card className="shadow-none border border-border ">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">Goal Variance</CardDescription>
                  <KpiInfo description="The dollar difference between your target annual goal and your current projected ARR." />
                </div>
                <CardTitle className="text-2xl font-bold">
                   <NumberFlow 
                     value={isMounted ? annualGoal - totalProjectedRevenue : 0} 
                     format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                   />
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="shadow-none border border-border ">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest ">MRR</CardDescription>
                  <KpiInfo description="Monthly Recurring Revenue. The total predictable revenue generated from subscriptions each month." />
                </div>
                <CardTitle className="text-2xl font-bold">
                  <NumberFlow 
                    value={isMounted ? mrr : 0} 
                    format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                  />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-none border border-border overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-4 px-6">
                   <CardTitle className="text-sm font-bold uppercase tracking-widest italic text-muted-foreground">Revenue Mix</CardTitle>
                   <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest" onClick={() => addOffering('recurring')}>
                        Add Subscription
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest" onClick={() => addOffering('one-time')}>
                        Add Product
                      </Button>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y border-t border-border">
                     {offerings.map((o) => (
                       <div key={o.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                         <div className="flex-1 w-full space-y-4">
                           <div className="flex items-center gap-3">
                              <span className="p-1 px-2 text-[10px] font-bold uppercase tracking-tighter bg-muted rounded">
                                {o.type}
                              </span>
                              <InputGroup className="flex-1 border-none shadow-none h-7 pr-1">
                                <InputGroupInput 
                                  className="font-bold px-0 text-sm h-7" 
                                  value={o.name} 
                                  onChange={(e) => updateOffering(o.id, { name: e.target.value })} 
                                />
                              </InputGroup>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Price</Label>
                                <InputGroup className="h-7 pr-0 overflow-hidden">
                                  <InputGroupAddon className="bg-muted/50 border-r px-1.5">
                                    <InputGroupText className="text-[10px]">$</InputGroupText>
                                  </InputGroupAddon>
                                  <InputGroupInput type="number" className="h-7 text-xs font-mono text-center px-1" value={o.price} onChange={(e) => updateOffering(o.id, { price: Number(e.target.value) })} />
                                  <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                                    <InputGroupButton onClick={() => updateOffering(o.id, { price: Math.max(0, o.price - 10) })} className="h-full rounded-none border-r w-7 shrink-0"><MinusIcon className="h-2 w-2" /></InputGroupButton>
                                    <InputGroupButton onClick={() => updateOffering(o.id, { price: o.price + 10 })} className="h-full rounded-none w-7 shrink-0"><PlusIcon className="h-2 w-2" /></InputGroupButton>
                                  </InputGroupAddon>
                                </InputGroup>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Vol.</Label>
                                <InputGroup className="h-7 pr-0 overflow-hidden">
                                  <InputGroupInput type="number" className="h-7 text-xs font-mono text-center px-1" value={o.quantity} onChange={(e) => updateOffering(o.id, { quantity: Number(e.target.value) })} />
                                  <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden">
                                    <InputGroupButton onClick={() => updateOffering(o.id, { quantity: Math.max(0, (o.quantity || 0) - 1) })} className="h-full rounded-none border-r w-7 shrink-0"><MinusIcon className="h-2 w-2" /></InputGroupButton>
                                    <InputGroupButton onClick={() => updateOffering(o.id, { quantity: (o.quantity || 0) + 1 })} className="h-full rounded-none w-7 shrink-0"><PlusIcon className="h-2 w-2" /></InputGroupButton>
                                  </InputGroupAddon>
                                </InputGroup>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground opacity-50">Annualized</Label>
                                <div className="h-7 flex items-center font-bold text-xs">
                                  <NumberFlow 
                                    value={o.type === 'recurring' ? o.price * (o.quantity || 0) * 12 : o.price * (o.quantity || 0)} 
                                    format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} 
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500 transition-colors" onClick={() => removeOffering(o.id)}>
                                  <XMarkIcon className="h-4 w-4" />
                                </Button>
                              </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase italic text-muted-foreground">Revenue Churn Rate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-muted-foreground">
                            <span>Negative Growth Factor (%)</span>
                            <span className="text-foreground">{churnRate}%</span>
                        </div>
                        <Slider min={0} max={50} step={0.5} value={[churnRate]} onValueChange={([val]: number[]) => setChurnRate(val)} />
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="shadow-none border border-border h-fit">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase italic text-muted-foreground">Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto pr-2 space-y-2">
                    {chartData.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between text-[10px] font-bold tracking-tight">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-muted-foreground truncate max-w-[100px] uppercase font-bold">{entry.name}</span>
                        </div>
                        <span className="text-muted-foreground"><NumberFlow value={Number(((entry.value / totalProjectedRevenue) * 100).toFixed(1))} />%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border border-border h-fit bg-muted/10 italic">
                <CardHeader className="py-4 border-b">
                   <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Velocity Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-between items-center text-[10px] font-bold pb-2 border-b">
                    <span className="text-muted-foreground uppercase opacity-50">Monthly</span>
                    <span className="text-foreground"><NumberFlow value={annualGoal / 12} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} /></span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold pb-2 border-b">
                    <span className="text-muted-foreground uppercase opacity-50">Weekly</span>
                    <span className="text-foreground"><NumberFlow value={annualGoal / 52} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} /></span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase opacity-50">Daily</span>
                    <span className="text-foreground"><NumberFlow value={annualGoal / 365} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} /></span>
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
