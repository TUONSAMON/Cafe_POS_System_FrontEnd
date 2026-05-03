import { api } from "./client";

export async function fetchOrders(params) {
  const res = await api.get("/api/orders", { params });
  return res.data || [];
}

export async function createOrder(payload) {
  const res = await api.post("/api/orders", payload);
  return res.data;
}

export async function updateOrder(id, payload) {
  const res = await api.put(`/api/orders/${id}`, payload);
  return res.data;
}

export async function deleteOrder(id) {
  await api.delete(`/api/orders/${id}`);
}
