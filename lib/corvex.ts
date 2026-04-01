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
