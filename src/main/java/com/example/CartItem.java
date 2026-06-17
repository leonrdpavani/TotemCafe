package com.example;

public class CartItem {
    private Item item;
    private int qty;

    public CartItem(Item item, int qty) {
        this.item = item;
        this.qty = qty;
    }
    public Item getItem() { return item; }
    public int getQty() { return qty; }
    public void setQty(int q) { this.qty = q; }
}