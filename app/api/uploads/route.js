import { NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/uploads";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("banner");
    const url = await saveUploadedImage(file);
    if (!url) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 400 });
  }
}
