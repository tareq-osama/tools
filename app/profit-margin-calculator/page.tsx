"use client";

import * as React from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@heroicons/react/24/outline";
import { KpiInfo } from "@/components/kpi-info";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const STORAGE_KEY = "profit-margin-v1";

interface Expense {
  id: string;
  name: string;
  amount: number;
}

const pieChartConfig = {
  COGS: { label: "COGS", color: "#f87171" },
  "Ad Spend": { label: "Ad Spend", color: "#3b82f6" },
  OpEx: { label: "OpEx", color: "#fb923c" },
  "Net Profit": { label: "Net Profit", color: "#4ade80" },
} satisfies ChartConfig;

const barChartConfig = { value: { label: "Amount" } } satisfies ChartConfig;

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
}: {
  label: string;
  id?: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  className?: string;
  inline?: boolean;
}) {
  return (
    <Field
      className={cn(
        className,
        inline && "flex-row items-center justify-between gap-4",
      )}
    >
      <FieldLabel
        htmlFor={id}
        className={cn(
          "text-[10px] font-black uppercase tracking-widest text-muted-foreground/80",
          inline && "mb-0",
        )}
      >
        {label}
      </FieldLabel>
      <InputGroup
        className={cn(
          "hover:border-primary/40 transition-colors",
          inline ? "w-44" : "w-full",
        )}
      >
        {prefix && (
          <InputGroupAddon
            align="inline-start"
            className="bg-muted/30 border-r px-2.5"
          >
            <InputGroupText className="font-bold text-[10px]">
              {prefix}
            </InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          type="number"
          className="text-center font-bold text-xs"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
        />
        {suffix && (
          <InputGroupAddon
            align="inline-end"
            className="bg-muted/30 border-l px-2.5"
          >
            <InputGroupText className="font-bold text-[10px]">
              {suffix}
            </InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupAddon
          align="inline-end"
          className="p-0 border-l overflow-hidden bg-muted/10 h-full"
        >
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
  );
}

export default function ProfitMarginCalculator() {
  const [price, setPrice] = React.useState(100);
  const [units, setUnits] = React.useState(50);
  const [cogsPerUnit, setCogsPerUnit] = React.useState(40);
  const [adSpend, setAdSpend] = React.useState(500);
  const [expenses, setExpenses] = React.useState<Expense[]>([
    { id: "1", name: "Rent", amount: 1000 },
    { id: "2", name: "Software", amount: 200 },
  ]);
  const [showCE, setShowCE] = React.useState(false);
  const [ceVisitors, setCeVisitors] = React.useState(5000);
  const [ceConvRate, setCeConvRate] = React.useState(2.5);
  const [isMounted, setIsMounted] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.price !== undefined) setPrice(d.price);
        if (d.units !== undefined) setUnits(d.units);
        if (d.cogsPerUnit !== undefined) setCogsPerUnit(d.cogsPerUnit);
        if (d.adSpend !== undefined) setAdSpend(d.adSpend);
        if (d.expenses !== undefined) setExpenses(d.expenses);
        if (d.ceVisitors !== undefined) setCeVisitors(d.ceVisitors);
        if (d.ceConvRate !== undefined) setCeConvRate(d.ceConvRate);
      }
    } catch {}
    setIsMounted(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        price,
        units,
        cogsPerUnit,
        adSpend,
        expenses,
        ceVisitors,
        ceConvRate,
      }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Calculations
  const totalRevenue = price * units;
  const totalCogs = cogsPerUnit * units;
  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalOtherExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalOtherExpenses + adSpend;
  const netProfit = grossProfit - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const roas = adSpend > 0 ? totalRevenue / adSpend : 0;
  const cac = units > 0 ? adSpend / units : 0;
  const roi =
    totalCogs + totalExpenses > 0
      ? (netProfit / (totalCogs + totalExpenses)) * 100
      : 0;

  const ceConversions = (ceVisitors * ceConvRate) / 100;
  const ceRevenue = ceConversions * price;
  const ceCac = adSpend > 0 && ceConversions > 0 ? adSpend / ceConversions : 0;
  const ceLtvCac = ceCac > 0 ? (price * 3) / ceCac : 0;

  const addExpense = () =>
    setExpenses([
      ...expenses,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "New Expense",
        amount: 0,
      },
    ]);

  const updateExpense = (
    id: string,
    field: keyof Expense,
    value: string | number,
  ) =>
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );

  const removeExpense = (id: string) =>
    setExpenses(expenses.filter((e) => e.id !== id));

  const chartData = [
    { name: "Revenue", value: totalRevenue, color: "hsl(var(--primary))" },
    { name: "COGS", value: totalCogs, color: "#f87171" },
    { name: "Expenses", value: totalExpenses, color: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), color: "#4ade80" },
  ];

  const pieData = [
    { name: "COGS", value: totalCogs, fill: "#f87171" },
    { name: "Ad Spend", value: adSpend, fill: "#3b82f6" },
    { name: "OpEx", value: totalOtherExpenses, fill: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), fill: "#4ade80" },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

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
        <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full pb-16">
          <div className="flex flex-col gap-2 pb-4 border-b">
            <h1 className="text-2xl font-bold tracking-tight">
              Profit Margin Calculator
            </h1>
            <p className="text-xs text-muted-foreground">
              Analyze business performance with real-time KPI calculations and
              expense tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inputs */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BriefcaseIcon className="h-4 w-4 text-primary" /> Product &
                    Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-5">
                    <NumericField
                      label="Sale Price per Unit"
                      id="price"
                      value={price}
                      onChange={setPrice}
                      prefix="$"
                    />
                    <NumericField
                      label="Units Sold"
                      id="units"
                      value={units}
                      onChange={setUnits}
                      step={10}
                    />
                    <NumericField
                      label="Cost per Unit (COGS)"
                      id="cogs"
                      value={cogsPerUnit}
                      onChange={setCogsPerUnit}
                      prefix="$"
                    />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ReceiptPercentIcon className="h-4 w-4 text-primary" />{" "}
                    Operating Expenses
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={addExpense}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <NumericField
                    label="Monthly Ad Spend"
                    id="adSpend"
                    value={adSpend}
                    onChange={setAdSpend}
                    prefix="$"
                    step={100}
                  />
                  {expenses.length > 0 && (
                    <div className="pt-4 border-t space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Custom Overheads
                      </p>
                      {expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex flex-col gap-2 p-2 rounded-lg border bg-muted/10"
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Expense name"
                              className="flex-1 h-8 text-xs bg-background"
                              value={expense.name}
                              onChange={(e) =>
                                updateExpense(
                                  expense.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-destructive/70 hover:text-destructive transition-colors"
                              onClick={() => removeExpense(expense.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          <InputGroup className="h-8 bg-background">
                            <InputGroupAddon
                              align="inline-start"
                              className="bg-muted/30 border-r px-2"
                            >
                              <InputGroupText className="text-[10px] font-bold">
                                $
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              type="number"
                              className="text-xs text-center px-1"
                              value={expense.amount}
                              onChange={(e) =>
                                updateExpense(
                                  expense.id,
                                  "amount",
                                  Number(e.target.value),
                                )
                              }
                            />
                            <InputGroupAddon
                              align="inline-end"
                              className="p-0 border-l overflow-hidden bg-muted/10 h-full"
                            >
                              <InputGroupButton
                                onClick={() =>
                                  updateExpense(
                                    expense.id,
                                    "amount",
                                    Math.max(0, expense.amount - 100),
                                  )
                                }
                                className="h-full rounded-none border-r w-7 shrink-0"
                              >
                                <MinusIcon className="h-2.5 w-2.5" />
                              </InputGroupButton>
                              <InputGroupButton
                                onClick={() =>
                                  updateExpense(
                                    expense.id,
                                    "amount",
                                    expense.amount + 100,
                                  )
                                }
                                className="h-full rounded-none w-7 shrink-0"
                              >
                                <PlusIcon className="h-2.5 w-2.5" />
                              </InputGroupButton>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                variant={showCE ? "secondary" : "outline"}
                size="sm"
                className="w-full gap-2 text-xs font-bold uppercase tracking-wide"
                onClick={() => setShowCE((v) => !v)}
              >
                <CursorArrowRaysIcon className="h-4 w-4" />
                {showCE ? "Hide Conversion Engine" : "Add Conversion Engine"}
              </Button>

              {showCE && (
                <Card className="border-dashed border-primary/40 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FunnelIcon className="h-4 w-4 text-primary" /> Conversion
                      Engine
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      Uses sale price as AOV. Ad spend is shared.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <FieldGroup className="gap-4">
                      <NumericField
                        label="Monthly Visitors"
                        value={ceVisitors}
                        onChange={setCeVisitors}
                        step={500}
                      />
                      <NumericField
                        label="Conversion Rate"
                        value={ceConvRate}
                        onChange={setCeConvRate}
                        suffix="%"
                        step={0.1}
                      />
                    </FieldGroup>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      {[
                        {
                          label: "Conversions",
                          value: Math.round(ceConversions).toLocaleString(),
                        },
                        {
                          label: "CE Revenue",
                          value: formatCurrency(ceRevenue),
                        },
                        { label: "CAC", value: formatCurrency(ceCac) },
                        { label: "LTV:CAC", value: `${ceLtvCac.toFixed(1)}x` },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="rounded-xl bg-background border p-3 border-primary/10 shadow-sm"
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                            {label}
                          </p>
                          <p className="text-sm font-black mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-bold uppercase tracking-wide">
                        Total Revenue
                      </CardDescription>
                      <KpiInfo description="Total dollar amount of products or services sold." />
                    </div>
                    <CardTitle className="text-2xl font-black">
                      <NumberFlow
                        value={totalRevenue}
                        format={{
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }}
                      />
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card
                  className={cn(
                    "border-primary/20 shadow-sm",
                    netProfit >= 0 ? "bg-green-500/5" : "bg-red-500/5",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-bold uppercase tracking-wide italic">
                        Net Profit
                      </CardDescription>
                      <KpiInfo description="Take-home earnings after COGS, Ad Spend, and overheads." />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle
                        className={cn(
                          "text-3xl font-black",
                          netProfit >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        <NumberFlow
                          value={netProfit}
                          format={{
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }}
                        />
                      </CardTitle>
                      {netProfit >= 0 ? (
                        <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </CardHeader>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-bold uppercase tracking-wide">
                        Net Margin
                      </CardDescription>
                      <KpiInfo description="Percentage of revenue that is actual profit after all expenses." />
                    </div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-2xl font-black">
                        <NumberFlow value={Number(netMargin.toFixed(1))} />%
                      </CardTitle>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-700",
                            netMargin > 30
                              ? "bg-green-500"
                              : netMargin > 10
                                ? "bg-blue-500"
                                : "bg-yellow-500",
                          )}
                          style={{
                            width: `${Math.min(100, Math.max(0, netMargin))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: <MegaphoneIcon className="h-3 w-3" />,
                    label: "ROAS",
                    value: `${roas.toFixed(2)}x`,
                    info: "Revenue for every dollar spent on ads.",
                  },
                  {
                    icon: <UsersIcon className="h-3 w-3" />,
                    label: "CAC",
                    value: formatCurrency(cac),
                    info: "Marketing spend ÷ units sold.",
                  },
                  {
                    icon: <ArrowTrendingUpIcon className="h-3 w-3" />,
                    label: "ROI",
                    value: `${roi.toFixed(1)}%`,
                    info: "Profitability relative to total spend.",
                  },
                  {
                    icon: <ArrowRightIcon className="h-3 w-3" />,
                    label: "Gross Margin",
                    value: `${grossMargin.toFixed(1)}%`,
                    info: "Revenue exceeding COGS.",
                  },
                ].map(({ icon, label, value, info }) => (
                  <Card
                    key={label}
                    className="hover:border-primary/30 transition-colors bg-card/50"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between w-full mb-1">
                        <CardDescription className="text-[10px] uppercase font-bold flex items-center gap-1">
                          {icon} {label}
                        </CardDescription>
                        <KpiInfo description={info} />
                      </div>
                      <CardTitle className="text-lg font-bold">
                        {value}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                      <ChartPieIcon className="h-4 w-4" /> Expense Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={pieChartConfig}
                      className="h-[200px]"
                    >
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={entry.fill}
                              className="stroke-background"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              formatter={(v) => formatCurrency(Number(v))}
                            />
                          }
                        />
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                      {pieData.map((e) => (
                        <div
                          key={e.name}
                          className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-full border border-border/50"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: e.fill }}
                          />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">
                            {e.name}
                          </span>
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
                    <ChartContainer
                      config={barChartConfig}
                      className="h-[200px]"
                    >
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="name"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          fontWeight="bold"
                        />
                        <YAxis
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          fontWeight="bold"
                          tickFormatter={(v) =>
                            `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                          }
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(v) => formatCurrency(Number(v))}
                            />
                          }
                          cursor={{ fill: "hsl(var(--muted)/.3)" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                          {chartData.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* P&L */}
              <Card className="bg-card/40 border-primary/10 overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/5 border-b py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                      Fiscal P&L Simulation Report
                    </CardTitle>
                    <div className="bg-muted/20 text-[10px] font-bold px-2 py-0.5 rounded border border-border/50 text-muted-foreground uppercase">
                      {new Date().toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black uppercase tracking-tight">
                          Gross Revenue
                        </span>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {units.toLocaleString()} units at{" "}
                          {formatCurrency(price)}/ea
                        </p>
                      </div>
                      <span className="text-xl font-black text-green-600 dark:text-green-400 tabular-nums">
                        <NumberFlow
                          value={isMounted ? totalRevenue : 0}
                          format={{
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }}
                        />
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-muted/50 via-border to-muted/50" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div className="space-y-0.5">
                        <span className="text-sm font-black uppercase tracking-tight">
                          Direct Costs (COGS)
                        </span>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          @ {formatCurrency(cogsPerUnit)}/unit
                        </p>
                      </div>
                      <span className="text-lg font-black text-red-500/80 tabular-nums">
                        -
                        <NumberFlow
                          value={isMounted ? totalCogs : 0}
                          format={{
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }}
                        />
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-primary/10 px-4 rounded-xl border border-primary/20 shadow-inner">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">
                        Gross Profit
                      </span>
                      <span className="font-black text-primary text-2xl tabular-nums">
                        <NumberFlow
                          value={isMounted ? grossProfit : 0}
                          format={{
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          }}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Operating Expenditures (OpEx)
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />{" "}
                          Digital Marketing (Ad Spend)
                        </span>
                        <span className="font-black text-red-400 tabular-nums">
                          -{formatCurrency(adSpend)}
                        </span>
                      </div>
                      {expenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />{" "}
                            {exp.name || "Fixed Expense"}
                          </span>
                          <span className="font-black text-red-400 tabular-nums">
                            -{formatCurrency(exp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t-2 border-dashed border-border/50">
                    <div className="flex justify-between items-center bg-foreground text-background p-6 rounded-2xl shadow-xl">
                      <div className="flex flex-col gap-1">
                        <span className="text-2xl font-black tracking-tighter uppercase italic">
                          Net Monthly Profit
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-background/60 uppercase tracking-[0.2em]">
                            {netProfit >= 0
                              ? "Profitable Strategy"
                              : "Budget Optimization Needed"}
                          </span>
                          {roas > 0 && (
                            <span className="bg-background/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                              {roas.toFixed(1)}x ROAS
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "text-4xl font-black tabular-nums tracking-tighter",
                            netProfit >= 0 ? "text-green-400" : "text-red-400",
                          )}
                        >
                          <NumberFlow
                            value={isMounted ? netProfit : 0}
                            format={{
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }}
                          />
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-background/80 mt-1">
                          <NumberFlow
                            value={isMounted ? netMargin : 0}
                            format={{ maximumFractionDigits: 1 }}
                          />
                          % Net Margin
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="text-xs font-bold uppercase tracking-[0.15em] h-10 border-foreground/20 hover:bg-foreground hover:text-background transition-all"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  {saved ? "Saved ✓" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
