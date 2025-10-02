import { ReceiptItem } from "./ReceiptItem";

export interface Friend {
  id: string;
  name: string;
  image?: string;
  color?: string;
  initials?: string;
  items: ReceiptItem[];
};

