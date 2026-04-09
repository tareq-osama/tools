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
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
  LinkIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon, // <-- NEW IMPORT
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
import { Field, FieldLabel } from "@/components/ui/field";

const STORAGE_KEY = "vehicle-calculator-v2";

// Make sure this matches the slug of your collection in Corvex exactly
const COLLECTION_SLUG = "vehicles";

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
  imageUrl?: string;
  purchaseLink?: string;
  basePrice: number;
  fees: Fee[];
  downPayment: number;
  installmentMonths: number;
  annualInterestRate: number;
}

// ─── Turkish 2026 Default Templates ─────────────────────────────────────────

const MOTORBIKE_FEES: Omit<Fee, "id">[] = [
  {
    name: "MTV (Motor Vehicle Tax) — Annual",
    value: 3500,
    type: "fixed",
    enabled: false,
  },
  {
    name: "Zorunlu Trafik Sigortası (Mandatory Traffic Insurance)",
    value: 1800,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Noter Masrafları (Notary Fees)",
    value: 2500,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Plaka Tescil (License Plate Registration)",
    value: 800,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Trafik Belgesi (Traffic Document)",
    value: 350,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Traffic Insurance (Istanbul Base Rate)",
    value: 8000,
    type: "fixed",
    enabled: true,
  },
  { name: "Helmet & Gear", value: 3000, type: "fixed", enabled: false },
];

const CAR_FEES: Omit<Fee, "id">[] = [
  {
    name: "ÖTV (Special Consumption Tax)",
    value: 45,
    type: "percent",
    enabled: true,
  },
  { name: "KDV (VAT)", value: 20, type: "percent", enabled: true },
  {
    name: "MTV (Motor Vehicle Tax) — Annual",
    value: 12000,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Zorunlu Trafik Sigortası (Mandatory Traffic Insurance)",
    value: 3500,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Kasko (Comprehensive Insurance) — Annual",
    value: 25000,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Noter Masrafları (Notary Fees)",
    value: 4500,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Plaka Tescil (License Plate Registration)",
    value: 1500,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Trafik Belgesi (Traffic Document)",
    value: 500,
    type: "fixed",
    enabled: true,
  },
  {
    name: "Araç Muayenesi (Vehicle Inspection)",
    value: 1200,
    type: "fixed",
    enabled: false,
  },
];

function makeFees(templates: Omit<Fee, "id">[]): Fee[] {
  return templates.map((t) => ({ ...t, id: crypto.randomUUID() }));
}

