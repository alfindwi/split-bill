import { ReceiptItem } from "./ReceiptItem"

export interface ReceiptData {
  merchantName: string
  items: ReceiptItem[]
  subtotal: number
  tax: number
  tip?: number
  total: number
  date?: string
}