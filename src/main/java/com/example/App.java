package com.example;

import static spark.Spark.*;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import spark.Request;
import spark.Session;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class App {
    static Gson gson = new Gson();
    static ArrayList<Item> catalog = new ArrayList<Item>();
    static ArrayList<Order> orders = new ArrayList<Order>();
    static int nextOrderId = 1;
    static final Path ORDERS_FILE = Paths.get("data", "orders.json");

    public static void main(String[] args) {
        port(4567);
        staticFiles.location("/public");

        catalog.add(new Item(1, "Café Expresso", "Dose pequena de expresso", 5.00));
        catalog.add(new Item(2, "Café Americano", "Expresso com água", 6.00));
        catalog.add(new Item(3, "Cappuccino", "Leite vaporizado + café", 8.50));
        catalog.add(new Item(4, "Latte", "Leite + expresso", 9.00));
        catalog.add(new Item(5, "Bolo de Chocolate", "Fatia generosa", 7.50));

        loadOrdersFromFile();

        get("/api/catalog", (req, res) -> {
            res.type("application/json");
            return gson.toJson(catalog);
        });

        post("/api/cart/add", (req, res) -> {
            res.type("application/json");
            Cart cart = getCart(req);

            Map body = gson.fromJson(req.body(), Map.class);
            Double idD = (Double) body.get("id");
            Double qtyD = (Double) body.get("qty");
            int id = idD.intValue();
            int qty = qtyD.intValue();

            Item item = findItem(id);
            if (item != null) {
                cart.addItem(item, qty);
            }

            return gson.toJson(cartAsMap(cart));
        });

        post("/api/cart/remove", (req, res) -> {
            res.type("application/json");
            Cart cart = getCart(req);

            Map body = gson.fromJson(req.body(), Map.class);
            Double idD = (Double) body.get("id");
            int id = idD.intValue();

            cart.removeItem(id);
            return gson.toJson(cartAsMap(cart));
        });

        get("/api/cart", (req, res) -> {
            res.type("application/json");
            return gson.toJson(cartAsMap(getCart(req)));
        });

        post("/api/checkout", (req, res) -> {
            res.type("application/json");
            Cart cart = getCart(req);

            if (cart.getItems().isEmpty()) {
                res.status(400);
                Map<String, Object> err = new HashMap<String, Object>();
                err.put("error", "Cart is empty");
                return gson.toJson(err);
            }

            ArrayList<CartItem> itemsCopy = new ArrayList<CartItem>();
            for (CartItem ci : cart.getItems()) {
                itemsCopy.add(ci);
            }

            Order order = new Order(nextOrderId, itemsCopy, cart.getTotal(), "Concluído");
            nextOrderId = nextOrderId + 1;
            orders.add(order);

            saveOrdersToFile();

            Session session = req.session(true);
            session.attribute("cart", new Cart());

            Map<String, Object> resp = new HashMap<String, Object>();
            resp.put("orderId", order.getOrderId());
            return gson.toJson(resp);
        });

        get("/api/orders", (req, res) -> {
            res.type("application/json");
            return gson.toJson(orders);
        });

        put("/api/orders/:id", (req, res) -> {
            res.type("application/json");
            String idStr = req.params(":id");
            int id = Integer.parseInt(idStr);
            Map body = gson.fromJson(req.body(), Map.class);
            String status = (String) body.get("status");
            Order target = null;
            for (Order o : orders) {
                if (o.getOrderId() == id) {
                    target = o; break;
                }
            }
            if (target == null) {
                res.status(404);
                Map<String, Object> err = new HashMap<String, Object>();
                err.put("error", "Order not found");
                return gson.toJson(err);
            }
            target.setStatus(status);
            saveOrdersToFile();
            return gson.toJson(target);
        });

        get("/", (req, res) -> {
            res.redirect("/index.html");
            return "";
        });

        get("/health", (req, res) -> "OK");
    }

    private static Map<String, Object> cartAsMap(Cart cart) {
        Map<String, Object> m = new HashMap<String, Object>();
        m.put("items", cart.getItems());
        m.put("total", cart.getTotal());
        return m;
    }

    private static Cart getCart(Request req) {
        Session session = req.session(true);
        Object o = session.attribute("cart");
        if (o == null) {
            Cart c = new Cart();
            session.attribute("cart", c);
            return c;
        } else {
            return (Cart) o;
        }
    }

    private static Item findItem(int id) {
        for (int i = 0; i < catalog.size(); i++) {
            Item it = catalog.get(i);
            if (it.getId() == id) {
                return it;
            }
        }
        return null;
    }

    private static void loadOrdersFromFile() {
        try {
            if (Files.exists(ORDERS_FILE)) {
                String json = new String(Files.readAllBytes(ORDERS_FILE), StandardCharsets.UTF_8);
                Type listType = new TypeToken<ArrayList<Order>>(){}.getType();
                ArrayList<Order> loaded = gson.fromJson(json, listType);
                if (loaded != null) {
                    orders = loaded;
                    int max = 0;
                    for (Order o : orders) if (o.getOrderId() > max) max = o.getOrderId();
                    nextOrderId = max + 1;
                }
            } else {
                Path dir = ORDERS_FILE.getParent();
                if (dir != null && !Files.exists(dir)) Files.createDirectories(dir);
                saveOrdersToFile();
            }
        } catch (IOException e) {
            System.err.println("Failed to load orders: " + e.getMessage());
        }
    }

    private static void saveOrdersToFile() {
        try {
            Path dir = ORDERS_FILE.getParent();
            if (dir != null && !Files.exists(dir)) Files.createDirectories(dir);
            String json = gson.toJson(orders);
            Files.write(ORDERS_FILE, json.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            System.err.println("Failed to save orders: " + e.getMessage());
        }
    }
}