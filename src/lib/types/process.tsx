import { Item } from "./ItemRow";

export interface IProcess {
    items: Item[];
    subtotal: number;
    pajak: number;
    total: number;
}