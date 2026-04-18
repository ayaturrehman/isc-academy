import { NextResponse } from "next/server";
import { getClass, updateClass, deleteClass, listSubjects } from "@/lib/db";

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
    console.error("Failed to fetch class", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { classId } = await params;
    const payload = await request.json();
    const name = payload?.name?.trim();
    const description = payload?.description?.trim() || "";

    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const cls = await updateClass(classId, { name, description });
    return NextResponse.json({ class: cls });
  } catch (error) {
    console.error("Failed to update class", error);
    if (error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Class name must be unique" },
        { status: 409 }
      );
    }
    if (error && error.code === "P2025") {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { classId } = await params;
    await deleteClass(classId);
    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Failed to delete class", error);
    if (error && error.code === "P2025") {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
