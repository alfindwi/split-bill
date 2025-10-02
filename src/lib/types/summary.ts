import { Friend } from "./friend";

export interface Summary {
  subtotal: number;
  pajak: number;
  total: number;
  bills: Record<string, number>;
  friends: Friend[];
};