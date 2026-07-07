import { NextResponse } from "next/server";
import { defaultModelProvider } from "@/lib/qvac";

/**
 * API route to preload or unload the local QVAC model.
 * Usage:
 * - GET /api/model/control?action=load
 * - GET /api/model/control?action=unload
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    if (action === "load") {
      console.log("[API/Model] Loading model in background...");
      const id = await defaultModelProvider.load();
      return NextResponse.json({ success: true, status: "loaded", modelId: id });
    } else if (action === "unload") {
      console.log("[API/Model] Unloading model...");
      await defaultModelProvider.unload();
      return NextResponse.json({ success: true, status: "unloaded" });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'load' or 'unload'." },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Model] Control action failed:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
