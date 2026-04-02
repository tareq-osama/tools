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
import { Button } from "@/components/ui/button";
import { KpiInfo } from "@/components/kpi-info";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "break-even-roas-v1";

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

export default function BreakEvenRoas() {
  const [price, setPrice] = React.useState<number>(100);
  const [cogs, setCogs] = React.useState<number>(30);
  const [fulfillment, setFulfillment] = React.useState<number>(10);
  const [overhead, setOverhead] = React.useState<number>(3000);
  const [adSpend, setAdSpend] = React.useState<number>(2000);
  const [targetMargin, setTargetMargin] = React.useState<number>(20);
  const [currentRoas, setCurrentRoas] = React.useState<number>(3);
  const [isMounted, setIsMounted] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.price !== undefined) setPrice(d.price);
        if (d.cogs !== undefined) setCogs(d.cogs);
        if (d.fulfillment !== undefined) setFulfillment(d.fulfillment);
        if (d.overhead !== undefined) setOverhead(d.overhead);
        if (d.adSpend !== undefined) setAdSpend(d.adSpend);
        if (d.targetMargin !== undefined) setTargetMargin(d.targetMargin);
        if (d.currentRoas !== undefined) setCurrentRoas(d.currentRoas);
      }
    } catch {}
    setIsMounted(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        price,
        cogs,
        fulfillment,
        overhead,
        adSpend,
        targetMargin,
        currentRoas,
      }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Core calculations ─────────────────────────────────────────────────
  const variableCostPerUnit = cogs + fulfillment;
  const grossMarginPerUnit = price - variableCostPerUnit;
  const grossMarginPct = price > 0 ? grossMarginPerUnit / price : 0;

  // Minimum ROAS — variable costs only (no overhead, no ad spend)
  const beRoasVariable = grossMarginPct > 0 ? 1 / grossMarginPct : 0;

  // Full break-even ROAS — covers COGS + fulfillment + overhead + ad spend
  const beRoasFull =
    adSpend > 0 && grossMarginPct > 0
      ? (adSpend + overhead) / (adSpend * grossMarginPct)
      : 0;

  // Target ROAS — what you need to hit your desired net margin
  const effectiveMarginGap = grossMarginPct - targetMargin / 100;
  const targetRoasCalc =
    adSpend > 0 && effectiveMarginGap > 0
      ? (adSpend + overhead) / (adSpend * effectiveMarginGap)
      : 0;

  // Current performance at user's declared ROAS
  const currentRevenue = currentRoas * adSpend;
  const currentGrossProfit = currentRevenue * grossMarginPct;
  const currentNetProfit = currentGrossProfit - overhead - adSpend;
  const currentNetMargin =
    currentRevenue > 0 ? (currentNetProfit / currentRevenue) * 100 : 0;
  const isProfitable = currentNetProfit >= 0;

  // ── Chart configs ─────────────────────────────────────────────────────
  const profitCurveConfig = {
    netProfit: { label: "Net Profit", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const thresholdConfig = {
    value: { label: "ROAS" },
  } satisfies ChartConfig;

  // Profit curve — ROAS 0.5x to 10x
  const profitCurveData = Array.from({ length: 20 }, (_, i) => {
    const r = (i + 1) * 0.5;
    const rev = r * adSpend;
    const gp = rev * grossMarginPct;
    const np = gp - overhead - adSpend;
    return { roas: `${r.toFixed(1)}x`, netProfit: Math.round(np) };
  });

  // Threshold bar comparison
  const thresholdData = [
    {
      name: "Min. ROAS",
      value: Number(beRoasVariable.toFixed(2)),
      fill: "#f87171",
    },
    {
      name: "Break-Even",
      value: Number(beRoasFull.toFixed(2)),
      fill: "#fb923c",
    },
    {
      name: "Target ROAS",
      value: Number(targetRoasCalc.toFixed(2)),
      fill: "#4ade80",
    },
    {
      name: "Your ROAS",
      value: Number(currentRoas.toFixed(2)),
      fill: isProfitable ? "hsl(var(--primary))" : "#f87171",
    },
  ];

  // Profit simulation table
  const simRows = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10].map((r) => {
    const rev = r * adSpend;
    const gp = rev * grossMarginPct;
    const np = gp - overhead - adSpend;
    const margin = rev > 0 ? (np / rev) * 100 : 0;
    return { roas: r, revenue: rev, grossProfit: gp, netProfit: np, margin };
  });

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
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-6xl mx-auto w-full pb-20">
          {/* Header */}
          <div className="flex flex-col gap-2 pb-6 border-b">
            <h1 className="text-2xl font-bold tracking-tight">
              Break-Even ROAS Calculator
            </h1>
            <p className="text-xs text-muted-foreground">
              Know your minimum viable ROAS before spending a single dollar on
              ads.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Inputs ── */}
            <Card className="lg:col-span-1 shadow-none border h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest italic text-muted-foreground">
                  Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FieldGroup className="gap-5">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Unit Economics
                    </p>
                    <NumericField
                      label="Sale Price"
                      id="price"
                      value={price}
                      onChange={setPrice}
                      prefix="$"
                      step={5}
                    />
                    <NumericField
                      label="Cost of Goods (COGS)"
                      id="cogs"
                      value={cogs}
                      onChange={setCogs}
                      prefix="$"
                      step={5}
                    />
                    <NumericField
                      label="Fulfillment / Shipping"
                      id="fulfillment"
                      value={fulfillment}
                      onChange={setFulfillment}
                      prefix="$"
                      step={1}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Business Overhead
                    </p>
                    <NumericField
                      label="Monthly Fixed Overhead"
                      id="overhead"
                      value={overhead}
                      onChange={setOverhead}
                      prefix="$"
                      step={100}
                    />
                    <NumericField
                      label="Monthly Ad Spend"
                      id="adSpend"
                      value={adSpend}
                      onChange={setAdSpend}
                      prefix="$"
                      step={100}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Performance
                    </p>
                    <NumericField
                      label="Target Net Margin"
                      id="targetMargin"
                      value={targetMargin}
                      onChange={setTargetMargin}
                      suffix="%"
                      step={1}
                    />
                    <NumericField
                      label="Current ROAS"
                      id="currentRoas"
                      value={currentRoas}
                      onChange={setCurrentRoas}
                      suffix="x"
                      step={0.1}
                    />
                  </div>
                </FieldGroup>

                <Button
                  className="w-full text-xs font-bold uppercase tracking-[0.15em] h-10 border-foreground/20 hover:bg-foreground hover:text-background transition-all"
                  variant="outline"
                  onClick={handleSave}
                >
                  {saved ? "Saved ✓" : "Save"}
                </Button>
              </CardContent>
            </Card>

            {/* ── Results ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Gross Margin
                      </CardDescription>
                      <KpiInfo description="Revenue remaining after variable costs per unit. This single number determines your minimum viable ROAS." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow
                        value={isMounted ? grossMarginPct * 100 : 0}
                        format={{ maximumFractionDigits: 1 }}
                      />
                      %
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Min. ROAS
                      </CardDescription>
                      <KpiInfo description="Minimum ROAS to cover variable costs only. Below this, every sale destroys margin before overhead is even considered." />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-red-500">
                      <NumberFlow
                        value={isMounted ? beRoasVariable : 0}
                        format={{ maximumFractionDigits: 2 }}
                      />
                      x
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Break-Even
                      </CardDescription>
                      <KpiInfo description="ROAS required to cover all costs — COGS, fulfillment, overhead, and ad spend. Your true break-even threshold." />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-orange-500">
                      <NumberFlow
                        value={isMounted ? beRoasFull : 0}
                        format={{ maximumFractionDigits: 2 }}
                      />
                      x
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card
                  className={cn(
                    "shadow-none border-border",
                    isProfitable ? "bg-green-500/5" : "bg-red-500/5",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Net Profit
                      </CardDescription>
                      <KpiInfo description="Monthly net profit at your current ROAS after all variable costs, overhead, and ad spend." />
                    </div>
                    <CardTitle
                      className={cn(
                        "text-2xl font-semibold",
                        isProfitable
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500",
                      )}
                    >
                      <NumberFlow
                        value={isMounted ? currentNetProfit : 0}
                        format={{
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }}
                      />
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Status Banner */}
              <div
                className={cn(
                  "rounded-lg border px-5 py-4 flex items-center justify-between gap-4",
                  isProfitable
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-red-500/5 border-red-500/20",
                )}
              >
                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      isProfitable
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500",
                    )}
                  >
                    {isProfitable
                      ? "✓ Currently Profitable"
                      : "✗ Currently Unprofitable"}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {isProfitable
                      ? `Your ${currentRoas}x ROAS is ${(currentRoas - beRoasFull).toFixed(2)}x above the full break-even threshold. Target ROAS for ${targetMargin}% net margin: ${targetRoasCalc.toFixed(2)}x.`
                      : `Your ROAS needs to increase by ${(beRoasFull - currentRoas).toFixed(2)}x to break even on all costs. Currently losing ${formatCurrency(Math.abs(currentNetProfit))}/mo.`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase">
                    Net Margin
                  </span>
                  <span
                    className={cn(
                      "text-xl font-bold",
                      isProfitable
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500",
                    )}
                  >
                    {currentNetMargin.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">
                      ROAS Thresholds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[220px]">
                    <ChartContainer
                      config={thresholdConfig}
                      className="h-full w-full"
                    >
                      <BarChart
                        data={thresholdData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="name"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          fontWeight="bold"
                        />
                        <YAxis
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}x`}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(v) => [`${v}x ROAS`, ""]}
                            />
                          }
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={38}>
                          {thresholdData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">
                      Profit Curve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[220px]">
                    <ChartContainer
                      config={profitCurveConfig}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={profitCurveData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="roas"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          interval={3}
                        />
                        <YAxis
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) =>
                            `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v < -1000 ? `-${(Math.abs(v) / 1000).toFixed(0)}k` : v}`
                          }
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(v) => [
                                formatCurrency(Number(v)),
                                "Net Profit",
                              ]}
                            />
                          }
                        />
                        <ReferenceLine
                          y={0}
                          stroke="hsl(var(--border))"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          label={{
                            value: "Break-Even",
                            fontSize: 9,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="netProfit"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Profit Simulation Table */}
              <Card className="shadow-none border overflow-hidden">
                <CardHeader className="border-b bg-muted/10 py-4">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Profit Simulation — All ROAS Scenarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-muted/5">
                          {[
                            "ROAS",
                            "Revenue",
                            "Gross Profit",
                            "Net Profit",
                            "Net Margin",
                          ].map((h) => (
                            <th
                              key={h}
                              className={cn(
                                "p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60",
                                h === "ROAS" ? "text-left" : "text-right",
                              )}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {simRows.map((row) => {
                          const isCurrentRow =
                            Math.abs(row.roas - currentRoas) < 0.3;
                          const isBeRow = Math.abs(row.roas - beRoasFull) < 0.3;
                          const isProfit = row.netProfit >= 0;
                          return (
                            <tr
                              key={row.roas}
                              className={cn(
                                "border-b transition-colors",
                                isCurrentRow && "bg-primary/5",
                                isBeRow && "bg-orange-500/5",
                                !isProfit &&
                                  !isCurrentRow &&
                                  !isBeRow &&
                                  "opacity-50",
                              )}
                            >
                              <td className="p-4 font-black">
                                <span>{row.roas}x</span>
                                {isBeRow && (
                                  <span className="ml-2 text-[9px] bg-orange-500/15 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded font-black uppercase">
                                    BE
                                  </span>
                                )}
                                {isCurrentRow && (
                                  <span className="ml-2 text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-black uppercase">
                                    You
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right font-mono tabular-nums">
                                {formatCurrency(row.revenue)}
                              </td>
                              <td className="p-4 text-right font-mono tabular-nums">
                                {formatCurrency(row.grossProfit)}
                              </td>
                              <td
                                className={cn(
                                  "p-4 text-right font-black font-mono tabular-nums",
                                  isProfit
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-500",
                                )}
                              >
                                {formatCurrency(row.netProfit)}
                              </td>
                              <td
                                className={cn(
                                  "p-4 text-right font-black tabular-nums",
                                  isProfit
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-500",
                                )}
                              >
                                {row.margin.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Unit Economics Summary */}
              <Card className="shadow-none border border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">
                    Unit Economics Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {[
                      {
                        label: "Variable Cost per Unit",
                        value: formatCurrency(variableCostPerUnit),
                        note: `COGS ${formatCurrency(cogs)} + Fulfillment ${formatCurrency(fulfillment)}`,
                      },
                      {
                        label: "Gross Profit per Unit",
                        value: formatCurrency(grossMarginPerUnit),
                        note: `${(grossMarginPct * 100).toFixed(1)}% of sale price`,
                      },
                      {
                        label: "Target ROAS (for ${targetMargin}% Net Margin)",
                        value:
                          targetRoasCalc > 0
                            ? `${targetRoasCalc.toFixed(2)}x`
                            : "—",
                        note:
                          effectiveMarginGap <= 0
                            ? "⚠ Target margin exceeds gross margin — impossible without reducing costs"
                            : `You need ${formatCurrency(targetRoasCalc * adSpend)} revenue on ${formatCurrency(adSpend)} ad spend`,
                      },
                      {
                        label: "Revenue @ Current ROAS",
                        value: formatCurrency(currentRevenue),
                        note: `${currentRoas}x on ${formatCurrency(adSpend)} ad spend`,
                      },
                    ].map(({ label, value, note }) => (
                      <div key={label} className="p-4">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-medium text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-bold text-sm">{value}</span>
                        </div>
                        {note && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                            {note}
                          </p>
                        )}
                      </div>
                    ))}
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
