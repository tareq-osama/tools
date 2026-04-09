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
  TruckIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import NumberFlow from "@number-flow/react";

const STORAGE_KEY = "vehicle-calculator-v1";

// ─── Types ──────────────────────────────────────────────────────────────────

type FeeType = "fixed" | "percent";

interface Fee {
  id: string;
  name: string;
  value: number;
  type: FeeType;
  enabled: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  basePrice: number;
  fees: Fee[];
  downPayment: number;
  installmentMonths: number;
  annualInterestRate: number;
}

// ─── Turkish 2026 Default Templates ─────────────────────────────────────────

const MOTORBIKE_FEES: Omit<Fee, "id">[] = [
  { name: "ÖTV (Special Consumption Tax)", value: 37, type: "percent", enabled: true },
  { name: "KDV (VAT)", value: 20, type: "percent", enabled: true },
  { name: "MTV (Motor Vehicle Tax) — Annual", value: 3500, type: "fixed", enabled: true },
  { name: "Zorunlu Trafik Sigortası (Mandatory Traffic Insurance)", value: 1800, type: "fixed", enabled: true },
  { name: "Kasko (Comprehensive Insurance) — Annual", value: 8000, type: "fixed", enabled: true },
  { name: "Noter Masrafları (Notary Fees)", value: 2500, type: "fixed", enabled: true },
  { name: "Plaka Tescil (License Plate Registration)", value: 800, type: "fixed", enabled: true },
  { name: "Trafik Belgesi (Traffic Document)", value: 350, type: "fixed", enabled: true },
  { name: "Egzoz Muayenesi (Emission Inspection)", value: 250, type: "fixed", enabled: false },
  { name: "Helmet & Gear", value: 3000, type: "fixed", enabled: false },
];

const CAR_FEES: Omit<Fee, "id">[] = [
  { name: "ÖTV (Special Consumption Tax)", value: 45, type: "percent", enabled: true },
  { name: "KDV (VAT)", value: 20, type: "percent", enabled: true },
  { name: "MTV (Motor Vehicle Tax) — Annual", value: 12000, type: "fixed", enabled: true },
  { name: "Zorunlu Trafik Sigortası (Mandatory Traffic Insurance)", value: 3500, type: "fixed", enabled: true },
  { name: "Kasko (Comprehensive Insurance) — Annual", value: 25000, type: "fixed", enabled: true },
  { name: "Noter Masrafları (Notary Fees)", value: 4500, type: "fixed", enabled: true },
  { name: "Plaka Tescil (License Plate Registration)", value: 1500, type: "fixed", enabled: true },
  { name: "Trafik Belgesi (Traffic Document)", value: 500, type: "fixed", enabled: true },
  { name: "Araç Muayenesi (Vehicle Inspection — Periodic)", value: 1200, type: "fixed", enabled: false },
  { name: "Vites / DSG Service", value: 2000, type: "fixed", enabled: false },
];

function makeFees(templates: Omit<Fee, "id">[]): Fee[] {
  return templates.map((t) => ({ ...t, id: crypto.randomUUID() }));
}

function makeVehicle(name: string, type: "motorbike" | "car"): Vehicle {
  return {
    id: crypto.randomUUID(),
    name,
    basePrice: type === "motorbike" ? 120000 : 500000,
    fees: makeFees(type === "motorbike" ? MOTORBIKE_FEES : CAR_FEES),
    downPayment: 0,
    installmentMonths: 12,
    annualInterestRate: 48,
  };
}

const DEFAULT_STATE: Vehicle[] = [makeVehicle("Bike A", "motorbike")];

// ─── Calculations ────────────────────────────────────────────────────────────

function calculateVehicleCosts(v: Vehicle) {
  let totalFees = 0;
  const feeBreakdown: { name: string; amount: number; type: FeeType }[] = [];

  for (const fee of v.fees) {
    if (!fee.enabled) continue;
    const amount =
      fee.type === "percent"
        ? (v.basePrice * fee.value) / 100
        : fee.value;
    totalFees += amount;
    feeBreakdown.push({ name: fee.name, amount, type: fee.type });
  }

  const totalCost = v.basePrice + totalFees;
  const loanAmount = Math.max(0, totalCost - v.downPayment);
  const monthlyRate = v.annualInterestRate / 100 / 12;
  const n = v.installmentMonths;

  let monthlyPayment = 0;
  let totalPayable = 0;
  let totalInterest = 0;

  if (loanAmount > 0 && n > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / n;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);
    }
    totalPayable = monthlyPayment * n + v.downPayment;
    totalInterest = totalPayable - totalCost;
  } else {
    totalPayable = totalCost;
    totalInterest = 0;
    monthlyPayment = 0;
  }

  return {
    basePrice: v.basePrice,
    totalFees,
    totalCost,
    loanAmount,
    monthlyPayment,
    totalPayable,
    totalInterest,
    feeBreakdown,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider pb-1 border-b mb-3">
      {children}
    </p>
  );
}

function KpiCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: "green" | "red" | "blue" | "default";
}) {
  const colorMap = {
    green: "text-emerald-500",
    red: "text-red-500",
    blue: "text-blue-500",
    default: "text-foreground",
  };
  const color = colorMap[highlight ?? "default"];
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border bg-card">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={cn("text-xl font-bold tabular-nums", color)}>
        ₺{fmt(value)}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function NumericField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1000,
  min = 0,
  description,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  description?: string;
}) {
  return (
    <Field>
      <div className="flex flex-col gap-0.5 mb-1.5">
        <FieldLabel className="text-sm font-semibold text-foreground/90">
          {label}
        </FieldLabel>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <InputGroup className="hover:border-primary/40 transition-colors w-full">
        {prefix && (
          <InputGroupAddon align="inline-start" className="bg-muted/30 border-r px-2.5">
            <InputGroupText className="font-semibold text-xs">{prefix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupInput
          type="number"
          className="text-center font-semibold text-sm"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
        />
        {suffix && (
          <InputGroupAddon align="inline-end" className="bg-muted/30 border-l px-2.5">
            <InputGroupText className="font-semibold text-xs">{suffix}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupAddon align="inline-end" className="p-0 border-l overflow-hidden bg-muted/10 h-full">
          <InputGroupButton
            onClick={() => onChange(Math.max(min, value - step))}
            className="h-full rounded-none border-r w-8 hover:bg-muted/50 active:bg-muted/80 transition-colors"
          >
            <MinusIcon className="h-3.5 w-3.5" />
          </InputGroupButton>
          <InputGroupButton
            onClick={() => onChange(value + step)}
            className="h-full rounded-none w-8 hover:bg-muted/50 active:bg-muted/80 transition-colors"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

// ─── Fee Row ─────────────────────────────────────────────────────────────────

function FeeRow({
  fee,
  basePrice,
  onUpdate,
  onRemove,
}: {
  fee: Fee;
  basePrice: number;
  onUpdate: (updated: Fee) => void;
  onRemove: () => void;
}) {
  const computed =
    fee.type === "percent" ? (basePrice * fee.value) / 100 : fee.value;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border transition-colors",
        fee.enabled ? "bg-card" : "bg-muted/20 opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate({ ...fee, enabled: !fee.enabled })}
          className="shrink-0"
          title={fee.enabled ? "Disable" : "Enable"}
        >
          {fee.enabled ? (
            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
          )}
        </button>
        <Input
          className="flex-1 h-7 text-xs font-medium"
          value={fee.name}
          onChange={(e) => onUpdate({ ...fee, name: e.target.value })}
        />
        <button
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 pl-6">
        <div className="flex rounded-md border overflow-hidden h-7">
          <button
            onClick={() => onUpdate({ ...fee, type: "fixed" })}
            className={cn(
              "px-2.5 text-xs font-semibold transition-colors",
              fee.type === "fixed"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50",
            )}
          >
            ₺
          </button>
          <button
            onClick={() => onUpdate({ ...fee, type: "percent" })}
            className={cn(
              "px-2.5 text-xs font-semibold transition-colors border-l",
              fee.type === "percent"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted/50",
            )}
          >
            %
          </button>
        </div>
        <Input
          type="number"
          className="flex-1 h-7 text-xs text-center font-semibold"
          value={fee.value}
          onChange={(e) => onUpdate({ ...fee, value: Number(e.target.value) })}
          min={0}
          step={fee.type === "percent" ? 0.5 : 100}
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap w-28 text-right font-medium">
          = ₺{fmt(computed)}
        </span>
      </div>
    </div>
  );
}

// ─── Vehicle Panel ────────────────────────────────────────────────────────────

function VehiclePanel({
  vehicle,
  onUpdate,
  onDuplicate,
  onRemove,
  showRemove,
}: {
  vehicle: Vehicle;
  onUpdate: (v: Vehicle) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const calc = calculateVehicleCosts(vehicle);
  const [feesOpen, setFeesOpen] = React.useState(true);

  const updateFee = (id: string, updated: Fee) =>
    onUpdate({
      ...vehicle,
      fees: vehicle.fees.map((f) => (f.id === id ? updated : f)),
    });

  const removeFee = (id: string) =>
    onUpdate({ ...vehicle, fees: vehicle.fees.filter((f) => f.id !== id) });

  const addFee = () =>
    onUpdate({
      ...vehicle,
      fees: [
        ...vehicle.fees,
        {
          id: crypto.randomUUID(),
          name: "Custom Fee",
          value: 0,
          type: "fixed",
          enabled: true,
        },
      ],
    });

  const pieData = [
    { name: "Base Price", value: calc.basePrice, fill: "#60a5fa" },
    ...calc.feeBreakdown.map((f, i) => ({
      name: f.name.split("(")[0].trim(),
      value: f.amount,
      fill: [
        "#f87171", "#fb923c", "#facc15", "#4ade80", "#a78bfa",
        "#34d399", "#f472b6", "#94a3b8",
      ][i % 8],
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Input
          className="text-lg font-bold flex-1 border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent"
          value={vehicle.name}
          onChange={(e) => onUpdate({ ...vehicle, name: e.target.value })}
          placeholder="Vehicle name..."
        />
        <Button size="sm" variant="ghost" onClick={onDuplicate} title="Duplicate">
          <DocumentDuplicateIcon className="h-4 w-4" />
        </Button>
        {showRemove && (
          <Button size="sm" variant="ghost" onClick={onRemove} className="text-red-500 hover:text-red-600">
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Base Price" value={calc.basePrice} />
        <KpiCard label="Total Fees" value={calc.totalFees} highlight="red" />
        <KpiCard label="Total Cost" value={calc.totalCost} highlight="blue" />
        <KpiCard
          label="Monthly Payment"
          value={calc.monthlyPayment}
          highlight="green"
          sub={vehicle.installmentMonths > 0 ? `× ${vehicle.installmentMonths} months` : "Cash purchase"}
        />
      </div>

      {/* Base price */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Base Price</CardTitle>
          <CardDescription className="text-xs">
            The listed price before any taxes or fees
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <NumericField
            label="Vehicle Base Price"
            value={vehicle.basePrice}
            onChange={(val) => onUpdate({ ...vehicle, basePrice: val })}
            prefix="₺"
            step={5000}
          />
        </CardContent>
      </Card>

      {/* Fees */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <button
            className="flex items-center justify-between w-full"
            onClick={() => setFeesOpen((p) => !p)}
          >
            <div className="text-left">
              <CardTitle className="text-sm">Taxes, Fees & Expenses</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {vehicle.fees.filter((f) => f.enabled).length} active ·{" "}
                Total: ₺{fmt(calc.totalFees)}
              </CardDescription>
            </div>
            {feesOpen ? (
              <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {feesOpen && (
          <CardContent className="px-4 pb-4 space-y-2">
            {vehicle.fees.map((fee) => (
              <FeeRow
                key={fee.id}
                fee={fee}
                basePrice={vehicle.basePrice}
                onUpdate={(updated) => updateFee(fee.id, updated)}
                onRemove={() => removeFee(fee.id)}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 border-dashed text-xs gap-1.5"
              onClick={addFee}
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add Fee / Expense
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Financing */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Financing / Installments</CardTitle>
          <CardDescription className="text-xs">
            Leave installment months at 0 for cash purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <NumericField
            label="Down Payment"
            value={vehicle.downPayment}
            onChange={(val) => onUpdate({ ...vehicle, downPayment: val })}
            prefix="₺"
            step={5000}
            description="Amount paid upfront"
          />
          <NumericField
            label="Installment Period"
            value={vehicle.installmentMonths}
            onChange={(val) => onUpdate({ ...vehicle, installmentMonths: val })}
            suffix="months"
            step={6}
            min={0}
            description="Number of monthly payments (0 = cash)"
          />
          <NumericField
            label="Annual Interest Rate"
            value={vehicle.annualInterestRate}
            onChange={(val) => onUpdate({ ...vehicle, annualInterestRate: val })}
            suffix="%"
            step={1}
            min={0}
            description="Bank loan annual interest rate"
          />

          {vehicle.installmentMonths > 0 && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="font-semibold">₺{fmt(calc.loanAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Monthly Payment</span>
                <span className="font-bold text-emerald-500">₺{fmt(calc.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Interest Paid</span>
                <span className="font-semibold text-red-500">₺{fmt(calc.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-xs border-t pt-2 mt-1">
                <span className="text-muted-foreground font-semibold">Total You Pay</span>
                <span className="font-bold text-blue-500">₺{fmt(calc.totalPayable)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie chart breakdown */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `₺${fmt(v)}`}
                  contentStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: d.fill }}
                />
                <span className="text-muted-foreground truncate max-w-[120px]">{d.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Comparison View ──────────────────────────────────────────────────────────

function ComparisonView({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length < 2)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Add at least 2 vehicles to compare them side-by-side.
        </p>
      </div>
    );

  const calcs = vehicles.map((v) => ({ ...calculateVehicleCosts(v), name: v.name }));

  const barData = calcs.map((c) => ({
    name: c.name,
    "Base Price": c.basePrice,
    "Total Fees": c.totalFees,
    "Total Interest": c.totalInterest,
  }));

  const COLORS = ["#60a5fa", "#f87171", "#4ade80", "#fb923c", "#a78bfa"];

  const best = calcs.reduce((a, b) => (a.totalCost < b.totalCost ? a : b));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calcs.map((c, i) => (
          <Card
            key={i}
            className={cn(
              "shadow-none border-border/50",
              c.name === best.name && "ring-2 ring-emerald-500/60",
            )}
          >
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{c.name}</CardTitle>
                {c.name === best.name && (
                  <Badge className="text-[10px] bg-emerald-500 text-white">
                    Best Value
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-semibold">₺{fmt(c.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Fees</span>
                <span className="font-semibold text-red-500">₺{fmt(c.totalFees)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Cost</span>
                <span className="font-bold text-blue-500">₺{fmt(c.totalCost)}</span>
              </div>
              {c.monthlyPayment > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-bold text-emerald-500">₺{fmt(c.monthlyPayment)}</span>
                </div>
              )}
              {c.totalInterest > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Cost</span>
                  <span className="font-semibold text-orange-500">₺{fmt(c.totalInterest)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Side-by-Side Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={24} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  formatter={(v: number) => `₺${fmt(v)}`}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="Base Price" fill="#60a5fa" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Total Fees" fill="#f87171" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Total Interest" fill="#fb923c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VehicleCalculatorPage() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [activeTab, setActiveTab] = React.useState("vehicle-0");

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const updateVehicle = (id: string, updated: Vehicle) =>
    setVehicles((vs) => vs.map((v) => (v.id === id ? updated : v)));

  const addVehicle = (type: "motorbike" | "car") => {
    const idx = vehicles.filter((v) => v.name.startsWith(type === "motorbike" ? "Bike" : "Car")).length;
    const names = type === "motorbike"
      ? ["Bike A", "Bike B", "Bike C", "Bike D"]
      : ["Car A", "Car B", "Car C", "Car D"];
    const newV = makeVehicle(names[idx] ?? `Vehicle ${vehicles.length + 1}`, type);
    setVehicles((vs) => [...vs, newV]);
    setActiveTab(`vehicle-${vehicles.length}`);
  };

  const duplicateVehicle = (idx: number) => {
    const v = vehicles[idx];
    const copy: Vehicle = {
      ...v,
      id: crypto.randomUUID(),
      name: `${v.name} (Copy)`,
      fees: v.fees.map((f) => ({ ...f, id: crypto.randomUUID() })),
    };
    const newVehicles = [...vehicles];
    newVehicles.splice(idx + 1, 0, copy);
    setVehicles(newVehicles);
    setActiveTab(`vehicle-${idx + 1}`);
  };

  const removeVehicle = (idx: number) => {
    setVehicles((vs) => vs.filter((_, i) => i !== idx));
    setActiveTab("vehicle-0");
  };

  const reset = () => {
    setVehicles(DEFAULT_STATE);
    setActiveTab("vehicle-0");
  };

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
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 max-w-5xl mx-auto w-full">

            {/* Page header */}
            <div className="flex flex-col gap-2 pb-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-xl text-primary">
                  <TruckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Turkey Vehicle Purchase Calculator
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Compare motorbike &amp; car purchases with real 2026 Turkish taxes, fees, and financing.
                  </p>
                </div>
              </div>

              {/* Add vehicle buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => addVehicle("motorbike")}
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add Motorbike
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => addVehicle("car")}
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Add Car
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-muted-foreground"
                  onClick={reset}
                >
                  <ArrowPathIcon className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 mt-2">
                <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>
                  Pre-loaded with 2026 Turkish fee templates (ÖTV, KDV, MTV, Noter, Sigorta, Tescil, etc.).
                  Fees with a <strong>%</strong> badge are calculated as a percentage of the base price.
                  Disable any fee by clicking the circle icon.
                </span>
              </div>
            </div>

            {/* Tabs: one per vehicle + comparison */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1 bg-muted/30 p-1">
                {vehicles.map((v, i) => (
                  <TabsTrigger
                    key={v.id}
                    value={`vehicle-${i}`}
                    className="text-xs data-[state=active]:bg-background"
                  >
                    {v.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value="compare"
                  className="text-xs data-[state=active]:bg-background"
                >
                  Compare All
                </TabsTrigger>
              </TabsList>

              {vehicles.map((v, i) => (
                <TabsContent key={v.id} value={`vehicle-${i}`} className="mt-6">
                  <VehiclePanel
                    vehicle={v}
                    onUpdate={(updated) => updateVehicle(v.id, updated)}
                    onDuplicate={() => duplicateVehicle(i)}
                    onRemove={() => removeVehicle(i)}
                    showRemove={vehicles.length > 1}
                  />
                </TabsContent>
              ))}

              <TabsContent value="compare" className="mt-6">
                <ComparisonView vehicles={vehicles} />
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
