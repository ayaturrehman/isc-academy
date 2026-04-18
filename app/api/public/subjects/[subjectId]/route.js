import { NextResponse } from "next/server";
import { getSubject } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { subjectId } = await params;
    const subject = await getSubject(subjectId);
    
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    
    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Failed to fetch public subject", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}
