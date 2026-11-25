import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request, { params }) {
  const { id } = await params; // Next.js 16: route params are async
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { record_type, title, description } = body;

  const { data, error } = await supabase
    .from("health_records")
    .update({ record_type, title, description })
    .eq("record_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: data });
}

export async function DELETE(request, { params }) {
  const { id } = await params; // Next.js 16: route params are async
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { error } = await supabase.from("health_records").delete().eq("record_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
