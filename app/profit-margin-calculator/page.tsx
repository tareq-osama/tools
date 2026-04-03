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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowDownTrayIcon,
  ScaleIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  TagIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/solid";
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
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
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

const STORAGE_KEY = "profit-margin-v2";

interface Expense {
  id: string;
  name: string;
  amount: number;
}

interface PerUnitCost {
  id: string;
  name: string;
  amount: number;
  isPercent: boolean; // false = fixed $ per unit, true = % of sale price
}

const pieChartConfig = {
  COGS: { label: "COGS", color: "#f87171" },
  "Variable Costs": { label: "Variable Costs", color: "#c084fc" },
  "Ad Spend": { label: "Ad Spend", color: "#3b82f6" },
  OpEx: { label: "OpEx", color: "#fb923c" },
  Tax: { label: "Tax", color: "#94a3b8" },
  "Net Profit": { label: "Net Profit", color: "#4ade80" },
} satisfies ChartConfig;

const barChartConfig = { value: { label: "Amount" } } satisfies ChartConfig;

const scenarioChartConfig = {
  pessimistic: { label: "Pessimistic", color: "#f87171" },
  base: { label: "Base", color: "#60a5fa" },
  optimistic: { label: "Optimistic", color: "#4ade80" },
} satisfies ChartConfig;

