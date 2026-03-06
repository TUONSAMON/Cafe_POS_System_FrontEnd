export function adaptProductFromApi(p) {
  // normalize available field (supports many possible backend field names)
  const available =
    p?.available ??
    p?.isAvailable ??
    p?.is_available ??
    false;

  return {
    id: p?.productId ?? p?.id,
    name: p?.name ?? { en: p?.productName ?? "", km: p?.productName ?? "" },
    price: Number(p?.price ?? 0),
    category: p?.category?.categoryName ?? p?.category ?? "Coffee",
    categoryId: p?.category?.categoryId ?? null,
    stockQty: Number(p?.stockQty ?? 0),
    available: Boolean(available),
    image: p?.imageUrl ?? p?.image ?? "",
    createdAt: p?.createdAt ?? new Date().toISOString(),
    updatedAt: p?.updatedAt ?? new Date().toISOString(),
  };
}

export function adaptProductToApi(uiProduct) {
  return {
    productName: uiProduct?.name?.en ?? "",
    price: Number(uiProduct?.price ?? 0),
    stockQty: Number(uiProduct?.stockQty ?? 0),
    available: Boolean(uiProduct?.available ?? true),
    imageUrl: uiProduct?.image ?? "",
    category: uiProduct?.categoryId
      ? { categoryId: uiProduct.categoryId }
      : undefined,
  };
}

export function adaptOrderToApi({
  items,
  totals,
  discountAmount,
  taxAmount,
  totalAmount,
  status,
  paymentMethod,
}) {
  return {
    orderType: "POS",
    orderStatus: status, // "paid" | "saved"
    subtotal: Number(totals.subtotal),
    discount: Number(discountAmount),
    tax: Number(taxAmount),
    totalAmount: Number(totalAmount),
    paymentMethod: paymentMethod ?? "none",
    orderDate: new Date().toISOString(),
    items: items.map((i) => ({
      productId: i.id,
      qty: i.qty,
      price: i.price,
    })),
  };
}
