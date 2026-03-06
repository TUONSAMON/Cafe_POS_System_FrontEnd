import { api } from "./api";
import { adaptProductFromApi, adaptProductToApi } from "./adapters";

export async function fetchProducts({ categoryId, search, available }) {
  const params = {};
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;
  if (available) params.available = true;

  const res = await api.get("/api/products", { params });
  return (res.data || []).map(adaptProductFromApi);
}

export async function createProduct(uiProduct) {
  const payload = adaptProductToApi(uiProduct);
  const res = await api.post("/api/products", payload);
  return adaptProductFromApi(res.data);
}

export async function updateProduct(id, uiProduct) {
  const payload = adaptProductToApi(uiProduct);
  const res = await api.put(`/api/products/${id}`, payload);
  return adaptProductFromApi(res.data);
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
}
