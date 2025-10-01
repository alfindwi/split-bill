import { ReceiptItem } from "./ReceiptItem"

export interface ItemRowProps {
  item: ReceiptItem
  onEdit: () => void
  onSave: (id: string, name: string, price: number, quantity: number) => void
  onCancel: () => void
  onDelete: () => void
}

export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
}