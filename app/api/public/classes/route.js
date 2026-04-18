import { NextResponse } from "next/server";
import { listClasses } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const classes = await listClasses();
    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Failed to fetch public classes", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
