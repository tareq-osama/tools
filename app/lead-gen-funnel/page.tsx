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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { KpiInfo } from "@/components/kpi-info";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  FunnelChart,
  Funnel,
  LabelList,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lead-gen-funnel-v1";

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

// Conversion rate slider row
function RateSlider({
  label,
  value,
  onChange,
  max = 100,
  info,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  info?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
            {label}
          </span>
          {info && <KpiInfo description={info} />}
        </div>
        <span className="text-[10px] font-black text-foreground">{value}%</span>
      </div>
      <Slider
        min={0}
        max={max}
        step={0.5}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

export default function LeadGenFunnel() {
  // Traffic & Funnel Rates
  const [traffic, setTraffic] = React.useState<number>(10000);
  const [optInRate, setOptInRate] = React.useState<number>(3.5);
  const [qualRate, setQualRate] = React.useState<number>(40);
  const [bookRate, setBookRate] = React.useState<number>(50);
  const [showRate, setShowRate] = React.useState<number>(75);
  const [closeRate, setCloseRate] = React.useState<number>(25);

  // Economics
  const [offerPrice, setOfferPrice] = React.useState<number>(3000);
  const [adSpend, setAdSpend] = React.useState<number>(5000);

  // Reverse Calculator
  const [revenueGoal, setRevenueGoal] = React.useState<number>(50000);

  const [isMounted, setIsMounted] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.traffic !== undefined) setTraffic(d.traffic);
        if (d.optInRate !== undefined) setOptInRate(d.optInRate);
        if (d.qualRate !== undefined) setQualRate(d.qualRate);
        if (d.bookRate !== undefined) setBookRate(d.bookRate);
        if (d.showRate !== undefined) setShowRate(d.showRate);
        if (d.closeRate !== undefined) setCloseRate(d.closeRate);
        if (d.offerPrice !== undefined) setOfferPrice(d.offerPrice);
        if (d.adSpend !== undefined) setAdSpend(d.adSpend);
        if (d.revenueGoal !== undefined) setRevenueGoal(d.revenueGoal);
      }
    } catch {}
    setIsMounted(true);
  }, []);

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        traffic,
        optInRate,
        qualRate,
        bookRate,
        showRate,
        closeRate,
        offerPrice,
        adSpend,
        revenueGoal,
      }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Forward Calculator ────────────────────────────────────────────────
  const leads = Math.round((traffic * optInRate) / 100);
  const qualLeads = Math.round((leads * qualRate) / 100);
  const bookedCalls = Math.round((qualLeads * bookRate) / 100);
  const shows = Math.round((bookedCalls * showRate) / 100);
  const closedDeals = Math.round((shows * closeRate) / 100);
  const revenue = closedDeals * offerPrice;

  // Cost per stage
  const cpl = leads > 0 ? adSpend / leads : 0;
  const cpql = qualLeads > 0 ? adSpend / qualLeads : 0;
  const cpbc = bookedCalls > 0 ? adSpend / bookedCalls : 0;
  const cpClose = closedDeals > 0 ? adSpend / closedDeals : 0;
  const roas = adSpend > 0 ? revenue / adSpend : 0;

  // Overall traffic → close rate
  const overallCr = traffic > 0 ? (closedDeals / traffic) * 100 : 0;

  // ── Reverse Calculator ────────────────────────────────────────────────
  const dealsNeeded = revenueGoal / offerPrice;
  const showsNeeded = closeRate > 0 ? dealsNeeded / (closeRate / 100) : 0;
  const callsNeeded = showRate > 0 ? showsNeeded / (showRate / 100) : 0;
  const qualNeeded = bookRate > 0 ? callsNeeded / (bookRate / 100) : 0;
  const leadsNeeded = qualRate > 0 ? qualNeeded / (qualRate / 100) : 0;
  const trafficNeeded = optInRate > 0 ? leadsNeeded / (optInRate / 100) : 0;
  const adSpendNeeded = cpl > 0 ? leadsNeeded * cpl : 0;

  // ── Charts ────────────────────────────────────────────────────────────
  const chartConfig = {
    value: { label: "Pipeline", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const costChartConfig = {
    cost: { label: "Cost ($)", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const funnelData = [
    {
      name: "Traffic",
      value: traffic,
      fill: "hsl(var(--muted-foreground))",
      fillOpacity: 1.0,
    },
    {
      name: "Leads",
      value: leads,
      fill: "hsl(var(--muted-foreground))",
      fillOpacity: 0.85,
    },
    {
      name: "Qualified",
      value: qualLeads,
      fill: "hsl(var(--muted-foreground))",
      fillOpacity: 0.7,
    },
    {
      name: "Booked Calls",
      value: bookedCalls,
      fill: "hsl(var(--muted-foreground))",
      fillOpacity: 0.55,
    },
    {
      name: "Showed Up",
      value: shows,
      fill: "hsl(var(--muted-foreground))",
      fillOpacity: 0.4,
    },
    {
      name: "Closed Deals",
      value: closedDeals,
      fill: "hsl(var(--primary))",
      fillOpacity: 1.0,
    },
  ];

  const costBarData = [
    { name: "Cost / Lead", cost: Math.round(cpl) },
    { name: "Cost / Qual. Lead", cost: Math.round(cpql) },
    { name: "Cost / Booked Call", cost: Math.round(cpbc) },
    { name: "Cost / Close", cost: Math.round(cpClose) },
  ];

  // Reverse pipeline display
  const reversePipeline = [
    { label: "Revenue Goal", value: revenueGoal, isCurrency: true },
    {
      label: "Closed Deals Needed",
      value: Math.ceil(dealsNeeded),
      isCurrency: false,
    },
    {
      label: "Calls That Show",
      value: Math.ceil(showsNeeded),
      isCurrency: false,
    },
    {
      label: "Calls to Book",
      value: Math.ceil(callsNeeded),
      isCurrency: false,
    },
    {
      label: "Qualified Leads",
      value: Math.ceil(qualNeeded),
      isCurrency: false,
    },
    { label: "Total Leads", value: Math.ceil(leadsNeeded), isCurrency: false },
    {
      label: "Traffic Required",
      value: Math.ceil(trafficNeeded),
      isCurrency: false,
    },
    { label: "Ad Spend Required", value: adSpendNeeded, isCurrency: true },
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("en-US").format(Math.round(val));

  // Drop-off % between stages
  const dropOff = (from: number, to: number) =>
    from > 0 ? (((from - to) / from) * 100).toFixed(0) : "0";

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
              Lead Generation Funnel
            </h1>
            <p className="text-xs text-muted-foreground">
              Map your full acquisition pipeline from traffic to closed revenue
              — and work backwards from any goal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Inputs ── */}
            <Card className="lg:col-span-1 shadow-none border h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest italic text-muted-foreground">
                  Funnel Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FieldGroup className="gap-5">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Traffic & Offer
                    </p>
                    <NumericField
                      label="Monthly Traffic"
                      id="traffic"
                      value={traffic}
                      onChange={setTraffic}
                      step={500}
                    />
                    <NumericField
                      label="Offer Price"
                      id="offerPrice"
                      value={offerPrice}
                      onChange={setOfferPrice}
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

                  <div className="space-y-5 pt-4 border-t border-dashed">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Conversion Rates
                    </p>
                    <RateSlider
                      label="Opt-In Rate"
                      value={optInRate}
                      onChange={setOptInRate}
                      max={30}
                      info="Percentage of visitors who become leads. Industry average: 2–5%."
                    />
                    <RateSlider
                      label="Lead → Qualified"
                      value={qualRate}
                      onChange={setQualRate}
                      info="Percentage of leads who meet your qualification criteria. Target: 30–50%."
                    />
                    <RateSlider
                      label="Qualified → Booked"
                      value={bookRate}
                      onChange={setBookRate}
                      info="Percentage of qualified leads who book a discovery call. Target: 40–60%."
                    />
                    <RateSlider
                      label="Show Rate"
                      value={showRate}
                      onChange={setShowRate}
                      info="Percentage of booked calls who actually show up. Optimize with reminders. Target: 70–80%."
                    />
                    <RateSlider
                      label="Close Rate"
                      value={closeRate}
                      onChange={setCloseRate}
                      info="Percentage of calls that convert to paying clients. Average: 20–30%. Elite closers: 40–60%."
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
                        Monthly Revenue
                      </CardDescription>
                      <KpiInfo description="Total monthly revenue generated from closed deals." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow
                        value={isMounted ? revenue : 0}
                        format={{
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }}
                      />
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Deals Closed
                      </CardDescription>
                      <KpiInfo description="Number of new clients acquired from this month's pipeline." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow value={isMounted ? closedDeals : 0} />
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-none border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Cost / Close
                      </CardDescription>
                      <KpiInfo description="Total ad spend divided by closed deals. Your true Customer Acquisition Cost." />
                    </div>
                    <CardTitle className="text-2xl font-semibold">
                      <NumberFlow
                        value={isMounted ? cpClose : 0}
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
                    "shadow-none border-border",
                    roas >= 1 ? "bg-green-500/5" : "bg-red-500/5",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        ROAS
                      </CardDescription>
                      <KpiInfo description="Return on ad spend. Revenue generated for every dollar spent on advertising." />
                    </div>
                    <CardTitle
                      className={cn(
                        "text-2xl font-semibold",
                        roas >= 3
                          ? "text-green-600 dark:text-green-400"
                          : roas >= 1
                            ? "text-foreground"
                            : "text-red-500",
                      )}
                    >
                      <NumberFlow
                        value={isMounted ? roas : 0}
                        format={{ maximumFractionDigits: 1 }}
                      />
                      x
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Tabs: Pipeline | Reverse Calculator */}
              <Tabs defaultValue="pipeline" className="w-full">
                <TabsList className="mb-6 border rounded-lg p-1 bg-muted/40">
                  <TabsTrigger
                    value="pipeline"
                    className="gap-2 px-6 py-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Pipeline View
                  </TabsTrigger>
                  <TabsTrigger
                    value="reverse"
                    className="gap-2 px-6 py-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Reverse Calculator
                  </TabsTrigger>
                </TabsList>

                {/* ── Pipeline Tab ── */}
                <TabsContent value="pipeline" className="space-y-6">
                  {/* Drop-off Table */}
                  <Card className="shadow-none border overflow-hidden">
                    <CardHeader className="border-b bg-muted/10 py-4">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Pipeline Waterfall
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/5">
                            {[
                              "Stage",
                              "Volume",
                              "Drop-Off",
                              "Cost per Stage",
                            ].map((h) => (
                              <th
                                key={h}
                                className={cn(
                                  "p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60",
                                  h === "Stage" ? "text-left" : "text-right",
                                )}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              stage: "Traffic",
                              volume: traffic,
                              from: traffic,
                              to: leads,
                              cost: null,
                              isLast: false,
                            },
                            {
                              stage: "Leads (Opt-In)",
                              volume: leads,
                              from: leads,
                              to: qualLeads,
                              cost: cpl,
                              isLast: false,
                            },
                            {
                              stage: "Qualified Leads",
                              volume: qualLeads,
                              from: qualLeads,
                              to: bookedCalls,
                              cost: cpql,
                              isLast: false,
                            },
                            {
                              stage: "Booked Calls",
                              volume: bookedCalls,
                              from: bookedCalls,
                              to: shows,
                              cost: cpbc,
                              isLast: false,
                            },
                            {
                              stage: "Showed Up",
                              volume: shows,
                              from: shows,
                              to: closedDeals,
                              cost: null,
                              isLast: false,
                            },
                            {
                              stage: "Closed Deals",
                              volume: closedDeals,
                              from: closedDeals,
                              to: 0,
                              cost: cpClose,
                              isLast: true,
                            },
                          ].map(({ stage, volume, from, to, cost, isLast }) => (
                            <tr
                              key={stage}
                              className={cn(
                                "border-b transition-colors hover:bg-muted/20",
                                isLast && "bg-primary/5 font-bold",
                              )}
                            >
                              <td className="p-4 font-bold">
                                {stage}
                                {isLast && (
                                  <span className="ml-2 text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-black uppercase">
                                    Revenue
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right font-mono tabular-nums">
                                {formatNumber(volume)}
                              </td>
                              <td className="p-4 text-right font-mono tabular-nums">
                                {!isLast && from > 0 ? (
                                  <span className="text-red-400 font-black">
                                    -{dropOff(from, to)}%
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right font-mono tabular-nums">
                                {cost !== null ? (
                                  <span
                                    className={cn(
                                      isLast && "text-primary font-black",
                                    )}
                                  >
                                    {formatCurrency(cost)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-none border">
                      <CardHeader>
                        <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">
                          Acquisition Funnel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[260px]">
                        <ChartContainer
                          config={chartConfig}
                          className="h-full w-full"
                        >
                          <FunnelChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Funnel
                              data={funnelData}
                              dataKey="value"
                              nameKey="name"
                            >
                              <LabelList
                                position="right"
                                fill="hsl(var(--muted-foreground))"
                                stroke="none"
                                dataKey="name"
                                fontSize={10}
                                fontWeight="600"
                              />
                            </Funnel>
                          </FunnelChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="shadow-none border">
                      <CardHeader>
                        <CardTitle className="text-xs font-bold uppercase tracking-widest italic text-muted-foreground">
                          Cost per Pipeline Stage
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[260px]">
                        <ChartContainer
                          config={costChartConfig}
                          className="h-full w-full"
                        >
                          <BarChart
                            data={costBarData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -10,
                              bottom: 0,
                            }}
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
                              tickFormatter={(v) =>
                                `$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                              }
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(v) => [
                                    formatCurrency(Number(v)),
                                    "Cost",
                                  ]}
                                />
                              }
                            />
                            <Bar
                              dataKey="cost"
                              radius={[4, 4, 0, 0]}
                              barSize={36}
                            >
                              {costBarData.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    i === costBarData.length - 1
                                      ? "hsl(var(--primary))"
                                      : `hsl(var(--muted-foreground)/${1 - i * 0.2})`
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall conversion & performance summary */}
                  <Card className="shadow-none border border-border">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">
                        Performance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y border rounded-lg overflow-hidden">
                        {[
                          {
                            label: "Traffic → Close Rate",
                            value: `${overallCr.toFixed(3)}%`,
                            note: `1 in every ${overallCr > 0 ? Math.round(100 / overallCr) : "∞"} visitors becomes a client`,
                          },
                          {
                            label: "Revenue per Lead",
                            value:
                              leads > 0 ? formatCurrency(revenue / leads) : "—",
                            note: "How much each opt-in is worth at current close rates",
                          },
                          {
                            label: "Revenue per Visitor",
                            value:
                              traffic > 0
                                ? formatCurrency(revenue / traffic)
                                : "—",
                            note: "Maximum you can profitably pay per visitor (CPV ceiling)",
                          },
                          {
                            label: "Funnel Efficiency",
                            value:
                              roas >= 3
                                ? "Strong ✓"
                                : roas >= 1.5
                                  ? "Moderate"
                                  : "Needs Work ✗",
                            note:
                              roas >= 3
                                ? "ROAS above 3x — solid paid acquisition economics"
                                : roas >= 1.5
                                  ? "ROAS 1.5–3x — profitable but room to optimize close rate or offer price"
                                  : "ROAS below 1.5x — prioritize conversion rate or reduce cost per lead",
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
                </TabsContent>

                {/* ── Reverse Calculator Tab ── */}
                <TabsContent value="reverse" className="space-y-6">
                  <Card className="shadow-none border">
                    <CardHeader className="border-b bg-muted/10 py-4">
                      <CardTitle className="text-sm font-bold">
                        Revenue Goal
                      </CardTitle>
                      <div className="pt-3">
                        <NumericField
                          label="Monthly Revenue Target"
                          id="revenueGoal"
                          value={revenueGoal}
                          onChange={setRevenueGoal}
                          prefix="$"
                          step={5000}
                          inline
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-xs text-muted-foreground mb-6 italic">
                        Working backwards from {formatCurrency(revenueGoal)}/mo
                        at your current funnel conversion rates — here's exactly
                        what the pipeline needs to produce:
                      </p>

                      <div className="space-y-3">
                        {reversePipeline.map(
                          ({ label, value, isCurrency }, index) => {
                            const isFirst = index === 0;
                            const isLast = index === reversePipeline.length - 1;
                            return (
                              <div
                                key={label}
                                className={cn(
                                  "flex items-center justify-between rounded-lg px-4 py-3 border",
                                  isFirst && "bg-primary/5 border-primary/20",
                                  isLast && "bg-muted/10",
                                  !isFirst && !isLast && "bg-transparent",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black shrink-0",
                                      isFirst
                                        ? "border-primary text-primary"
                                        : "border-muted-foreground/30 text-muted-foreground",
                                    )}
                                  >
                                    {index + 1}
                                  </div>
                                  <span
                                    className={cn(
                                      "text-xs font-bold uppercase tracking-wide",
                                      isFirst
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {label}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "text-sm font-black tabular-nums",
                                    isFirst
                                      ? "text-primary"
                                      : isLast
                                        ? "text-foreground"
                                        : "text-foreground",
                                  )}
                                >
                                  {isCurrency
                                    ? formatCurrency(value)
                                    : formatNumber(value)}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>

                      {/* Gap analysis */}
                      <div className="mt-8 p-4 bg-muted/20 border-l-2 border-primary/40 rounded-r-lg">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                          Gap Analysis
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">
                              Current:
                            </span>{" "}
                            Your funnel generates{" "}
                            <span className="font-bold text-foreground">
                              {formatCurrency(revenue)}/mo
                            </span>{" "}
                            from{" "}
                            <span className="font-bold text-foreground">
                              {formatNumber(traffic)}
                            </span>{" "}
                            visitors.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-bold text-foreground">
                              Gap:
                            </span>{" "}
                            {revenue >= revenueGoal ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">
                                ✓ Goal achieved — you're{" "}
                                {formatCurrency(revenue - revenueGoal)} over
                                target.
                              </span>
                            ) : (
                              <>
                                You need{" "}
                                <span className="font-bold text-foreground">
                                  {formatNumber(trafficNeeded - traffic)} more
                                  visitors/mo
                                </span>{" "}
                                or improve your close rate by{" "}
                                <span className="font-bold text-foreground">
                                  {revenue > 0
                                    ? `${((revenueGoal / revenue - 1) * closeRate).toFixed(1)}pp`
                                    : "—"}
                                </span>{" "}
                                to reach your goal.
                              </>
                            )}
                          </p>
                          {adSpendNeeded > adSpend && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-bold text-foreground">
                                Ad Spend Gap:
                              </span>{" "}
                              You'd need{" "}
                              <span className="font-bold text-foreground">
                                {formatCurrency(adSpendNeeded - adSpend)}/mo
                                more
                              </span>{" "}
                              in ad budget to generate the required leads at
                              current CPL.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
