"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Friend } from "@/lib/types/friend";
import { ArrowLeft, Plus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const avatarColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
];

const avatarImages = [
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5357ae7371bb53cf9ec160_peep-52.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5350fb460080ed648acdc3_peep-7.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535d897488c25a204b12ff_peep-102.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5355338becbf1a2b523de5_peep-35.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5357c58becbf70a753467d_peep-53.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b408becbf85d3544d99_peep-82.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5358af8e24939dc40660de_peep-60.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e5359f2d39923046255369c_peep-71.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b9cd8713177a910e39b_peep-85.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b238becbfb1a454450e_peep-81.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b5e8becbf0e0b545ab7_peep-83.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535ddcd3992344b6572d31_peep-105.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53521c4600805ff88b3bb5_peep-16.png",
  "https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e53566fc992503ea6c77af5_peep-41.png",
];

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendName, setNewFriendName] = useState("");
  const [receiptTotal, setReceiptTotal] = useState(0);
  const [usedAvatar, setUsedAvatar] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedTotals = sessionStorage.getItem("receiptTotals");
    if (storedTotals) {
      const totals = JSON.parse(storedTotals);
      setReceiptTotal(totals.total);
    } else {
      router.push("/");
    }
  }, [router]);

  const getNextImage = () => {
    const available = avatarImages
      .map((_, index) => index)
      .filter((i) => !usedAvatar.includes(i));

    if (available.length === 0) {
      setUsedAvatar([]);
      return avatarImages[Math.floor(Math.random() * avatarImages.length)];
    }

    const randomIndex = available[Math.floor(Math.random() * available.length)];
    setUsedAvatar([...usedAvatar, randomIndex]);
    return avatarImages[randomIndex];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = () => {
    return avatarColors[Math.floor(Math.random() * avatarColors.length)];
  };

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      const newFriend: Friend = {
        id: Date.now().toString(),
        name: newFriendName.trim(),
        initials: getInitials(newFriendName.trim()),
        color: getRandomColor(),
        image: getNextImage(),
        items: [],
      };
      setFriends([...friends, newFriend]);
      setNewFriendName("");
    }
  };

  const handleRemoveFriend = (id: string) => {
    if (id !== "current-user") {
      setFriends(friends.filter((friend) => friend.id !== id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddFriend();
    }
  };

  const handleContinue = () => {
    
    if (friends.length >= 2) {
      sessionStorage.setItem("friends", JSON.stringify(friends));
      router.push("/assign");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="white" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tambah Teman</h1>
            <p className="text-muted-foreground">Siapa saja yang ikut makan?</p>
          </div>
        </div>

        {/* Bill Summary */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tagihan</p>
              <p className="text-2xl font-bold text-foreground">
                Rp {receiptTotal.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>

        {/* Add Friend Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="friend-name">Nama Teman</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="friend-name"
                  placeholder="Masukkan nama teman..."
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant={"white"}
                  className="w-10 h-8"
                  onClick={handleAddFriend}
                  disabled={!newFriendName.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Friends List */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              Daftar Teman ({friends.length})
            </h3>
          </div>

          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada teman yang ditambahkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.image} />
                      <AvatarFallback className={`${friend.color} text-white`}>
                        {friend.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {friend.name}
                      </p>
                      {friend.id === "current-user" && (
                        <p className="text-xs text-muted-foreground">Anda</p>
                      )}
                    </div>
                  </div>
                  {friend.id !== "current-user" && (
                    <Button
                      className="w-8"
                      size="sm"
                      variant="white"
                      onClick={() => handleRemoveFriend(friend.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Button
          className="w-full"
          variant={"white"}
          onClick={handleContinue}
          disabled={friends.length < 2}
        >
          {friends.length < 2
            ? "Tambah minimal 1 teman untuk melanjutkan"
            : `Lanjut ke Pembagian Item (${friends.length} orang)`}
        </Button>

        {friends.length >= 2 && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            Anda bisa menambah atau mengurangi teman di langkah selanjutnya
          </p>
        )}
      </div>
    </div>
  );
}
