import { NextResponse } from "next/server";
import { listClasses, createClass } from "@/lib/db";

export async function GET() {
  try {
    const classes = await listClasses();
    return NextResponse.json({ classes });
  } catch (error) {
    console.error("Failed to fetch classes", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = payload?.name?.trim();
    const description = payload?.description?.trim() || "";

    if (!name) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 }
      );
    }

    const cls = await createClass({ name, description });
    return NextResponse.json({ class: cls }, { status: 201 });
  } catch (error) {
    console.error("Failed to create class", error);
    if (error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Class name must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
