import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

interface Receipt {
  id: string;
  total: number;
  items: any[];
  created_at: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total, items } = body as {
      total: number;
      items: any[];
    };

    const { data, error } = await supabase
      .from("receipts")
      .insert([{ total, items }])
      .select()
      .single<Receipt>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      message: "Receipt created successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
