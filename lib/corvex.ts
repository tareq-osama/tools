"use server"

// Corvex Builder – Multiplay workspace (ID: 12)
// Collection slugs and field names match what was created via MCP.

const CORVEX_API_URL = process.env.CORVEX_API_URL ?? "https://api.corvexbuilder.com"
const CORVEX_API_KEY = process.env.CORVEX_API_KEY ?? ""

async function corvexCreateItem(
  collectionSlug: string,
  title: string,
  fields: Record<string, unknown>
) {
  const res = await fetch(`${CORVEX_API_URL}/api/v1/collections/${collectionSlug}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CORVEX_API_KEY}`,
    },
    body: JSON.stringify({ title, fields, status: "published" }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Corvex API error ${res.status}: ${text}`)
  }

  return res.json()
}

// ── Profit Margin Simulations (collection ID: 79) ──────────────────────────

export interface ProfitMarginSimulationData {
  simulationName?: string
  price: number
  units: number
  cogsPerUnit: number
  adSpend: number
  expenses: Array<{ name: string; amount: number }>
  totalRevenue: number
  netProfit: number
  netMargin: number
  grossMargin: number
}

export async function saveProfitMarginSimulation(data: ProfitMarginSimulationData) {
  const title = data.simulationName || `PMC – ${new Date().toLocaleDateString()}`

  return corvexCreateItem("profit-margin-simulations", title, {
    "Simulation Name": data.simulationName ?? "",
    "Price": data.price,
    "Units": data.units,
    "COGS Per Unit": data.cogsPerUnit,
    "Ad Spend": data.adSpend,
    "Expenses": JSON.stringify(data.expenses),
    "Total Revenue": data.totalRevenue,
    "Net Profit": data.netProfit,
    "Net Margin": data.netMargin,
    "Gross Margin": data.grossMargin,
  })
}

// ── Conversion Engine Simulations (collection ID: 80) ─────────────────────

export interface ConversionEngineSimulationData {
  simulationName?: string
  visitors: number
  convRate: number
  aov: number
  ltv: number
  adSpend: number
  conversions: number
  expectedRevenue: number
  cac: number
  ltvCacRatio: number
}

export async function saveConversionEngineSimulation(data: ConversionEngineSimulationData) {
  const title = data.simulationName || `CE – ${new Date().toLocaleDateString()}`

  return corvexCreateItem("conversion-engine-simulations", title, {
    "Simulation Name": data.simulationName ?? "",
    "Visitors": data.visitors,
    "Conv Rate": data.convRate,
    "AOV": data.aov,
    "LTV": data.ltv,
    "Ad Spend": data.adSpend,
    "Conversions": data.conversions,
    "Expected Revenue": data.expectedRevenue,
    "CAC": data.cac,
    "LTV CAC Ratio": data.ltvCacRatio,
  })
}
export async function saveMarketingSimulation(data: any) {
  const title = `MS – ${new Date().toLocaleDateString()}`

  return corvexCreateItem("marketing-simulations", title, {
    "Ad Spend": data.adSpend,
    "Revenue": data.revenue,
    "Gross Margin": data.grossMargin,
    "New Customers": data.newCustomers,
    "Average LTV": data.avgLtv,
    "Impressions": data.impressions,
    "Clicks": data.clicks,
    "Retention Base": data.retentionBase,
    "Lost Customers": data.lostCustomers
  })
}

// ── Revenue Strategist Simulations (collection ID: 82) ─────────────────────

export interface RevenueSimulationData {
  simulationName?: string
  annualGoal: number
  churnRate: number
  offerings: Array<{ id: number; title: string }>
}

export async function saveRevenueSimulation(data: RevenueSimulationData) {
  const title = data.simulationName || `RS – ${new Date().toLocaleDateString()}`

  return corvexCreateItem("revenue-simulations", title, {
    "Annual Goal": data.annualGoal,
    "Churn Rate": data.churnRate,
    "Offerings": data.offerings
  })
}

export async function getRevenueOfferings() {
  const res = await fetch(`${CORVEX_API_URL}/api/v1/collections/revenue-offerings/items`, {
    headers: {
      Authorization: `Bearer ${CORVEX_API_KEY}`,
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Corvex fetch offerings error ${res.status}: ${text}`)
  }

  const json = await res.json()
  return json.data || []
}

// ── Inquiry Form Submission (form ID: 17) ─────────────────────────────

export async function submitInquiry(data: {
  fullName: string
  email: string
  interestPlan?: string
  simulationNotes?: string
}) {
  const res = await fetch(`${CORVEX_API_URL}/api/v1/forms/17/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CORVEX_API_KEY}`,
    },
    body: JSON.stringify({
      response_data: {
        "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2g3h4i5j": data.fullName,
        "b2c3d4e5-f6a7-4b6c-8d9e-1f2g3h4i5j6k": data.email,
        "c3d4e5f6-a7b8-4c7d-8e9f-2g3h4i5j6k7l": data.interestPlan,
        "d4e5f6a7-b8c9-4d8e-9faf-3g4h5i6j7k8m": data.simulationNotes
      }
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Corvex form submission error ${res.status}: ${text}`)
  }

  return res.json()
}
