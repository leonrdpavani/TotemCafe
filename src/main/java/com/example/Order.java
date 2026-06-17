package com.example;

import java.util.*;

public class Order implements Trackable {
    private int orderId;
    private List<CartItem> items;
    private double total;
    private String status;

    public Order(int orderId, List<CartItem> items, double total, String status) {
        this.orderId = orderId;
        this.items = items;
        this.total = total;
        this.status = status;
    }
    public int getOrderId() { return orderId; }
    public List<CartItem> getItems() { return items; }
    public double getTotal() { return total; }
    @Override
    public String getStatus() { return status; }
    @Override
    public void setStatus(String s) { status = s; }
}