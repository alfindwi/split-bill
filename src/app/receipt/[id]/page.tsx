"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Friend } from "@/lib/types/friend";
import { ReceiptItem } from "@/lib/types/ReceiptItem";
import { Summary } from "@/lib/types/summary";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Success() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    async function fetchReceipt() {
      if (!id) return;

      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const friends: Friend[] = Array.isArray(data.items) ? data.items : [];

      const allItems: ReceiptItem[] = friends.flatMap((f) =>
        f.items.map((it: any) => ({ ...it, friendId: f.id }))
      );

      const subtotal = allItems.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      );

      const pajak = data.pajak ?? subtotal * 0.1;
      const total = data.total ?? subtotal + pajak;

      const bills: Record<string, number> = {};
      for (const item of allItems) {
        if (!bills[item.friendId!]) bills[item.friendId!] = 0;
        bills[item.friendId!] += (item.price || 0) * (item.quantity || 0);
      }

      setSummary({
        subtotal,
        pajak,
        total,
        bills,
        friends,
      });
    }

    fetchReceipt();
  }, [id]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("URL copied to clipboard!");
    });
  };

  if (!summary)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="font-sans w-full min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div id="receipt" className="max-w-md mx-auto">
          <div className="mb-6">
            <p className="text-md text-black">Jumlah Total</p>
            <h2 className="text-3xl font-extrabold text-foreground">
              Rp {summary.total.toLocaleString("id-ID")}
            </h2>
          </div>

          {summary.friends.map((friend) => (
            <div key={friend.id} className="mb-6">
              <div className="bg-transparent rounded-md p-3 flex items-center gap-3 border-b pb-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={friend.image} />
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold">
                    Total Tagihan {friend.name}
                  </h2>
                  <h2 className="text-md font-semibold">
                    Rp {(summary.bills[friend.id] ?? 0).toLocaleString("id-ID")}
                  </h2>
                </div>
              </div>

              <div className="py-2">
                {friend.items.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex justify-between items-center text-sm mb-2"
                  >
                    <p className="flex-1">{item.name}</p>
                    <p className="w-12 text-center">x {item.quantity}</p>
                    <p className="w-20 text-right">
                      {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button className="w-full mt-4" variant="white" onClick={handleCopyUrl}> 
            Salin Tautan
          </Button>
        </div>
      </div>
    </div>
  );
}