// ─────────────────────────────────────────
// Shared NumericField Component
// ─────────────────────────────────────────
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
  description,
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
  description?: string;
}) {
  return (
    <Field
      className={cn(
        className,
        inline && "flex-row items-center justify-between gap-4",
      )}
    >
      <div className={cn("flex flex-col gap-0.5", inline && "mb-0")}>
        <FieldLabel
          htmlFor={id}
          className="text-sm font-semibold text-foreground/90"
        >
          {label}
        </FieldLabel>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
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
            <InputGroupText className="font-semibold text-xs">
              {prefix}
            </InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          type="number"
          className="text-center font-semibold text-sm"
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
            <InputGroupText className="font-semibold text-xs">
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

// ─────────────────────────────────────────
// Section Label
// ─────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider pb-1 border-b mb-3">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────
// KPI Mini Card
// ─────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  info,
  highlight,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  info: string;
  highlight?: "positive" | "negative" | "neutral";
  trend?: number;
}) {
  return (
    <Card className="hover:border-primary/30 transition-colors bg-card/50">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between w-full mb-2">
          <CardDescription className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
            {icon} {label}
          </CardDescription>
          <KpiInfo description={info} />
        </div>
        <CardTitle
          className={cn(
            "text-xl font-bold",
            highlight === "positive" && "text-green-600 dark:text-green-400",
            highlight === "negative" && "text-red-500 dark:text-red-400",
          )}
        >
          {value}
        </CardTitle>
        {trend !== undefined && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {trend >= 0 ? "▲" : "▼"} vs break-even
          </p>
        )}
      </CardHeader>
    </Card>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export default function ProfitMarginCalculator() {
  // ── Core inputs
  const [price, setPrice] = React.useState(100);
  const [units, setUnits] = React.useState(50);
  const [cogsPerUnit, setCogsPerUnit] = React.useState(40);
  const [adSpend, setAdSpend] = React.useState(500);
  const [expenses, setExpenses] = React.useState<Expense[]>([
    { id: "1", name: "Rent", amount: 1000 },
    { id: "2", name: "Software", amount: 200 },
  ]);

  // ── Per-unit variable costs (NEW)
  const [perUnitCosts, setPerUnitCosts] = React.useState<PerUnitCost[]>([
    { id: "pu1", name: "Packaging", amount: 3, isPercent: false },
    { id: "pu2", name: "Payment Processing", amount: 2.9, isPercent: true },
  ]);

  // ── Tax & projections (NEW)
  const [taxRate, setTaxRate] = React.useState(21);
  const [projectionMonths, setProjectionMonths] = React.useState(12);

  // ── Conversion engine
  const [showCE, setShowCE] = React.useState(false);
  const [ceVisitors, setCeVisitors] = React.useState(5000);
  const [ceConvRate, setCeConvRate] = React.useState(2.5);

  // ── Scenario mode (NEW)
  const [showScenarios, setShowScenarios] = React.useState(false);

  // ── UI state
  const [isMounted, setIsMounted] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");

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
        if (d.perUnitCosts !== undefined) setPerUnitCosts(d.perUnitCosts);
        if (d.taxRate !== undefined) setTaxRate(d.taxRate);
        if (d.projectionMonths !== undefined)
          setProjectionMonths(d.projectionMonths);
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
        perUnitCosts,
        taxRate,
        projectionMonths,
        ceVisitors,
        ceConvRate,
      }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─────────────────────────────────────────
  // Core Calculations
  // ─────────────────────────────────────────

  // Per-unit variable cost total
  const totalPerUnitVariableCosts = perUnitCosts.reduce((sum, c) => {
    return sum + (c.isPercent ? (price * c.amount) / 100 : c.amount);
  }, 0);

  const effectiveCogPerUnit = cogsPerUnit + totalPerUnitVariableCosts;
  const totalRevenue = price * units;
  const totalCogs = cogsPerUnit * units;
  const totalVariableCosts = totalPerUnitVariableCosts * units;
  const totalDirectCosts = effectiveCogPerUnit * units;

  const grossProfit = totalRevenue - totalCogs;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const totalOtherExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalFixedExpenses = totalOtherExpenses + adSpend;
  const totalExpenses = totalFixedExpenses + totalVariableCosts;

  const operatingProfit = totalRevenue - totalDirectCosts - totalFixedExpenses;
  const netProfit = operatingProfit; // same as before variable costs were added
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const taxAmount = netProfit > 0 ? netProfit * (taxRate / 100) : 0;
  const afterTaxProfit = netProfit - taxAmount;
  const afterTaxMargin =
    totalRevenue > 0 ? (afterTaxProfit / totalRevenue) * 100 : 0;

  // Unit economics
  const contributionMarginPerUnit = price - effectiveCogPerUnit;
  const contributionMarginRatio =
    price > 0 ? (contributionMarginPerUnit / price) * 100 : 0;

  const roas = adSpend > 0 ? totalRevenue / adSpend : 0;
  const cac = units > 0 ? adSpend / units : 0;
  const roi =
    totalDirectCosts + totalFixedExpenses > 0
      ? (netProfit / (totalDirectCosts + totalFixedExpenses)) * 100
      : 0;

  // Break-even
  const breakEvenUnits =
    contributionMarginPerUnit > 0
      ? Math.ceil(totalFixedExpenses / contributionMarginPerUnit)
      : Infinity;
  const breakEvenRevenue = isFinite(breakEvenUnits)
    ? breakEvenUnits * price
    : Infinity;
  const marginOfSafetyUnits = isFinite(breakEvenUnits)
    ? units - breakEvenUnits
    : 0;
  const marginOfSafetyPct = units > 0 ? (marginOfSafetyUnits / units) * 100 : 0;
  const operatingLeverage = netProfit !== 0 ? grossProfit / netProfit : 0;

  // Projections
  const projectedRevenue = totalRevenue * projectionMonths;
  const projectedNetProfit = netProfit * projectionMonths;
  const projectedAfterTaxProfit = afterTaxProfit * projectionMonths;

  // Payback period (months to recover fixed expenses)
  const paybackMonths =
    afterTaxProfit > 0 ? totalFixedExpenses / afterTaxProfit : Infinity;

  // Conversion engine
  const ceConversions = (ceVisitors * ceConvRate) / 100;
  const ceRevenue = ceConversions * price;
  const ceCac = adSpend > 0 && ceConversions > 0 ? adSpend / ceConversions : 0;
  const ceLtvCac = ceCac > 0 ? (price * 3) / ceCac : 0;

  // Scenarios
  const scenarios = React.useMemo(() => {
    const calc = (priceAdj: number, unitsAdj: number, spendAdj: number) => {
      const p = price * (1 + priceAdj / 100);
      const u = Math.round(units * (1 + unitsAdj / 100));
      const as = adSpend * (1 + spendAdj / 100);
      const rev = p * u;
      const cogs = effectiveCogPerUnit * u;
      const exp = totalOtherExpenses + as;
      const np = rev - cogs - exp;
      const margin = rev > 0 ? (np / rev) * 100 : 0;
      return {
        revenue: rev,
        netProfit: np,
        netMargin: margin,
        units: u,
        price: p,
      };
    };
    return {
      pessimistic: calc(-15, -30, 10),
      base: calc(0, 0, 0),
      optimistic: calc(10, 40, 5),
    };
  }, [price, units, adSpend, effectiveCogPerUnit, totalOtherExpenses]);

  // Break-even chart data (profit curve)
  const breakEvenChartData = React.useMemo(() => {
    const maxUnits = Math.max(
      units * 2,
      (isFinite(breakEvenUnits) ? breakEvenUnits : 0) * 2,
      10,
    );
    const steps = 10;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const u = Math.round((maxUnits / steps) * i);
      const rev = price * u;
      const totalCost = effectiveCogPerUnit * u + totalFixedExpenses;
      const profit = rev - totalCost;
      return {
        units: u,
        revenue: Math.round(rev),
        totalCost: Math.round(totalCost),
        profit: Math.round(profit),
      };
    });
  }, [price, effectiveCogPerUnit, totalFixedExpenses, units, breakEvenUnits]);

  // ─────────────────────────────────────────
  // Charts
  // ─────────────────────────────────────────
  const chartData = [
    { name: "Revenue", value: totalRevenue, color: "hsl(var(--primary))" },
    { name: "COGS", value: totalCogs, color: "#f87171" },
    { name: "Var. Costs", value: totalVariableCosts, color: "#c084fc" },
    { name: "Fixed Exp.", value: totalFixedExpenses, color: "#fb923c" },
    { name: "Net Profit", value: Math.max(0, netProfit), color: "#4ade80" },
  ];

  const pieData = [
    { name: "COGS", value: totalCogs, fill: "#f87171" },
    { name: "Variable Costs", value: totalVariableCosts, fill: "#c084fc" },
    { name: "Ad Spend", value: adSpend, fill: "#3b82f6" },
    { name: "OpEx", value: totalOtherExpenses, fill: "#fb923c" },
    ...(taxAmount > 0
      ? [{ name: "Tax", value: taxAmount, fill: "#94a3b8" }]
      : []),
    { name: "Net Profit", value: Math.max(0, afterTaxProfit), fill: "#4ade80" },
  ].filter((d) => d.value > 0);

  const scenarioChartData = [
    {
      metric: "Revenue",
      pessimistic: scenarios.pessimistic.revenue,
      base: scenarios.base.revenue,
      optimistic: scenarios.optimistic.revenue,
    },
    {
      metric: "Net Profit",
      pessimistic: Math.max(0, scenarios.pessimistic.netProfit),
      base: Math.max(0, scenarios.base.netProfit),
      optimistic: Math.max(0, scenarios.optimistic.netProfit),
    },
  ];

  // ─────────────────────────────────────────
  // Formatters
  // ─────────────────────────────────────────
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const formatK = (v: number) =>
    `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`;

  // ─────────────────────────────────────────
  // Expense helpers
  // ─────────────────────────────────────────
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

  // Per-unit cost helpers
  const addPerUnitCost = () =>
    setPerUnitCosts([
      ...perUnitCosts,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "New Cost",
        amount: 0,
        isPercent: false,
      },
    ]);

  const updatePerUnitCost = (
    id: string,
    field: keyof PerUnitCost,
    value: string | number | boolean,
  ) =>
    setPerUnitCosts(
      perUnitCosts.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  const removePerUnitCost = (id: string) =>
    setPerUnitCosts(perUnitCosts.filter((c) => c.id !== id));

  // ─────────────────────────────────────────
  // CSV Export
  // ─────────────────────────────────────────
  const handleExport = () => {
    const rows: (string | number)[][] = [
      ["Profit Margin Analysis Report"],
      [
        "Generated",
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ],
      [],
      ["── INPUTS ──"],
      ["Metric", "Value", "Unit"],
      ["Sale Price per Unit", price, "USD"],
      ["Units Sold", units, ""],
      ["COGS per Unit", cogsPerUnit, "USD"],
      ...perUnitCosts.map((c) => [
        `  Per-Unit: ${c.name}`,
        c.amount,
        c.isPercent ? "% of price" : "USD/unit",
      ]),
      ["Effective Total Cost per Unit", effectiveCogPerUnit.toFixed(2), "USD"],
      ["Monthly Ad Spend", adSpend, "USD"],
      ...expenses.map((e) => [`  OpEx: ${e.name}`, e.amount, "USD"]),
      ["Tax Rate", taxRate, "%"],
      ["Projection Period", projectionMonths, "months"],
      [],
      ["── REVENUE ──"],
      ["Total Revenue", totalRevenue, "USD"],
      ["Total COGS", totalCogs, "USD"],
      ["Total Variable Costs", totalVariableCosts, "USD"],
      ["Total Direct Costs", totalDirectCosts, "USD"],
      ["Gross Profit", grossProfit, "USD"],
      ["Gross Margin", grossMargin.toFixed(2), "%"],
      [],
      ["── EXPENSES ──"],
      ["Ad Spend", adSpend, "USD"],
      ["Other OpEx", totalOtherExpenses, "USD"],
      ["Total Fixed Expenses", totalFixedExpenses, "USD"],
      ["Total Expenses (incl. variable)", totalExpenses, "USD"],
      [],
      ["── PROFITABILITY ──"],
      ["Net Profit (Pre-Tax)", netProfit, "USD"],
      ["Net Margin (Pre-Tax)", netMargin.toFixed(2), "%"],
      ["Tax Amount", taxAmount.toFixed(2), "USD"],
      ["After-Tax Profit", afterTaxProfit, "USD"],
      ["After-Tax Margin", afterTaxMargin.toFixed(2), "%"],
      [],
      ["── UNIT ECONOMICS ──"],
      [
        "Contribution Margin per Unit",
        contributionMarginPerUnit.toFixed(2),
        "USD",
      ],
      ["Contribution Margin Ratio", contributionMarginRatio.toFixed(2), "%"],
      ["ROAS", roas.toFixed(2), "x"],
      ["CAC (Ad Spend / Units)", cac.toFixed(2), "USD"],
      ["ROI", roi.toFixed(2), "%"],
      ["Operating Leverage", operatingLeverage.toFixed(2), "x"],
      [],
      ["── BREAK-EVEN ANALYSIS ──"],
      [
        "Break-Even Units",
        isFinite(breakEvenUnits) ? breakEvenUnits : "N/A",
        "",
      ],
      [
        "Break-Even Revenue",
        isFinite(breakEvenRevenue) ? breakEvenRevenue.toFixed(0) : "N/A",
        "USD",
      ],
      ["Margin of Safety (Units)", marginOfSafetyUnits, "units"],
      ["Margin of Safety (%)", marginOfSafetyPct.toFixed(2), "%"],
      [
        "Payback Period",
        isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "N/A",
        "months",
      ],
      [],
      ["── PROJECTIONS ──"],
      [`${projectionMonths}-Month Revenue`, projectedRevenue, "USD"],
      [
        `${projectionMonths}-Month Net Profit (Pre-Tax)`,
        projectedNetProfit,
        "USD",
      ],
      [
        `${projectionMonths}-Month After-Tax Profit`,
        projectedAfterTaxProfit,
        "USD",
      ],
      [],
      ["── SCENARIOS ──"],
      ["Scenario", "Revenue", "Net Profit", "Net Margin"],
      [
        "Pessimistic (-15% price, -30% units)",
        scenarios.pessimistic.revenue.toFixed(0),
        scenarios.pessimistic.netProfit.toFixed(0),
        scenarios.pessimistic.netMargin.toFixed(2) + "%",
      ],
      [
        "Base (current)",
        scenarios.base.revenue.toFixed(0),
        scenarios.base.netProfit.toFixed(0),
        scenarios.base.netMargin.toFixed(2) + "%",
      ],
      [
        "Optimistic (+10% price, +40% units)",
        scenarios.optimistic.revenue.toFixed(0),
        scenarios.optimistic.netProfit.toFixed(0),
        scenarios.optimistic.netMargin.toFixed(2) + "%",
      ],
    ];

    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
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
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Profit Margin Calculator
              </h1>
              <p className="text-sm text-muted-foreground">
                Advanced P&amp;L analysis — break-even, scenarios, unit
                economics, and projections.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-semibold h-9"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={handleSave}
                variant={saved ? "default" : "outline"}
                size="sm"
                className="gap-2 text-xs font-semibold h-9"
              >
                <BookmarkIcon className="h-4 w-4" />
                {saved ? "Saved ✓" : "Save"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─── LEFT COLUMN: Inputs ─── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Product & Sales */}
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BriefcaseIcon className="h-4 w-4 text-primary" /> Product
                    &amp; Sales
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
                      description="Manufacturing or purchase cost only"
                    />
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Per-Unit Variable Costs (NEW) */}
              <Card className="border-purple-500/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-purple-500" /> Variable
                    Costs per Unit
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={addPerUnitCost}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground -mt-1">
                    Packaging, shipping, payment fees — added to COGS per unit.
                  </p>
                  {perUnitCosts.map((cost) => (
                    <div
                      key={cost.id}
                      className="flex flex-col gap-2 p-2.5 rounded-lg border bg-muted/10"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Cost name"
                          className="flex-1 h-8 text-xs bg-background"
                          value={cost.name}
                          onChange={(e) =>
                            updatePerUnitCost(cost.id, "name", e.target.value)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive/70 hover:text-destructive"
                          onClick={() => removePerUnitCost(cost.id)}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <InputGroup className="flex-1 h-8 bg-background">
                          <InputGroupAddon
                            align="inline-start"
                            className="bg-muted/30 border-r px-2"
                          >
                            <InputGroupText className="text-[10px] font-bold">
                              {cost.isPercent ? "%" : "$"}
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type="number"
                            className="text-xs text-center px-1"
                            value={cost.amount}
                            onChange={(e) =>
                              updatePerUnitCost(
                                cost.id,
                                "amount",
                                Number(e.target.value),
                              )
                            }
                            step={cost.isPercent ? 0.1 : 0.5}
                            min={0}
                          />
                        </InputGroup>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 text-[10px] font-bold px-2 shrink-0",
                            cost.isPercent
                              ? "border-purple-500/50 text-purple-500 bg-purple-500/5"
                              : "",
                          )}
                          onClick={() =>
                            updatePerUnitCost(
                              cost.id,
                              "isPercent",
                              !cost.isPercent,
                            )
                          }
                        >
                          {cost.isPercent ? "% of price" : "$ fixed"}
                        </Button>
                      </div>
                      {cost.isPercent && price > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          = {formatCurrency((price * cost.amount) / 100)} per
                          unit at current price
                        </p>
                      )}
                    </div>
                  ))}
                  {perUnitCosts.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t text-xs">
                      <span className="font-semibold text-muted-foreground">
                        Total variable cost/unit
                      </span>
                      <span className="font-bold text-purple-500">
                        {formatCurrency(totalPerUnitVariableCosts)}
                      </span>
                    </div>
                  )}
                  {perUnitCosts.length === 0 && (
                    <button
                      onClick={addPerUnitCost}
                      className="w-full py-4 border border-dashed rounded-lg text-xs text-muted-foreground hover:border-purple-500/50 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="h-3.5 w-3.5" /> Add per-unit cost
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Operating Expenses */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ReceiptPercentIcon className="h-4 w-4 text-primary" />{" "}
                    Fixed Overheads
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
                    <div className="pt-3 border-t space-y-3">
                      <SectionLabel>Other monthly expenses</SectionLabel>
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

              {/* Tax & Projections (NEW) */}
              <Card className="border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4 text-blue-500" /> Tax
                    &amp; Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-5">
                    <NumericField
                      label="Tax Rate"
                      value={taxRate}
                      onChange={setTaxRate}
                      suffix="%"
                      step={1}
                      description="Applied to pre-tax profit"
                    />
                    <NumericField
                      label="Projection Period"
                      value={projectionMonths}
                      onChange={setProjectionMonths}
                      suffix="mo"
                      step={1}
                      min={1}
                      description="Months to project forward"
                    />
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Toggle buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant={showCE ? "secondary" : "outline"}
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={() => setShowCE((v) => !v)}
                >
                  <CursorArrowRaysIcon className="h-4 w-4" />
                  {showCE ? "Hide Conversion Engine" : "Add Conversion Engine"}
                </Button>
                <Button
                  variant={showScenarios ? "secondary" : "outline"}
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={() => setShowScenarios((v) => !v)}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  {showScenarios
                    ? "Hide Scenario Planner"
                    : "Add Scenario Planner"}
                </Button>
              </div>

              {/* Conversion Engine */}
              {showCE && (
                <Card className="border-dashed border-primary/40 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FunnelIcon className="h-4 w-4 text-primary" /> Conversion
                      Engine
                    </CardTitle>
                    <CardDescription className="text-xs">
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
                          <p className="text-xs font-semibold text-muted-foreground">
                            {label}
                          </p>
                          <p className="text-sm font-bold mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ─── RIGHT COLUMN: Results ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-semibold">
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
                    "border shadow-sm",
                    netProfit >= 0
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-red-500/5 border-red-500/20",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-semibold">
                        Net Profit (Pre-Tax)
                      </CardDescription>
                      <KpiInfo description="Take-home earnings after COGS, variable costs, Ad Spend, and overheads — before tax." />
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
                      <CardDescription className="text-xs font-semibold">
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

              {/* Secondary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  icon={<MegaphoneIcon className="h-3.5 w-3.5" />}
                  label="ROAS"
                  value={`${roas.toFixed(2)}x`}
                  info="Revenue for every dollar spent on ads."
                />
                <KpiCard
                  icon={<UsersIcon className="h-3.5 w-3.5" />}
                  label="CAC"
                  value={formatCurrency(cac)}
                  info="Ad spend ÷ units sold."
                />
                <KpiCard
                  icon={<ArrowTrendingUpIcon className="h-3.5 w-3.5" />}
                  label="ROI"
                  value={`${roi.toFixed(1)}%`}
                  info="Profitability relative to total spend."
                  highlight={roi > 0 ? "positive" : "negative"}
                />
                <KpiCard
                  icon={<ArrowRightIcon className="h-3.5 w-3.5" />}
                  label="Gross Margin"
                  value={`${grossMargin.toFixed(1)}%`}
                  info="Revenue remaining after COGS only."
                />
                <KpiCard
                  icon={<ScaleIcon className="h-3.5 w-3.5" />}
                  label="Contribution Margin"
                  value={`${contributionMarginRatio.toFixed(1)}%`}
                  info="Revenue remaining after all variable costs per unit."
                  highlight={
                    contributionMarginRatio > 0 ? "positive" : "negative"
                  }
                />
                <KpiCard
                  icon={<CurrencyDollarIcon className="h-3.5 w-3.5" />}
                  label="Contrib. / Unit"
                  value={formatCurrency(contributionMarginPerUnit)}
                  info="Profit per unit toward covering fixed costs."
                  highlight={
                    contributionMarginPerUnit > 0 ? "positive" : "negative"
                  }
                />
                <KpiCard
                  icon={<ReceiptRefundIcon className="h-3.5 w-3.5" />}
                  label="After-Tax Profit"
                  value={formatCurrency(afterTaxProfit)}
                  info={`Net profit after ${taxRate}% tax.`}
                  highlight={afterTaxProfit >= 0 ? "positive" : "negative"}
                />
                <KpiCard
                  icon={<ChartPieIcon className="h-3.5 w-3.5" />}
                  label="Operating Leverage"
                  value={
                    isFinite(operatingLeverage)
                      ? `${operatingLeverage.toFixed(2)}x`
                      : "N/A"
                  }
                  info="How sensitive net profit is to revenue changes."
                />
              </div>

              {/* Tabs for deeper analysis */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1 text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="breakeven" className="flex-1 text-xs">
                    Break-Even
                  </TabsTrigger>
                  <TabsTrigger value="projections" className="flex-1 text-xs">
                    Projections
                  </TabsTrigger>
                  {showScenarios && (
                    <TabsTrigger value="scenarios" className="flex-1 text-xs">
                      Scenarios
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                          <ChartPieIcon className="h-4 w-4" /> Revenue Structure
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
                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-3">
                          {pieData.map((e) => (
                            <div
                              key={e.name}
                              className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-full border border-border/50"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: e.fill }}
                              />
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {e.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                          <CurrencyDollarIcon className="h-4 w-4" /> Finance
                          Outlook
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
                              fontWeight="600"
                            />
                            <YAxis
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              fontWeight="600"
                              tickFormatter={formatK}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(v) => formatCurrency(Number(v))}
                                />
                              }
                              cursor={{ fill: "hsl(var(--muted)/.3)" }}
                            />
                            <Bar
                              dataKey="value"
                              radius={[6, 6, 0, 0]}
                              barSize={36}
                            >
                              {chartData.map((e, i) => (
                                <Cell key={i} fill={e.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* BREAK-EVEN TAB */}
                <TabsContent value="breakeven" className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Break-Even Units",
                        value: isFinite(breakEvenUnits)
                          ? breakEvenUnits.toLocaleString()
                          : "∞",
                        sub: "units needed",
                        color:
                          isFinite(breakEvenUnits) && units >= breakEvenUnits
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500",
                        info: "Number of units you need to sell to cover all fixed costs.",
                      },
                      {
                        label: "Break-Even Revenue",
                        value: isFinite(breakEvenRevenue)
                          ? formatCurrency(breakEvenRevenue)
                          : "∞",
                        sub: "revenue needed",
                        color: "",
                        info: "Revenue required to exactly cover all costs.",
                      },
                      {
                        label: "Margin of Safety",
                        value: isFinite(breakEvenUnits)
                          ? `${marginOfSafetyPct.toFixed(1)}%`
                          : "N/A",
                        sub: `${Math.abs(marginOfSafetyUnits)} units ${marginOfSafetyUnits >= 0 ? "above" : "below"} B/E`,
                        color:
                          marginOfSafetyPct > 20
                            ? "text-green-600 dark:text-green-400"
                            : marginOfSafetyPct > 0
                              ? "text-yellow-500"
                              : "text-red-500",
                        info: "How far current sales are above break-even — your safety buffer.",
                      },
                      {
                        label: "Payback Period",
                        value: isFinite(paybackMonths)
                          ? `${paybackMonths.toFixed(1)} mo`
                          : "N/A",
                        sub: "to recoup fixed costs",
                        color: "",
                        info: "Months needed to recover total fixed expenses from after-tax profit.",
                      },
                    ].map(({ label, value, sub, color, info }) => (
                      <Card key={label} className="p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          {label}
                          <KpiInfo description={info} />
                        </p>
                        <p className={cn("text-2xl font-black", color)}>
                          {value}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {sub}
                        </p>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-muted-foreground">
                        Break-Even Curve — Revenue vs. Total Cost
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Where revenue crosses total cost is your break-even
                        point. Your current position is marked.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          revenue: { label: "Revenue", color: "#4ade80" },
                          totalCost: { label: "Total Cost", color: "#f87171" },
                          profit: { label: "Profit", color: "#60a5fa" },
                        }}
                        className="h-[260px]"
                      >
                        <LineChart data={breakEvenChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="units"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            label={{
                              value: "Units",
                              position: "insideBottom",
                              offset: -2,
                              fontSize: 10,
                            }}
                          />
                          <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatK}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(v, name) => [
                                  formatCurrency(Number(v)),
                                  name,
                                ]}
                              />
                            }
                          />
                          {isFinite(breakEvenUnits) && (
                            <ReferenceLine
                              x={breakEvenUnits}
                              stroke="#fb923c"
                              strokeDasharray="4 4"
                              label={{
                                value: `B/E: ${breakEvenUnits}u`,
                                fontSize: 10,
                                fill: "#fb923c",
                              }}
                            />
                          )}
                          <ReferenceLine
                            x={units}
                            stroke="hsl(var(--primary))"
                            strokeDasharray="4 4"
                            label={{
                              value: "Now",
                              fontSize: 10,
                              fill: "hsl(var(--primary))",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4ade80"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="totalCost"
                            stroke="#f87171"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Unit Economics Summary */}
                  <Card className="bg-muted/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Unit Economics Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        {[
                          ["Sale Price", formatCurrency(price)],
                          ["COGS per Unit", formatCurrency(cogsPerUnit)],
                          [
                            "Variable Costs per Unit",
                            formatCurrency(totalPerUnitVariableCosts),
                          ],
                          [
                            "Effective Total Cost/Unit",
                            formatCurrency(effectiveCogPerUnit),
                          ],
                          [
                            "Contribution Margin/Unit",
                            formatCurrency(contributionMarginPerUnit),
                          ],
                          [
                            "Contribution Margin Ratio",
                            `${contributionMarginRatio.toFixed(1)}%`,
                          ],
                          [
                            "Fixed Costs (monthly)",
                            formatCurrency(totalFixedExpenses),
                          ],
                          [
                            "Break-Even Units",
                            isFinite(breakEvenUnits)
                              ? breakEvenUnits.toLocaleString()
                              : "∞",
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0"
                          >
                            <span className="text-muted-foreground font-medium">
                              {label}
                            </span>
                            <span className="font-bold tabular-nums">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PROJECTIONS TAB */}
                <TabsContent value="projections" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: `${projectionMonths}-Month Revenue`,
                        value: formatCurrency(projectedRevenue),
                        color: "text-primary",
                      },
                      {
                        label: `${projectionMonths}-Month Net Profit`,
                        value: formatCurrency(projectedNetProfit),
                        color:
                          projectedNetProfit >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500",
                      },
                      {
                        label: `${projectionMonths}-Month After-Tax`,
                        value: formatCurrency(projectedAfterTaxProfit),
                        color:
                          projectedAfterTaxProfit >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500",
                      },
                    ].map(({ label, value, color }) => (
                      <Card key={label} className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {label}
                        </p>
                        <p className={cn("text-3xl font-black mt-1", color)}>
                          {value}
                        </p>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-muted-foreground">
                        Monthly Profit Accumulation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          cumProfit: {
                            label: "Cumulative Profit",
                            color: "#4ade80",
                          },
                          cumRevenue: {
                            label: "Cumulative Revenue",
                            color: "hsl(var(--primary))",
                          },
                        }}
                        className="h-[240px]"
                      >
                        <BarChart
                          data={Array.from(
                            { length: projectionMonths },
                            (_, i) => ({
                              month: `M${i + 1}`,
                              cumRevenue: totalRevenue * (i + 1),
                              cumProfit: afterTaxProfit * (i + 1),
                            }),
                          )}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="month"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval={Math.floor(projectionMonths / 6)}
                          />
                          <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={formatK}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(v) => formatCurrency(Number(v))}
                              />
                            }
                            cursor={{ fill: "hsl(var(--muted)/.3)" }}
                          />
                          <Bar
                            dataKey="cumRevenue"
                            fill="hsl(var(--primary)/.3)"
                            radius={[4, 4, 0, 0]}
                            barSize={14}
                          />
                          <Bar
                            dataKey="cumProfit"
                            fill="#4ade80"
                            radius={[4, 4, 0, 0]}
                            barSize={14}
                          />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SCENARIOS TAB */}
                {showScenarios && (
                  <TabsContent value="scenarios" className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(["pessimistic", "base", "optimistic"] as const).map(
                        (key) => {
                          const s = scenarios[key];
                          const colors = {
                            pessimistic: {
                              border: "border-red-500/30 bg-red-500/5",
                              badge: "bg-red-500/15 text-red-500",
                              profit: "text-red-500",
                            },
                            base: {
                              border: "border-blue-500/30 bg-blue-500/5",
                              badge: "bg-blue-500/15 text-blue-500",
                              profit:
                                s.netProfit >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-500",
                            },
                            optimistic: {
                              border: "border-green-500/30 bg-green-500/5",
                              badge: "bg-green-500/15 text-green-500",
                              profit: "text-green-600 dark:text-green-400",
                            },
                          };
                          const labels = {
                            pessimistic:
                              "-15% price · -30% units · +10% ad spend",
                            base: "Current inputs unchanged",
                            optimistic:
                              "+10% price · +40% units · +5% ad spend",
                          };
                          return (
                            <Card
                              key={key}
                              className={cn("border", colors[key].border)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm font-bold capitalize">
                                    {key}
                                  </CardTitle>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px]",
                                      colors[key].badge,
                                    )}
                                  >
                                    {key}
                                  </Badge>
                                </div>
                                <CardDescription className="text-[10px]">
                                  {labels[key]}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2 text-xs">
                                {[
                                  ["Revenue", formatCurrency(s.revenue)],
                                  ["Net Profit", formatCurrency(s.netProfit)],
                                  ["Net Margin", `${s.netMargin.toFixed(1)}%`],
                                  ["Units", s.units.toLocaleString()],
                                ].map(([label, value]) => (
                                  <div
                                    key={label}
                                    className="flex justify-between border-b border-border/40 pb-1.5 last:border-0"
                                  >
                                    <span className="text-muted-foreground font-medium">
                                      {label}
                                    </span>
                                    <span
                                      className={cn(
                                        "font-bold",
                                        label === "Net Profit" &&
                                          colors[key].profit,
                                      )}
                                    >
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          );
                        },
                      )}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground">
                          Scenario Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={scenarioChartConfig}
                          className="h-[220px]"
                        >
                          <BarChart data={scenarioChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="metric"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              fontWeight="600"
                            />
                            <YAxis
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={formatK}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(v) => formatCurrency(Number(v))}
                                />
                              }
                              cursor={{ fill: "hsl(var(--muted)/.3)" }}
                            />
                            <Bar
                              dataKey="pessimistic"
                              fill="#f87171"
                              radius={[4, 4, 0, 0]}
                              barSize={32}
                            />
                            <Bar
                              dataKey="base"
                              fill="#60a5fa"
                              radius={[4, 4, 0, 0]}
                              barSize={32}
                            />
                            <Bar
                              dataKey="optimistic"
                              fill="#4ade80"
                              radius={[4, 4, 0, 0]}
                              barSize={32}
                            />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>

              {/* P&L Report */}
              <Card className="bg-card/40 border-primary/10 overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/10 border-b py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-foreground/80">
                      Fiscal P&amp;L Simulation Report
                    </CardTitle>
                    <div className="bg-muted/30 text-xs font-semibold px-2 py-0.5 rounded border border-border/50 text-muted-foreground">
                      {new Date().toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-8 space-y-6">
                  {/* Revenue */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-bold">Gross Revenue</span>
                        <p className="text-xs text-muted-foreground">
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

                  {/* Direct Costs */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-bold">COGS</span>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(cogsPerUnit)}/unit
                        </p>
                      </div>
                      <span className="text-base font-bold text-red-500/80 tabular-nums">
                        −{formatCurrency(totalCogs)}
                      </span>
                    </div>
                    {totalVariableCosts > 0 && (
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold">
                            Variable Costs
                          </span>
                          <p className="text-xs text-muted-foreground">
                            @ {formatCurrency(totalPerUnitVariableCosts)}/unit
                          </p>
                        </div>
                        <span className="text-base font-bold text-purple-500/80 tabular-nums">
                          −{formatCurrency(totalVariableCosts)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 bg-primary/10 px-4 rounded-xl border border-primary/20 shadow-inner">
                      <span className="text-xs font-bold text-primary">
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

                  {/* OpEx */}
                  <div className="space-y-4 pt-2">
                    <SectionLabel>Operating Expenditures (OpEx)</SectionLabel>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />{" "}
                          Digital Marketing (Ad Spend)
                        </span>
                        <span className="font-bold text-red-400 tabular-nums">
                          −{formatCurrency(adSpend)}
                        </span>
                      </div>
                      {expenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="font-semibold text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />{" "}
                            {exp.name || "Fixed Expense"}
                          </span>
                          <span className="font-bold text-red-400 tabular-nums">
                            −{formatCurrency(exp.amount)}
                          </span>
                        </div>
                      ))}
                      {taxAmount > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />{" "}
                            Income Tax ({taxRate}%)
                          </span>
                          <span className="font-bold text-red-400 tabular-nums">
                            −{formatCurrency(taxAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Net Profit — Dark Mode Fixed */}
                  <div className="pt-6 mt-4 border-t-2 border-dashed border-border/50">
                    <div
                      className={cn(
                        "flex justify-between items-center p-6 rounded-2xl border-2 shadow-lg",
                        afterTaxProfit >= 0
                          ? "bg-green-500/10 border-green-500/30 dark:bg-green-500/15"
                          : "bg-red-500/10 border-red-500/30 dark:bg-red-500/15",
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xl font-black tracking-tight">
                          Net Monthly Profit
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {afterTaxProfit >= 0
                              ? "Profitable"
                              : "Needs optimization"}
                          </span>
                          {roas > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold px-2"
                            >
                              {roas.toFixed(1)}x ROAS
                            </Badge>
                          )}
                          {isFinite(breakEvenUnits) && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold px-2"
                            >
                              B/E at {breakEvenUnits}u
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "text-4xl font-black tabular-nums tracking-tighter",
                            afterTaxProfit >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                        >
                          <NumberFlow
                            value={isMounted ? afterTaxProfit : 0}
                            format={{
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }}
                          />
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground mt-1">
                          <NumberFlow
                            value={isMounted ? afterTaxMargin : 0}
                            format={{ maximumFractionDigits: 1 }}
                          />
                          % after-tax margin
                        </span>
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
  );
}
