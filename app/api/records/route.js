import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// FR2: create, view, update and delete structured health records.
// Note there is no manual "where user_id = ..." filter anywhere in this
// file - Row-Level Security (Section 3.5.3.2) does that automatically for
// every query made with this authenticated client.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data });
}

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { record_type, title, description } = body;

  if (!record_type || !title) {
    return NextResponse.json({ error: "record_type and title are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("health_records")
    .insert({ user_id: user.id, record_type, title, description })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: data }, { status: 201 });
}
