import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    // Use the secure, non-public environment variable
    const apiKey = process.env.CORVEX_API_KEY;
    const COLLECTION_SLUG = "vehicles"; // Ensure this matches your CMS

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing CORVEX_API_KEY on server." },
        { status: 500 },
      );
    }

    // The server makes the request, bypassing browser CORS entirely
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
      const errorData = await res.json();
      console.error("CMS API Error:", errorData);
      return NextResponse.json(
        { error: "CMS error", details: errorData },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Server Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
