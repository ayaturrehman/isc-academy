import { NextResponse } from "next/server";
import { listSubjects, createSubject } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");
    
    const subjects = await listSubjects(classId);
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Failed to fetch subjects", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const class_id = payload?.class_id;
    const name = payload?.name?.trim();
    const description = payload?.description?.trim() || "";
    const book_id = payload?.book_id || null;
    const category_id = payload?.category_id || null;

    if (!class_id) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    const subject = await createSubject({ 
      class_id, 
      name, 
      description, 
      book_id, 
      category_id 
    });
    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error("Failed to create subject", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
