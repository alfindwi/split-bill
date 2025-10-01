"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemRowProps } from "@/lib/types/ItemRow";
import { Check, Edit2, X } from "lucide-react";
import { useState } from "react";

export default function ItemRow({
  item,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: ItemRowProps) {
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());

  const handleSave = () => {
    onSave(
      item.id,
      editName,
      Number.parseInt(editPrice) || 0,
      Number.parseInt(editQuantity) || 1
    );
  };

  if (item.isEditing) {
    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div>
          <Label htmlFor={`name-${item.id}`} className="mb-2">
            Nama Item
          </Label>
          <Input
            id={`name-${item.id}`}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`price-${item.id}`} className="mb-2">
              Harga
            </Label>
            <Input
              id={`price-${item.id}`}
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`qty-${item.id}`} className="mb-2">
              Jumlah
            </Label>
            <Input
              id={`qty-${item.id}`}
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="white" className="w-10" onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="white" className="w-10" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-foreground">{item.name}</div>
        <div className="text-sm text-muted-foreground">
          {item.quantity}x @ Rp {item.price.toLocaleString("id-ID")} = Rp{" "}
          {(item.price * item.quantity).toLocaleString("id-ID")}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="white" className="w-10" onClick={onEdit}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="white" className="w-10" onClick={onDelete}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
