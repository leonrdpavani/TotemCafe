package com.example;

import java.util.*;

public class Cart {
    private List<CartItem> items = new ArrayList<>();

    public List<CartItem> getItems() { return items; }

    public void addItem(Item item, int qty) {
        for (CartItem ci : items) {
            if (ci.getItem().getId() == item.getId()) {
                ci.setQty(ci.getQty() + qty);
                return;
            }
        }
        items.add(new CartItem(item, qty));
    }

    public void removeItem(int id) {
        items.removeIf(ci -> ci.getItem().getId() == id);
    }

    public double getTotal() {
        double total = 0;
        for (int i = 0; i < items.size(); i++) {
            CartItem ci = items.get(i);
            total = total + ci.getItem().getPrice() * ci.getQty();
        }
        return total;
    }
}