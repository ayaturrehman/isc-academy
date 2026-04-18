import { NextResponse } from "next/server";
import { getClass, listSubjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { classId } = await params;
    const cls = await getClass(classId);
    
    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const subjects = await listSubjects(classId);
    
    return NextResponse.json({ class: cls, subjects });
  } catch (error) {
    console.error("Failed to fetch public class", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}
