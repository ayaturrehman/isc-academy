import { NextResponse } from "next/server";
import { listSubjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    
    const subjects = await listSubjects(categoryId);
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Failed to fetch public subjects", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