function makeVehicle(name: string, type: "motorbike" | "car"): Vehicle {
  return {
    id: crypto.randomUUID(),
    name,
    imageUrl: "",
    purchaseLink: "",
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
      fee.type === "percent" ? (v.basePrice * fee.value) / 100 : fee.value;
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

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
              "px-2.5 text-xs font-semibold transition-colors flex items-center justify-center",
              fee.type === "fixed"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/20 hover:bg-muted/50 text-muted-foreground",
            )}
          >
            ₺
          </button>
          <button
            onClick={() => onUpdate({ ...fee, type: "percent" })}
            className={cn(
              "px-2.5 text-xs font-semibold transition-colors border-l flex items-center justify-center",
              fee.type === "percent"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/20 hover:bg-muted/50 text-muted-foreground",
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
  usdRate,
  onUpdate,
  onDuplicate,
  onRemove,
  showRemove,
}: {
  vehicle: Vehicle;
  usdRate: number;
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
        "#f87171",
        "#fb923c",
        "#facc15",
        "#4ade80",
        "#a78bfa",
        "#34d399",
        "#f472b6",
        "#94a3b8",
      ][i % 8],
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Top Section: Media & Headline */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Image & Links */}
        <div className="w-full md:w-1/3 flex flex-col gap-3">
          {vehicle.imageUrl ? (
            <img
              src={vehicle.imageUrl}
              alt="Vehicle Preview"
              className="w-full h-44 object-cover rounded-xl border bg-muted/20 shadow-sm"
            />
          ) : (
            <div className="w-full h-44 flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/40 text-muted-foreground gap-2">
              <PhotoIcon className="h-8 w-8 opacity-50" />
              <span className="text-xs font-medium">Add Image URL below</span>
            </div>
          )}

          <div className="space-y-2">
            <Input
              placeholder="Paste Image URL..."
              value={vehicle.imageUrl}
              onChange={(e) =>
                onUpdate({ ...vehicle, imageUrl: e.target.value })
              }
              className="text-xs h-8 bg-card"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Paste Purchase Link..."
                value={vehicle.purchaseLink}
                onChange={(e) =>
                  onUpdate({ ...vehicle, purchaseLink: e.target.value })
                }
                className="text-xs h-8 flex-1 bg-card"
              />
              {vehicle.purchaseLink && (
                <Button size="sm" className="h-8 px-3" asChild>
                  <a
                    href={vehicle.purchaseLink}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Link"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Headline & Giant Total Banner */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Input
              className="text-2xl font-bold flex-1 border-0 border-b rounded-none px-0 focus-visible:ring-0 bg-transparent h-auto py-1"
              value={vehicle.name}
              onChange={(e) => onUpdate({ ...vehicle, name: e.target.value })}
              placeholder="Vehicle name..."
            />
            <Button
              size="sm"
              variant="outline"
              onClick={onDuplicate}
              title="Duplicate"
              className="shrink-0 h-9"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-1.5" /> Duplicate
            </Button>
            {showRemove && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
                className="shrink-0 h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Prominent Green Total Cost Banner */}
          <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-5 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-auto">
            <div>
              <p className="text-xs font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1">
                Total Cash Cost
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₺{fmt(calc.totalCost)}
                </span>
              </div>
            </div>

            <div className="h-px w-full sm:w-px sm:h-12 bg-emerald-200 dark:bg-emerald-800/50 hidden sm:block"></div>

            <div className="sm:text-right">
              <p className="text-[10px] font-bold text-emerald-700/60 dark:text-emerald-400/60 uppercase tracking-wider mb-1">
                USD Equivalent
              </p>
              <span className="text-2xl font-bold text-emerald-600/80 dark:text-emerald-400/80">
                ${fmt(calc.totalCost / usdRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <KpiCard label="Base Price" value={calc.basePrice} />
        <KpiCard label="Total Fees" value={calc.totalFees} highlight="red" />
        <KpiCard
          label="Monthly Installment"
          value={calc.monthlyPayment}
          highlight={calc.monthlyPayment > 0 ? "blue" : "default"}
          sub={
            vehicle.installmentMonths > 0
              ? `× ${vehicle.installmentMonths} months ($${fmt(calc.monthlyPayment / usdRate)})`
              : "Cash purchase"
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
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

          {/* Financing */}
          <Card className="shadow-none border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">
                Financing / Installments
              </CardTitle>
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
                onChange={(val) =>
                  onUpdate({ ...vehicle, installmentMonths: val })
                }
                suffix="months"
                step={6}
                min={0}
                description="Number of monthly payments (0 = cash)"
              />
              <NumericField
                label="Annual Interest Rate"
                value={vehicle.annualInterestRate}
                onChange={(val) =>
                  onUpdate({ ...vehicle, annualInterestRate: val })
                }
                suffix="%"
                step={1}
                min={0}
                description="Bank loan annual interest rate"
              />

              {vehicle.installmentMonths > 0 && (
                <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-semibold">
                      ₺{fmt(calc.loanAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Monthly Payment
                    </span>
                    <span className="font-bold text-blue-500">
                      ₺{fmt(calc.monthlyPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Total Interest Paid
                    </span>
                    <span className="font-semibold text-red-500">
                      ₺{fmt(calc.totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t pt-2 mt-1">
                    <span className="text-muted-foreground font-semibold">
                      Total You Pay
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block">
                        ₺{fmt(calc.totalPayable)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ${fmt(calc.totalPayable / usdRate)} USD
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Fees */}
          <Card className="shadow-none border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setFeesOpen((p) => !p)}
              >
                <div className="text-left">
                  <CardTitle className="text-sm">
                    Taxes, Fees & Expenses
                  </CardTitle>
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
                    <span
                      className="text-muted-foreground truncate max-w-[120px]"
                      title={d.name}
                    >
                      {d.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Comparison View ──────────────────────────────────────────────────────────

function ComparisonView({
  vehicles,
  usdRate,
}: {
  vehicles: Vehicle[];
  usdRate: number;
}) {
  if (vehicles.length < 2)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Add at least 2 vehicles to compare them side-by-side.
        </p>
      </div>
    );

  const calcs = vehicles.map((v) => ({
    ...calculateVehicleCosts(v),
    name: v.name,
    img: v.imageUrl,
  }));

  const barData = calcs.map((c) => ({
    name: c.name,
    "Base Price": c.basePrice,
    "Total Fees": c.totalFees,
    "Total Interest": c.totalInterest,
  }));

  const best = calcs.reduce((a, b) => (a.totalCost < b.totalCost ? a : b));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calcs.map((c, i) => (
          <Card
            key={i}
            className={cn(
              "shadow-none border-border/50 overflow-hidden",
              c.name === best.name && "ring-2 ring-emerald-500/60",
            )}
          >
            {c.img && (
              <div className="h-24 w-full bg-muted/20 border-b">
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {c.name}
                </CardTitle>
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
                <span className="font-semibold text-red-500">
                  ₺{fmt(c.totalFees)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Cost</span>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 block">
                    ₺{fmt(c.totalCost)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ${fmt(c.totalCost / usdRate)}
                  </span>
                </div>
              </div>
              {c.monthlyPayment > 0 && (
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-bold text-blue-500">
                    ₺{fmt(c.monthlyPayment)}
                  </span>
                </div>
              )}
              {c.totalInterest > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Cost</span>
                  <span className="font-semibold text-orange-500">
                    ₺{fmt(c.totalInterest)}
                  </span>
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
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
                <Bar
                  dataKey="Base Price"
                  fill="#60a5fa"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="Total Fees"
                  fill="#f87171"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="Total Interest"
                  fill="#fb923c"
                  radius={[3, 3, 0, 0]}
                />
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

  const [usdRate, setUsdRate] = React.useState(35.5);
  const [activeTab, setActiveTab] = React.useState("vehicle-0");
  const [isSyncing, setIsSyncing] = React.useState(false); // NEW: Track sync state

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const updateVehicle = (id: string, updated: Vehicle) =>
    setVehicles((vs) => vs.map((v) => (v.id === id ? updated : v)));

  const addVehicle = (type: "motorbike" | "car") => {
    const idx = vehicles.filter((v) =>
      v.name.startsWith(type === "motorbike" ? "Bike" : "Car"),
    ).length;
    const names =
      type === "motorbike"
        ? ["Bike A", "Bike B", "Bike C", "Bike D"]
        : ["Car A", "Car B", "Car C", "Car D"];
    const newV = makeVehicle(
      names[idx] ?? `Vehicle ${vehicles.length + 1}`,
      type,
    );
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
    if (
      confirm("Are you sure you want to reset? You will lose unsaved data!")
    ) {
      setVehicles(DEFAULT_STATE);
      setActiveTab("vehicle-0");
    }
  };

  // ─── NEW: SAVE TO CMS API FUNCTION ──────────────────────────────────────────

  const saveToCMS = async () => {
    const apiKey = process.env.NEXT_PUBLIC_CORVEX_API_KEY;

    if (!apiKey) {
      alert(
        "Missing API Key! Please ensure NEXT_PUBLIC_CORVEX_API_KEY is in your .env file.",
      );
      return;
    }

    setIsSyncing(true);

    try {
      const items = vehicles.map((v) => ({
        Name: v.name,
        "Image URL": v.imageUrl || "",
        "Purchase Link": v.purchaseLink || "",
        "Base Price": v.basePrice,
        "Down Payment": v.downPayment,
        "Installment Months": v.installmentMonths,
        "Annual Interest Rate": v.annualInterestRate,
        "Fees Data": JSON.stringify(v.fees),
      }));

      const res = await fetch(
        `https://cms.usecorvex.com/api/cms/collections/${COLLECTION_SLUG}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({ items }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        console.error("CMS Push Failed:", errData);
        alert("Failed to push data to CMS. Check the console for details.");
      } else {
        alert(`Successfully saved ${items.length} vehicles to Corvex CMS!`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("A network error occurred while trying to save.");
    } finally {
      setIsSyncing(false);
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(vehicles, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicle-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = [
      "Name",
      "Base Price",
      "Down Payment",
      "Months",
      "Interest Rate",
      "Image URL",
      "Link",
    ];
    const rows = vehicles.map((v) => [
      `"${v.name}"`,
      v.basePrice,
      v.downPayment,
      v.installmentMonths,
      v.annualInterestRate,
      `"${v.imageUrl || ""}"`,
      `"${v.purchaseLink || ""}"`,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicle-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-6 border-b">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl text-primary">
                    <TruckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Turkey Vehicle Purchase Calculator
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Compare motorbike &amp; car purchases with real 2026
                      Turkish taxes, fees, and financing.
                    </p>
                  </div>
                </div>

                {/* Add & Export vehicle buttons */}
                <div className="flex flex-wrap gap-2 mt-3 items-center">
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

                  <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                  {/* SAVE TO CMS BUTTON */}
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={saveToCMS}
                    disabled={isSyncing}
                  >
                    <CloudArrowUpIcon className="h-3.5 w-3.5" />
                    {isSyncing ? "Saving..." : "Save to CMS"}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5 text-xs"
                    onClick={exportJSON}
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" /> JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5 text-xs"
                    onClick={exportCSV}
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5" /> CSV
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                    onClick={reset}
                  >
                    <ArrowPathIcon className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </div>

              {/* Currency Settings */}
              <div className="flex flex-col gap-1.5 bg-card p-3 rounded-xl border w-full md:w-auto shadow-sm">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                  <CurrencyDollarIcon className="h-3.5 w-3.5" />
                  Exchange Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">1 USD = </span>
                  <Input
                    type="number"
                    value={usdRate}
                    onChange={(e) =>
                      setUsdRate(Math.max(1, Number(e.target.value)))
                    }
                    className="h-8 w-20 text-sm font-bold text-center"
                    step={0.1}
                  />
                  <span className="text-sm font-semibold">₺</span>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>
                Pre-loaded with exactly matched 2026 Turkish fee templates.
                Update the <strong>USD</strong> rate at the top right to
                dynamically auto-convert the total values. Add an image URL and
                a purchase link inside the vehicle panels to keep track of the
                listings.
              </span>
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
                    usdRate={usdRate}
                    onUpdate={(updated) => updateVehicle(v.id, updated)}
                    onDuplicate={() => duplicateVehicle(i)}
                    onRemove={() => removeVehicle(i)}
                    showRemove={vehicles.length > 1}
                  />
                </TabsContent>
              ))}

              <TabsContent value="compare" className="mt-6">
                <ComparisonView vehicles={vehicles} usdRate={usdRate} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
