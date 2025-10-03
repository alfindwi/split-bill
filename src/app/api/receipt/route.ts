import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";


interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

interface FriendDetail {
  id: string;
  name: string;
  initials?: string;
  color?: string;
  image?: string;
  items: ReceiptItem[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subtotal, pajak, total, items } = body as {
      subtotal: number;
      pajak?: number;
      total: number;
      items: FriendDetail[];
    };

    // kalau pajak null/undefined → jadikan 0
    const pajakFinal = pajak ?? 0;

    const { data, error } = await supabase
      .from("receipts")
      .insert([{ subtotal, pajak: pajakFinal, total, items }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      message: "Receipt created successfully",
    });
  } catch (error) {
    return NextResponse.json("Error creating receipt", { status: 500 });
  }
}
