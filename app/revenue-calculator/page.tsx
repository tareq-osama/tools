'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { IconPlus, IconX } from '@tabler/icons-react'

interface Offering {
  id: string
  name: string
  price: number
}

export default function RevenueCalculator() {
  const [annualGoal, setAnnualGoal] = useState<number>(0)
  const [yearly, setYearly] = useState<number>(0)
  const [monthly, setMonthly] = useState<number>(0)
  const [weekly, setWeekly] = useState<number>(0)
  const [daily, setDaily] = useState<number>(0)
  const [hourly, setHourly] = useState<number>(0)

  const [products, setProducts] = useState<Offering[]>([
    { id: '1', name: 'Product 1', price: 0 },
    { id: '2', name: 'Product 2', price: 0 },
    { id: '3', name: 'Product 3', price: 0 },
  ])

  const [services, setServices] = useState<Offering[]>([
    { id: '1', name: 'Service 1', price: 0 },
    { id: '2', name: 'Service 2', price: 0 },
    { id: '3', name: 'Service 3', price: 0 },
  ])

  const [productCounter, setProductCounter] = useState(3)
  const [serviceCounter, setServiceCounter] = useState(3)

  // Format number with commas for display
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }

  const formatInteger = (num: number) => {
    return Math.ceil(num).toLocaleString('en-US')
  }

  // Format number for input field (with commas)
  const formatInputValue = (num: number) => {
    if (num === 0) return ''
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }

  // Parse formatted string to number
  const parseFormattedNumber = (value: string): number => {
    const cleanValue = value.replace(/,/g, '')
    const parsed = parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
  }

  // Handle input change with formatting
  const handleNumberInput = (value: string, callback: (num: number) => void) => {
    const numValue = parseFormattedNumber(value)
    callback(numValue)
  }

  const calculateFromAnnual = (value: number) => {
    setAnnualGoal(value)
    setYearly(value)
    setMonthly(value / 12)
    setWeekly(value / 52)
    setDaily(value / 365)
    setHourly(value / (52 * 5 * 8))
  }

  const calculateFromYearly = (value: number) => {
    const annual = value
    setAnnualGoal(annual)
    setYearly(value)
    setMonthly(annual / 12)
    setWeekly(annual / 52)
    setDaily(annual / 365)
    setHourly(annual / (52 * 5 * 8))
  }

  const calculateFromMonthly = (value: number) => {
    const annual = value * 12
    setAnnualGoal(annual)
    setYearly(annual)
    setMonthly(value)
    setWeekly(annual / 52)
    setDaily(annual / 365)
    setHourly(annual / (52 * 5 * 8))
  }

  const calculateFromWeekly = (value: number) => {
    const annual = value * 52
    setAnnualGoal(annual)
    setYearly(annual)
    setMonthly(annual / 12)
    setWeekly(value)
    setDaily(annual / 365)
    setHourly(annual / (52 * 5 * 8))
  }

  const calculateSalesNeeded = (price: number, timeframe: 'yearly' | 'monthly') => {
    if (price <= 0) return 0
    if (timeframe === 'yearly') {
      return annualGoal / price
    } else {
      return (annualGoal / 12) / price
    }
  }

  const addProduct = () => {
    const newCounter = productCounter + 1
    setProducts([...products, { id: String(Date.now()), name: `Product ${newCounter}`, price: 0 }])
    setProductCounter(newCounter)
  }

  const addService = () => {
    const newCounter = serviceCounter + 1
    setServices([...services, { id: String(Date.now()), name: `Service ${newCounter}`, price: 0 }])
    setServiceCounter(newCounter)
  }

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const updateProductPrice = (id: string, price: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, price } : p))
  }

  const updateServicePrice = (id: string, price: number) => {
    setServices(services.map(s => s.id === id ? { ...s, price } : s))
  }

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
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold tracking-tight">Revenue Calculator</h1>
                  <p className="text-sm text-muted-foreground">Calculate your revenue goals and track what you need to sell</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Revenue Calculator Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="annual">Annual Goal</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="annual"
                      type="text"
                      inputMode="decimal"
                      className="pl-7"
                      placeholder="1,000,000"
                      value={formatInputValue(annualGoal)}
                      onChange={(e) => handleNumberInput(e.target.value, calculateFromAnnual)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <div className="text-sm font-medium">Yearly</div>
                    </div>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="pl-7 h-9 text-right"
                        placeholder="0"
                        value={formatInputValue(yearly)}
                        onChange={(e) => handleNumberInput(e.target.value, calculateFromYearly)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <div className="text-sm font-medium">Monthly</div>
                      <div className="text-xs text-muted-foreground">12 months</div>
                    </div>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="pl-7 h-9 text-right"
                        placeholder="0"
                        value={formatInputValue(monthly)}
                        onChange={(e) => handleNumberInput(e.target.value, calculateFromMonthly)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <div className="text-sm font-medium">Weekly</div>
                      <div className="text-xs text-muted-foreground">52 weeks</div>
                    </div>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="pl-7 h-9 text-right"
                        placeholder="0"
                        value={formatInputValue(weekly)}
                        onChange={(e) => handleNumberInput(e.target.value, calculateFromWeekly)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <div className="text-sm font-medium">Daily</div>
                      <div className="text-xs text-muted-foreground">365 days</div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">${formatNumber(daily)}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <div className="text-sm font-medium">Hourly</div>
                      <div className="text-xs text-muted-foreground">8h/day, 5d/week</div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">${formatNumber(hourly)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="relative p-3 rounded-lg border bg-card">
                    {products.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeProduct(product.id)}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex items-center justify-between gap-2 mb-3 pr-6">
                      <span className="text-sm font-medium text-muted-foreground">{product.name}</span>
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="pl-7 h-9"
                          placeholder="0"
                          value={formatInputValue(product.price)}
                          onChange={(e) => handleNumberInput(e.target.value, (val) => updateProductPrice(product.id, val))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Yearly sales</span>
                      <span className="text-sm font-medium text-primary tabular-nums">
                        {formatInteger(calculateSalesNeeded(product.price, 'yearly'))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Monthly sales</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-500 tabular-nums">
                        {formatInteger(calculateSalesNeeded(product.price, 'monthly'))}
                      </span>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={addProduct}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>

            {/* Services Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="relative p-3 rounded-lg border bg-card">
                    {services.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeService(service.id)}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex items-center justify-between gap-2 mb-3 pr-6">
                      <span className="text-sm font-medium text-muted-foreground">{service.name}</span>
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="pl-7 h-9"
                          placeholder="0"
                          value={formatInputValue(service.price)}
                          onChange={(e) => handleNumberInput(e.target.value, (val) => updateServicePrice(service.id, val))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Yearly sales</span>
                      <span className="text-sm font-medium text-primary tabular-nums">
                        {formatInteger(calculateSalesNeeded(service.price, 'yearly'))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Monthly sales</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-500 tabular-nums">
                        {formatInteger(calculateSalesNeeded(service.price, 'monthly'))}
                      </span>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={addService}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </CardContent>
            </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
