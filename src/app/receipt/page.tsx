"use client";

import { useEffect, useState } from "react";

export default function Success() {
  const [summary, setSummary] = useState<{
    total: number;
    bills: Record<string, number>;
    friends: any[];
    
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("summary");
    if (stored) {
      setSummary(JSON.parse(stored));
    }
  }, []);

  console.log("ini sumarry " + summary);

  if (!summary) return null;

  return (
    <div className="font-sans w-full min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <h1 className="text-4xl font-bold text-black mb-6">Success</h1>

      <div className="text-xl font-semibold mb-4">
        Total Belanja: Rp {summary.total.toLocaleString("id-ID")}
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-3">Tagihan Teman</h2>
        <ul className="space-y-2">
          {Object.entries(summary.bills).map(([friendId, amount]) => {
            const friend = summary.friends.find((f) => f.id === friendId);
            return (
              <li
                key={friendId}
                className="flex justify-between items-center border-b pb-2"
              >
                <span>{friend?.name || "Unknown"}</span>
                <span className="font-semibold">
                  Rp {amount.toLocaleString("id-ID")}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
