"use client";

import ItemRow from "@/components/itemRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Item } from "@/lib/types/ItemRow";
import { ArrowLeft, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProcessPage() {
  const router = useRouter();
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(true);

  const syncSession = (updatedItems: Item[]) => {
    const subtotal = updatedItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    const total = subtotal + tax + serviceCharge;

    sessionStorage.setItem("processedItems", JSON.stringify(updatedItems));
    sessionStorage.setItem(
      "receiptTotals",
      JSON.stringify({ subtotal, tax, serviceCharge, total })
    );
  };

  useEffect(() => {
    const img = sessionStorage.getItem("uploadedReceipt");
    const name = sessionStorage.getItem("uploadedReceiptName");
    const extracted = sessionStorage.getItem("extractedItems");
    const pajak = sessionStorage.getItem("pajak");
    const totalFromLLM = sessionStorage.getItem("total");

    if (!img || !name || !extracted) {
      router.push("/");
      return;
    }

    setReceiptImage(img);
    setReceiptName(name);

    try {
      const parsedItems = JSON.parse(extracted);
      const formattedItems = parsedItems.map((item: Item, idx: number) => ({
        ...item,
        id: String(idx + 1),
      }));
      setItems(formattedItems);

      const subtotalCalc = formattedItems.reduce(
        (s: number, it: Item) => s + it.price * it.quantity,
        0
      );

      // 🟢 Pastikan pajak ada
      const pajakNum = pajak ? Number(pajak) : 0;
      setTax(pajakNum);
      setServiceCharge(0);

      const totalCalc = totalFromLLM
        ? Number(totalFromLLM)
        : subtotalCalc + pajakNum;

      sessionStorage.setItem("pajak", pajakNum.toString());
      sessionStorage.setItem("processedTotal", totalCalc.toString());
      sessionStorage.setItem(
        "parsed",
        JSON.stringify({
          items: formattedItems,
          subtotal: subtotalCalc,
          pajak: pajakNum,
          total: totalCalc,
        })
      );
    } catch (e) {
      console.error("Parsing items error:", e);
    }

    setIsProcessing(false);
  }, [router]);

  const handleEditItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isEditing: true } : item
      )
    );
  };

  const handleSaveItem = (
    id: string,
    newName: string,
    newPrice: number,
    newQuantity: number
  ) => {
    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            name: newName,
            price: newPrice,
            quantity: newQuantity,
            isEditing: false,
          }
        : item
    );
    setItems(updated);
    syncSession(updated);
  };

  const handleCancelEdit = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isEditing: false } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    syncSession(updated);
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: "Item Baru",
      price: 0,
      quantity: 1,
      isEditing: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    syncSession(updated);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const calculatedTotal = subtotal + tax + serviceCharge;

  const handleContinue = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const storedTotal = sessionStorage.getItem("processedTotal");
    const finalTotal = storedTotal ? Number(storedTotal) : subtotal + tax;

    sessionStorage.setItem("processedItems", JSON.stringify(items));
    sessionStorage.setItem(
      "receiptTotals",
      JSON.stringify({
        subtotal,
        tax,
        serviceCharge,
        total: finalTotal,
      })
    );

    router.push("/friends");
  };

  if (!receiptImage || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="white" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proses Struk</h1>
            <p className="text-muted-foreground">
              Periksa dan edit item jika diperlukan
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Struk Asli</h3>
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <Image
                src={receiptImage || "/placeholder.svg"}
                alt="Uploaded receipt"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{receiptName}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Item Terdeteksi</h3>
              {isProcessing && <Badge variant="secondary">Memproses...</Badge>}
            </div>

            {isProcessing ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onEdit={() => handleEditItem(item.id)}
                    onSave={handleSaveItem}
                    onCancel={() => handleCancelEdit(item.id)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}

                <Button
                  variant="white"
                  className="w-full bg-transparent"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Item
                </Button>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pajak</span>
                    <span className="text-foreground">
                      Rp {tax.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Service Charge
                    </span>
                    <span className="text-foreground">
                      Rp {serviceCharge.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      Rp {calculatedTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <Button
                  variant={"white"}
                  className="w-full mt-6"
                  onClick={handleContinue}
                >
                  Lanjut ke Pembagian Teman
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
