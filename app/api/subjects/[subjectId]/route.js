import { NextResponse } from "next/server";
import { getSubject, updateSubject, deleteSubject } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { subjectId } = await params;
    const subject = await getSubject(subjectId);
    
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    
    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Failed to fetch subject", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { subjectId } = await params;
    const payload = await request.json();
    const name = payload?.name?.trim();
    const description = payload?.description?.trim() || "";
    const book_id = payload?.book_id || null;
    const category_id = payload?.category_id || null;

    if (!name) {
      return NextResponse.json(
        { error: "Subject name is required" },
        { status: 400 }
      );
    }

    const subject = await updateSubject(subjectId, { 
      name, 
      description, 
      book_id, 
      category_id 
    });
    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Failed to update subject", error);
    if (error && error.code === "P2025") {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { subjectId } = await params;
    await deleteSubject(subjectId);
    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Failed to delete subject", error);
    if (error && error.code === "P2025") {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
