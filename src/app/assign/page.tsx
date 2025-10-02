"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Friend } from "@/lib/types/friend";
import { Item } from "@/lib/types/ItemRow";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const formatRupiah = (n: number) => {
  return `Rp ${n.toLocaleString("id-ID")}`;
};

export default function AssignItemsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const storedItems = sessionStorage.getItem("processedItems");
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (err) {
        console.error("Error parsing items:", err);
      }
    }
  }, []);

  useEffect(() => {
    const storedFriends = sessionStorage.getItem("friends");
    if (storedFriends) {
      setFriends(JSON.parse(storedFriends));
    }
  }, []);

  const [assignments, setAssignments] = useState<
    Record<string, { friendId: string; quantity: number }[]>
  >({});

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const getAssignedQuantity = (itemId: string) =>
    (assignments[itemId] || []).reduce((s, a) => s + a.quantity, 0);

  const remainingQuantity = (item: Item) =>
    item.quantity - getAssignedQuantity(item.id);

  const selectFriend = (friendId: string) => {
    setSelectedFriendId((prev) => (prev === friendId ? null : friendId));
    setSelectedItemId(null);
  };

  const selectItem = (itemId: string) => {
    if (!selectedFriendId) {
      alert("Pilih teman dulu sebelum assign item!");
      setSelectedItemId(null);
      return;
    }

    assignToItem(itemId, selectedFriendId);
  };

  const assignToItem = (itemId: string, friendId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const rem = remainingQuantity(item);
    if (rem <= 0) return;

    setAssignments((prev) => {
      const arr = prev[itemId] ? [...prev[itemId]] : [];
      const found = arr.find((x) => x.friendId === friendId);
      if (found) {
        if (getAssignedQuantity(itemId) < item.quantity) {
          found.quantity += 1;
        }
      } else {
        arr.push({ friendId, quantity: 1 });
      }
      return { ...prev, [itemId]: arr };
    });
  };

  const unassign = (itemId: string, friendId: string) => {
    setAssignments((prev) => {
      const arr = prev[itemId] ? [...prev[itemId]] : [];
      const idx = arr.findIndex((x) => x.friendId === friendId);
      if (idx === -1) return prev;
      arr[idx].quantity -= 1;
      if (arr[idx].quantity <= 0) arr.splice(idx, 1);
      return { ...prev, [itemId]: arr };
    });
  };

  const confirmAssignments = async () => {
    if (!items.length) return;

    const parsedRaw = sessionStorage.getItem("parsed");
    let subtotal = 0;
    let pajak = 0;
    let total = 0;

    if (parsedRaw) {
      try {
        const parsed = JSON.parse(parsedRaw);
        subtotal = parsed.subtotal;
        pajak = parsed.pajak;
        total = subtotal + pajak;
      } catch (err) {
        console.error("Error parsing parsed data:", err);
      }
    } else {
      subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      pajak = Math.round(subtotal * 0.1);
      total = subtotal + pajak;
    }

    const bills: Record<string, number> = {};
    const friendDetails: {
      id: string;
      name: string;
      image?: string;
      items: { name: string; price: number; quantity: number }[];
    }[] = friends.map((f) => ({ ...f, items: [] }));

    items.forEach((item) => {
      const assigned = assignments[item.id] || [];
      assigned.forEach((a) => {
        const cost = a.quantity * item.price;

        bills[a.friendId] = (bills[a.friendId] || 0) + cost;

        const friend = friendDetails.find((f) => f.id === a.friendId);
        if (friend) {
          friend.items.push({
            name: item.name,
            price: item.price,
            quantity: a.quantity,
          });
        }
      });
    });

    sessionStorage.setItem(
      "summary",
      JSON.stringify({ subtotal, pajak, total, bills, friends: friendDetails })
    );

    try {
      const res = await fetch("api/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total,
          items: friendDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal simpan receipt");

      console.log("Receipt tersimpan di Supabase:", data);
      router.push(`/receipt/${data.id}`);
    } catch (error) {
      console.log(error);
      alert("Terjadi kesalahan. Coba lagi.");
    }
  };

  const allAssigned = items.every((item) => remainingQuantity(item) === 0);


  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="white" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tambah Item</h1>
            <p className="text-muted-foreground">
              Ketuk teman lalu atur item, atau sebaliknya
            </p>
          </div>
        </div>

        {/* Friends */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">Friends</h2>
          <div className="flex space-x-2">
            {friends.map((f) => (
              <div
                key={f.id}
                onClick={() => selectFriend(f.id)}
                className={`flex flex-col items-center cursor-pointer p-2 rounded-lg`}
              >
                {f.image ? (
                  <img
                    src={f.image}
                    alt={f.name}
                    className={`w-14 h-14 rounded-full object-cover  ${
                      selectedFriendId === f.id
                        ? "bg-indigo-100 ring-3 ring-[#BBDCE5]"
                        : ""
                    }`}
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                      f.color
                    }  ${
                      selectedFriendId === f.id ? "ring-3 ring-[#BBDCE5]" : ""
                    }`}
                  >
                    {f.initials}
                  </div>
                )}
                <div className="mt-2 text-sm font-medium">{f.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h2 className="font-medium mb-3">Items</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const rem = remainingQuantity(item);
              return (
                <div
                  key={item.id}
                  onClick={() => selectItem(item.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer 
                    ${
                      selectedItemId === item.id
                        ? "bg-indigo-50 ring-2 ring-[#647FBC]"
                        : "hover:bg-indigo-50"
                    }`}
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} pcs • {formatRupiah(item.price)} / pcs
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Remaining: <span className="font-semibold">{rem}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(assignments[item.id] || []).map((a) => {
                        const friend = friends.find(
                          (f) => f.id === a.friendId
                        )!;
                        return (
                          <button
                            key={a.friendId}
                            onClick={(e) => {
                              e.stopPropagation();
                              unassign(item.id, a.friendId);
                            }}
                            className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full text-xs"
                          >
                            <Avatar className="w-7 h-7 ">
                              <AvatarImage
                                src={friend.image}
                                className=" contained"
                              />
                              <AvatarFallback
                                className={`${friend.color} text-white`}
                              >
                                {friend.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="px-2">×{a.quantity}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">
                      {formatRupiah(item.price * item.quantity)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRupiah(item.price)} / pcs
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="white"
            disabled={!allAssigned}
            className="w-full"
            onClick={confirmAssignments}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
