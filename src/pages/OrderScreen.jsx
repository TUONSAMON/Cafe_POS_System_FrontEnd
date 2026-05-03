import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  CreditCard,
  ChevronDown,
  Upload,
  ImageIcon,
  Save,
  Edit2,
  QrCode,
  Clock,
  History,
  Printer,
  AlertCircle,
  ShoppingCart,
  FileText,
  CheckCircle2,
  Copy,
  Filter,
} from "lucide-react";

import { useCart } from "../hooks/useCart";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import myQrCode from "../assets/qr.jpg";

import TRANSLATIONS from "../translations";
import { api } from "../api/client";
import { getImageUrl } from "../api/helper";
import { getOrderDetails } from "../api/orderService";
import { QRCodeCanvas } from "qrcode.react";
const TAX_RATE = 0.015;
const DEFAULT_DISCOUNT = 20;

const FALLBACK_CATEGORIES = ["Coffee", "Beverages", "BBQ", "Snacks"];

const getCurrentDate = () => new Date().toISOString();

const formatDate = (dateString, lang = "en") => {
  if (!dateString) return "";
  const date = new Date(dateString);

  // if (lang === "km") {
  //   return date.toLocaleDateString("km-KH", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // }

  // return date.toLocaleDateString("en-US", {
  //   year: "numeric",
  //   month: "short",
  //   day: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  // });
};

function translateCategory(c) {
  const map = {
    Coffee: "កាហ្វេ",
    Beverages: "ភេសជ្ជៈ",
    BBQ: "អាំង",
    Snacks: "អាហារសម្រន់",
    Deserts: "នំ",
  };
  return map[c] || c;
}

function getDefaultImageByCategory(category) {
  const defaults = {
    Coffee:
      "https://images.unsplash.com/photo-1513118171418-46b8c4e07e43?w=300&h=200&fit=crop",
    Beverages:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=200&fit=crop",
    BBQ: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop",
    Snacks:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop",
    General:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
  };

  return defaults[category] || defaults.General;
}

function normalizeImageUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();

  if (
    trimmed.includes("images.unsplash.com/photo-") &&
    !trimmed.includes("?")
  ) {
    return `${trimmed}?w=800&auto=format&fit=crop&q=80`;
  }

  return trimmed;
}

// -------------------- BACKEND <-> UI MAPPERS --------------------
function toUiProduct(apiProduct, categoriesById) {
  const id = apiProduct?.productId ?? apiProduct?.id;
  const productName =
    apiProduct?.productName ??
    apiProduct?.name ??
    apiProduct?.product_name ??
    "";

  const price = Number(apiProduct?.price ?? 0);
  const stockQty = Number(apiProduct?.stockQty ?? apiProduct?.stock_qty ?? 0);
  const cost = Number(apiProduct?.cost ?? 0);

  const available =
    typeof apiProduct?.available === "boolean"
      ? apiProduct.available
      : typeof apiProduct?.isAvailable === "boolean"
        ? apiProduct.isAvailable
        : typeof apiProduct?.is_available === "boolean"
          ? apiProduct.is_available
          : true;

  const categoryId =
    apiProduct?.category?.categoryId ??
    apiProduct?.categoryId ??
    apiProduct?.category_id;

  const categoryName =
    apiProduct?.category?.categoryName ??
    apiProduct?.categoryName ??
    categoriesById?.[categoryId]?.categoryName ??
    "Coffee";

  const image =
    apiProduct?.image ??
    apiProduct?.imageUrl ??
    apiProduct?.image_url ??
    getDefaultImageByCategory(categoryName);

  return {
    id,
    categoryId: categoryId ?? null,
    category: categoryName,
    name: { en: productName, km: productName },
    price,
    cost,
    stockQty,
    available,
    image,
    createdAt:
      apiProduct?.createdAt ?? apiProduct?.createAt ?? getCurrentDate(),
    updatedAt: apiProduct?.updatedAt ?? getCurrentDate(),
  };
}

function toApiProduct(uiProduct, categoryId) {
  return {
    productName: uiProduct?.name?.en ?? "",
    price: Number(uiProduct?.price ?? 0),
    cost: Number(uiProduct?.cost ?? 0),
    stockQty: Number(uiProduct?.stockQty ?? 0),
    available: !!uiProduct?.available,
    isAvailable: !!uiProduct?.available,
    category: categoryId ? { categoryId } : null,
    image: uiProduct?.image ?? null,
  };
}

function toUiOrder(apiOrder, productsById) {
  const id = apiOrder?.orderId ?? apiOrder?.id;
  const timestamp =
    apiOrder?.orderDate ?? apiOrder?.timestamp ?? apiOrder?.createdAt;

  const rawStatus = apiOrder?.orderStatus ?? apiOrder?.status ?? "saved";
  const status = String(rawStatus).toLowerCase() === "paid" ? "paid" : "saved";

  const total = Number(apiOrder?.totalAmount ?? apiOrder?.total ?? 0);

  const details =
    apiOrder?.orderDetails ??
    apiOrder?.items ??
    apiOrder?.orderDetailList ??
    [];

  const items = Array.isArray(details)
    ? details.map((d) => {
        const pid =
          d?.product?.productId ?? d?.productId ?? d?.product_id ?? d?.id;

        const p = productsById?.[pid];

        const productName =
          p?.name?.en ??
          d?.product?.productName ??
          d?.productName ??
          d?.name ??
          "Unknown item";

        const qty = Number(d?.quantity ?? d?.qty ?? 1);
        const price = Number(d?.unitPrice ?? d?.price ?? p?.price ?? 0);

        return {
          id: pid,
          name: { en: productName, km: productName },
          qty,
          price,
          image:
            p?.image ??
            d?.product?.image ??
            getDefaultImageByCategory(p?.category ?? "General"),
        };
      })
    : [];

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const discount = Number(apiOrder?.discount ?? 0);
  const tax = Number(apiOrder?.tax ?? subtotal * TAX_RATE);

  return {
    id,
    timestamp: timestamp ?? getCurrentDate(),
    status,
    paymentMethod:
      apiOrder?.paymentMethod ?? (status === "paid" ? "qr" : "none"),
    items,
    subtotal: Number(apiOrder?.subTotal ?? subtotal),
    discount,
    tax,
    total: total || subtotal - discount + tax,
  };
}

function buildOrderPayload({ items, status, user }) {
  return {
    userId: user?.userId ?? null,
    customerId: null,
    tableId: null,
    orderType: "POS",
    orderStatus: status?.toUpperCase?.() ?? "SAVED",
    items: items.map((it) => ({
      productId: it.id,
      quantity: it.qty,
      unitPrice: it.price,
    })),
  };
}

// -------------------- API CALL HELPERS --------------------
async function apiGetCategories() {
  const res = await api.get("/api/categories");
  return res.data;
}

async function apiCreateCategory(payload) {
  const res = await api.post("/api/categories", payload);
  return res.data;
}

async function apiUpdateCategory(id, payload) {
  const res = await api.put(`/api/categories/${id}`, payload);
  return res.data;
}

async function apiDeleteCategory(id) {
  const res = await api.delete(`/api/categories/${id}`);
  return res.data;
}

async function apiGetProducts(params = {}) {
  const res = await api.get("/api/products", { params });
  return res.data;
}

async function apiCreateProduct(payload) {
  const res = await api.post("/api/products", payload);
  return res.data;
}

async function apiUpdateProduct(id, payload) {
  const res = await api.put(`/api/products/${id}`, payload);
  return res.data;
}

async function apiDeleteProduct(id) {
  const res = await api.delete(`/api/products/${id}`);
  return res.data;
}

async function apiGetOrders() {
  const res = await api.get("/api/orders");
  return res.data;
}

async function apiCreateOrder(payload) {
  const res = await api.post("/api/orders", payload);
  return res.data;
}

async function apiUpdateOrder(id, payload) {
  const res = await api.put(`/api/orders/${id}`, payload);
  return res.data;
}

async function apiDeleteOrder(id) {
  const res = await api.delete(`/api/orders/${id}`);
  return res.data;
}

async function apiPayOrder(id, payload) {
  const res = await api.post(`/api/orders/${id}/pay`, payload);
  return res.data;
}

export default function OrderScreen() {
  const { lang } = useLang();
  const { user } = useAuth();
  const isAdmin = String(user?.role?.roleName || "").toUpperCase() === "ADMIN";

  const { items, updateQty, removeFromCart, totals, addToCart, clearCart } =
    useCart();

  const t = (key) => TRANSLATIONS?.[lang]?.orderScreen?.[key] ?? key;

  // -------------------- BACKEND DATA STATE --------------------
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // -------------------- CATEGORY CRUD UI STATE --------------------
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState("add");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryNameInput, setCategoryNameInput] = useState("");

  // -------------------- UI STATE --------------------
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [discountPercent, setDiscountPercent] = useState(DEFAULT_DISCOUNT);
  const discountAmount = totals.subtotal * (discountPercent / 100);
  const taxAmount = (totals.subtotal - discountAmount) * TAX_RATE;
  const totalAmount = totals.subtotal - discountAmount + taxAmount;

  const [showItemModal, setShowItemModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  const [modalMode, setModalMode] = useState("add");
  const [editingItemId, setEditingItemId] = useState(null);

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "Coffee",
    image: null,
    imagePreview: null,
    imageUrl: "",
  });

  const [uploadMethod, setUploadMethod] = useState("url");
  const [isUploading, setIsUploading] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [addSuccessItem, setAddSuccessItem] = useState(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const changeAmount = Number(cashReceived || 0) - totalAmount;

  const fileInputRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  const [removingCartItemId, setRemovingCartItemId] = useState(null);
  // Order history filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  // KHQR state
  const [qrCode, setQrCode] = useState("");
  const [khqrOrderId, setKhqrOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [hasPrintedReceipt, setHasPrintedReceipt] = useState(false);

  // -------------------- DERIVED MAPS --------------------
  const categoriesById = useMemo(() => {
    const map = {};
    for (const c of categories) map[c.categoryId] = c;
    return map;
  }, [categories]);

  const categoryIdByName = useMemo(() => {
    const map = {};
    for (const c of categories) map[c.categoryName] = c.categoryId;
    return map;
  }, [categories]);

  const productsById = useMemo(() => {
    const map = {};
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories.map((c) => c.categoryName);
    return FALLBACK_CATEGORIES;
  }, [categories]);

  // -------------------- LOAD CATEGORIES + PRODUCTS --------------------
  useEffect(() => {
    const load = async () => {
      let cats = [];

      try {
        const resCats = await apiGetCategories();
        cats = Array.isArray(resCats) ? resCats : [];
        setCategories(cats);
      } catch {
        setCategories([]);
        cats = [];
      }

      const localCategoriesById = {};
      for (const c of cats) localCategoriesById[c.categoryId] = c;

      setLoadingProducts(true);
      try {
        const raw = await apiGetProducts();
        const list = Array.isArray(raw) ? raw : [];
        setProducts(list.map((p) => toUiProduct(p, localCategoriesById)));
      } catch (e) {
        alert(`Products API error: ${e?.response?.data?.message ?? e.message}`);
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, []);

  // -------------------- CATEGORY CRUD HANDLERS --------------------
  const openAddCategory = () => {
    setCategoryModalMode("add");
    setEditingCategoryId(null);
    setCategoryNameInput("");
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setCategoryModalMode("edit");
    setEditingCategoryId(cat.categoryId);
    setCategoryNameInput(cat.categoryName);
    setShowCategoryModal(true);
  };

  const refreshCategories = async () => {
    const cats = await apiGetCategories();
    setCategories(Array.isArray(cats) ? cats : []);
  };

  const handleSaveCategory = async () => {
    const name = categoryNameInput.trim();
    if (!name) return;

    try {
      if (categoryModalMode === "add") {
        await apiCreateCategory({ categoryName: name });
        alert(t("categoryAdded"));
      } else {
        await apiUpdateCategory(editingCategoryId, { categoryName: name });
        alert(t("categoryUpdated"));
      }

      await refreshCategories();
      setShowCategoryModal(false);
      setCategoryNameInput("");
    } catch (e) {
      alert(`Category API error: ${e?.response?.data?.message ?? e.message}`);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const hasProducts = products.some((p) => p.categoryId === cat.categoryId);
    if (hasProducts) {
      alert(t("cannotDeleteCategory"));
      return;
    }

    if (
      !window.confirm(`${t("confirmDeleteCategory")} "${cat.categoryName}"?`)
    ) {
      return;
    }

    try {
      await apiDeleteCategory(cat.categoryId);
      await refreshCategories();

      if (category === cat.categoryName) setCategory("All");

      alert(t("categoryDeleted"));
    } catch (e) {
      console.error(e);
      alert(
        `Delete category error: ${e?.response?.data?.message ?? e.message}`,
      );
    }
  };

  // -------------------- LOAD ORDERS --------------------
  const refreshOrders = async () => {
    setLoadingOrders(true);

    try {
      const raw = await apiGetOrders();
      const list = Array.isArray(raw) ? raw : [];

      const ordersWithDetails = await Promise.all(
        list.map(async (order) => {
          const orderId = order?.orderId ?? order?.id;

          const details = await getOrderDetails(orderId);

          return {
            ...order,
            orderDetails: Array.isArray(details) ? details : [],
          };
        }),
      );

      setOrders(ordersWithDetails.map((o) => toUiOrder(o, productsById)));
    } catch (e) {
      console.error("Orders API error:", e);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };
  useEffect(() => {
    refreshOrders();
  }, [products.length]);

  // -------------------- PRODUCT FILTERING --------------------
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base =
      category === "All"
        ? products
        : products.filter((p) => p.category === category);

    if (!q) return base;

    return base.filter((p) =>
      (p?.name?.[lang] ?? "").toLowerCase().includes(q),
    );
  }, [products, category, search, lang]);

  // -------------------- TOAST --------------------
  useEffect(() => {
    if (showAddSuccess && addSuccessItem) {
      const timer = setTimeout(() => {
        setShowAddSuccess(false);
        setAddSuccessItem(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showAddSuccess, addSuccessItem]);

  // -------------------- CART ACTIONS --------------------
  const handleQuickAdd = (product, event) => {
    if (event) event.stopPropagation();

    setQuickAddProduct(product.id);

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });

    setAddSuccessItem(product.name?.[lang] ?? "");
    setShowAddSuccess(true);

    setTimeout(() => setQuickAddProduct(null), 500);
  };

  const handleAddWithQuantity = (product, quantity = 1) => {
    if (quantity <= 0) return;

    setQuickAddProduct(product.id);

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: quantity,
    });

    setAddSuccessItem(`${product.name?.[lang] ?? ""} (${quantity})`);
    setShowAddSuccess(true);

    setTimeout(() => setQuickAddProduct(null), 500);
  };

  // -------------------- MODAL: ADD / EDIT PRODUCT --------------------
  const openAddItemModal = () => {
    setModalMode("add");
    setEditingItemId(null);
    setImageError(false);
    setNewItem({
      name: "",
      price: "",
      category: categoryOptions?.[0] ?? "Coffee",
      image: null,
      imagePreview: null,
      imageUrl: "",
    });
    setUploadMethod("url");
    setShowItemModal(true);
  };

  const openEditItemModal = (product) => {
    setModalMode("edit");
    setEditingItemId(product.id);
    setImageError(false);
    setNewItem({
      name: product?.name?.en ?? "",
      price: String(product?.price ?? ""),
      category: product?.category ?? categoryOptions?.[0] ?? "Coffee",
      image: null,
      imagePreview: null,
      imageUrl: product?.image ?? "",
    });
    setUploadMethod("url");
    setShowItemModal(true);
  };

  const openFileInput = () => fileInputRef.current?.click();

  const resetImage = () => {
    setImageError(false);
    setNewItem((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
      imageUrl: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert(t("selectImageFile"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t("fileTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setNewItem((prev) => ({
        ...prev,
        image: file,
        imagePreview: e.target.result,
        imageUrl: "",
      }));
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert(t("enterNamePrice"));
      return;
    }

    let imageUrl = normalizeImageUrl(newItem.imageUrl || "");

    if (uploadMethod === "file" && newItem.image) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", newItem.image);

        const res = await api.post("/api/products/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = String(res.data).trim();
      } catch (err) {
        console.error("Upload error:", err);
        const errorMsg = err.response?.data || err.message || t("uploadFailed");
        alert(errorMsg);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (!imageUrl) {
      imageUrl = getDefaultImageByCategory(newItem.category);
    }

    const catId = categoryIdByName[newItem.category];
    if (!catId && categories.length > 0) {
      alert(`${t("categoryNotFound")} "${newItem.category}"`);
      return;
    }

    try {
      const uiPayload = {
        name: { en: newItem.name, km: newItem.name },
        price: parseFloat(newItem.price),
        category: newItem.category,
        available: true,
        stockQty: 0,
        cost: 0,
        image: imageUrl,
      };

      let result;
      if (modalMode === "add") {
        result = await apiCreateProduct(toApiProduct(uiPayload, catId));
      } else {
        result = await apiUpdateProduct(
          editingItemId,
          toApiProduct(uiPayload, catId),
        );
      }

      const mapped = toUiProduct(result, categoriesById);
      mapped.image = getImageUrl(imageUrl);

      if (modalMode === "add") {
        setProducts((prev) => [mapped, ...prev]);
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingItemId ? mapped : p)),
        );
      }

      alert(modalMode === "add" ? t("addItemSuccess") : t("updateItemSuccess"));
      setShowItemModal(false);
      resetImage();
    } catch (e) {
      console.error("Save item error:", e);
      alert(`Save product error: ${e?.response?.data?.message ?? e.message}`);
    }
  };

  const handleDeleteItem = async (productId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(t("confirmDelete"))) return;

    try {
      await apiDeleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      const cartItem = items.find((it) => it.id === productId);
      if (cartItem) removeFromCart(productId);

      alert(t("deleteItemSuccess"));
    } catch (err) {
      console.error(err);
      alert(
        `Delete product error: ${err?.response?.data?.message ?? err.message}`,
      );
    }
  };

  // -------------------- ORDER ACTIONS --------------------
  const handleCancelOrder = () => {
    if (window.confirm(t("confirmCancel"))) {
      clearCart();
      setDiscountPercent(DEFAULT_DISCOUNT);
      setEditingOrderId(null);
    }
  };

  const handleSaveOrder = async () => {
    if (items.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    const payload = buildOrderPayload({
      items,
      status: "saved",
      user,
    });

    try {
      if (editingOrderId) {
        await apiUpdateOrder(editingOrderId, payload);
        setEditingOrderId(null);
      } else {
        await apiCreateOrder(payload);
      }

      await refreshOrders();
      clearCart();
      setDiscountPercent(DEFAULT_DISCOUNT);
      alert(t("orderSaved"));
    } catch (e) {
      console.error(e);
      alert(`Save order error: ${e?.response?.data?.message ?? e.message}`);
    }
  };

  const openPaymentModal = async () => {
    if (items.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    try {
      setPaymentStatus("generating");

      const createPayload = buildOrderPayload({
        items,
        status: "saved",
        user,
      });

      let orderId = editingOrderId;

      if (editingOrderId) {
        await apiUpdateOrder(editingOrderId, createPayload);
      } else {
        const createdOrder = await apiCreateOrder(createPayload);
        orderId = createdOrder?.orderId ?? createdOrder?.id;
      }

      const res = await api.post(`/api/khqr/create/${orderId}`);

      setKhqrOrderId(orderId);
      setQrCode(res.data.qr);
      setShowQRModal(true);
      setPaymentStatus("waiting");
      setHasPrintedReceipt(false);
      startKhqrChecking(orderId);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message ?? e.message);
      setPaymentStatus("idle");
    }
  };

  const startKhqrChecking = (orderId) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/khqr/status/${orderId}`);

        if (res.data.status === "PAID") {
          clearInterval(interval);

          if (hasPrintedReceipt) return;
          setHasPrintedReceipt(true);
          setHasPrintedReceipt(true);

          const now = new Date().toISOString();

          const receiptOrder = toUiOrder(
            {
              orderId,
              id: orderId,
              orderStatus: "PAID",
              status: "paid",
              orderDate: now,
              timestamp: now,
              totalAmount,
              orderDetails: items.map((item) => ({
                productId: item.id,
                quantity: item.qty,
                unitPrice: item.price,
                subTotal: item.price * item.qty,
                product: {
                  productId: item.id,
                  productName: item.name?.en || item.name?.[lang],
                  image: item.image,
                },
              })),
            },
            productsById,
          );

          setPaymentStatus("paid");

          setTimeout(async () => {
            printOrderReceipt(receiptOrder);

            await refreshOrders();
            clearCart();
            setCashReceived("");
            setQrCode("");
            setKhqrOrderId(null);
            setShowQRModal(false);
            setDiscountPercent(DEFAULT_DISCOUNT);
            setEditingOrderId(null);
            setPaymentStatus("idle");
          }, 1500);

          printOrderReceipt(receiptOrder);

          await refreshOrders();
          clearCart();
          setCashReceived("");
          setQrCode("");
          setKhqrOrderId(null);
          setShowQRModal(false);
          setDiscountPercent(DEFAULT_DISCOUNT);
          setEditingOrderId(null);
        }
      } catch (e) {
        console.error("KHQR status check failed:", e);
      }
    }, 2000);
  };

  const processPayment = async () => {
    if (items.length === 0) {
      alert(t("cartEmpty"));
      return;
    }

    if (parseFloat(cashReceived || 0) < totalAmount) {
      alert(t("cashNotEnough"));
      return;
    }

    setIsProcessingPayment(true);

    try {
      const createPayload = buildOrderPayload({
        items,
        status: "saved",
        user,
      });

      let orderId = editingOrderId;

      if (editingOrderId) {
        await apiUpdateOrder(editingOrderId, createPayload);
      } else {
        const createdOrder = await apiCreateOrder(createPayload);
        orderId = createdOrder?.orderId ?? createdOrder?.id;
      }

      const paidOrder = await apiPayOrder(orderId, {
        paymentType: "CASH",
        paidAmount: parseFloat(cashReceived),
      });

      const receiptOrder = toUiOrder(
        {
          ...paidOrder,
          orderDetails: items.map((item) => ({
            productId: item.id,
            quantity: item.qty,
            unitPrice: item.price,
            product: {
              productId: item.id,
              productName: item.name?.en || item.name?.[lang],
              image: item.image,
            },
          })),
        },
        productsById,
      );

      printOrderReceipt(receiptOrder);

      await refreshOrders();

      clearCart();
      setCashReceived("");
      setShowQRModal(false);
      setDiscountPercent(DEFAULT_DISCOUNT);
      setEditingOrderId(null);

      alert(t("paymentSuccess"));
    } catch (e) {
      alert(e?.response?.data?.message ?? e.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // -------------------- ORDER HISTORY HELPERS --------------------
  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return t("paid");
      case "saved":
        return t("saved");
      default:
        return status;
    }
  };

  const getStatusBadge = (status) => {
    if (status === "paid") return "bg-green-100 text-green-800";
    if (status === "saved") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const clearHistoryFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const viewOrderHistory = () => {
    setShowOrderHistory(true);
    clearHistoryFilters();
    refreshOrders();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = String(order.id).toLowerCase().includes(q);
        const matchDate = formatDate(order.timestamp, lang)
          .toLowerCase()
          .includes(q);
        const matchTotal = String(order.total).toLowerCase().includes(q);
        const matchItem = order.items.some((it) =>
          (it?.name?.[lang] ?? "").toLowerCase().includes(q),
        );
        if (!matchId && !matchDate && !matchTotal && !matchItem) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery, lang]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);

      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") return b.total - a.total;
      if (sortBy === "lowest") return a.total - b.total;
      return dateB - dateA;
    });
  }, [filteredOrders, sortBy]);

  const handleEditOrder = (order) => {
    if (order.status === "paid") {
      alert(t("cannotEditPaid"));
      return;
    }

    if (window.confirm(t("confirmEditOrder"))) {
      clearCart();

      order.items.forEach((item) => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          qty: item.qty,
        });
      });

      const calcDiscountPercent =
        order.subtotal > 0 ? (order.discount / order.subtotal) * 100 : 0;

      setDiscountPercent(
        Number.isFinite(calcDiscountPercent)
          ? calcDiscountPercent
          : DEFAULT_DISCOUNT,
      );

      setEditingOrderId(order.id);
      setShowOrderHistory(false);
      alert(t("orderLoaded"));
    }
  };

  const handleDuplicateOrder = (order) => {
    clearCart();

    order.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: item.qty,
      });
    });

    const calcDiscountPercent =
      order.subtotal > 0 ? (order.discount / order.subtotal) * 100 : 0;

    setDiscountPercent(
      Number.isFinite(calcDiscountPercent)
        ? calcDiscountPercent
        : DEFAULT_DISCOUNT,
    );

    setEditingOrderId(null);
    setShowOrderHistory(false);
    alert(t("orderLoaded"));
  };

  const handleDeleteOrder = async (orderId) => {
    if (!isAdmin) {
      alert("Only admin can delete orders.");
      return;
    }

    if (!window.confirm(t("confirmDeleteOrder"))) return;

    try {
      await apiDeleteOrder(orderId);
      await refreshOrders();
      alert(t("orderDeleted"));
    } catch (e) {
      console.error(e);

      if (e?.response?.status === 403) {
        alert("Only admin can delete orders.");
        return;
      }

      alert(`Delete order error: ${e?.response?.data?.message ?? e.message}`);
    }
  };

  const handleUpdateOrderStatus = async (order, newStatus) => {
    try {
      const payload = {
        orderStatus: newStatus.toUpperCase(),
        totalAmount: Number(order.total.toFixed(2)),
      };

      await apiUpdateOrder(order.id, payload);
      await refreshOrders();
      alert(t("orderUpdated"));
    } catch (e) {
      console.error(e);
      alert(`Update order error: ${e?.response?.data?.message ?? e.message}`);
    }
  };

  const printOrderReceipt = (order) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Popup blocked. Please allow popups to print receipt.");
      return;
    }

    const receiptDate = formatDate(
      order.timestamp || order.orderDate || new Date().toISOString(),
      lang,
    );

    const orderItems = Array.isArray(order.items) ? order.items : [];

    const itemsHtml = orderItems
      .map((item) => {
        const name =
          item.name?.[lang] || item.name?.en || item.name || "Unknown item";

        const qty = Number(item.qty || item.quantity || 0);
        const price = Number(item.price || item.unitPrice || 0);
        const total = qty * price;

        return `
        <tr>
          <td>${name}</td>
          <td style="text-align:center;">${qty}</td>
          <td style="text-align:right;">$${price.toFixed(2)}</td>
          <td style="text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      `;
      })
      .join("");

    const receiptHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${order.id || order.orderId}</title>
        <style>
          body {
            font-family: monospace;
            width: 320px;
            margin: 0 auto;
            padding: 16px;
            color: #000;
          }

          h2, p {
            text-align: center;
            margin: 4px 0;
          }

          .line {
            border-top: 1px dashed #000;
            margin: 12px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          th {
            border-bottom: 1px dashed #000;
            padding-bottom: 4px;
          }

          td {
            padding: 3px 0;
          }

          .row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }

          .total {
            font-weight: bold;
            font-size: 18px;
          }

          @media print {
            body {
              width: 320px;
            }
          }
        </style>
      </head>

      <body>
        <h2>Nexus Cafe</h2>
        <p>123 Main Street, Phnom Penh</p>
        <p>Tel: 012 345 678</p>

        <div class="line"></div>

        <div class="row">
          <span>Order ID:</span>
          <strong>${order.id || order.orderId}</strong>
        </div>

        <div class="row">
          <span>Date:</span>
          <span>${receiptDate}</span>
        </div>

        <div class="row">
          <span>Status:</span>
          <span>Paid</span>
        </div>

        <div class="line"></div>

        <table>
          <thead>
            <tr>
              <th style="text-align:left;">Name</th>
              <th>QTY</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              itemsHtml ||
              `<tr><td colspan="4" style="text-align:center;">No items</td></tr>`
            }
          </tbody>
        </table>

        <div class="line"></div>

        <div class="row">
          <span>Sub Total:</span>
          <span>$${Number(order.subtotal || 0).toFixed(2)}</span>
        </div>

        <div class="row">
          <span>Discount:</span>
          <span>-$${Number(order.discount || 0).toFixed(2)}</span>
        </div>

        <div class="row">
          <span>Tax 1.5%:</span>
          <span>$${Number(order.tax || 0).toFixed(2)}</span>
        </div>

        <div class="row total">
          <span>Total:</span>
          <span>$${Number(order.total || order.totalAmount || 0).toFixed(2)}</span>
        </div>

        <div class="line"></div>

        <p>Thank you for your order!</p>
        <p>--- RECEIPT ---</p>
        <p>${new Date().toLocaleString()}</p>
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const exportOrderToCSV = (order) => {
    const csvContent = [
      [
        "Order ID",
        "Date",
        "Status",
        "Item Name",
        "Quantity",
        "Price",
        "Subtotal",
      ],
      ...order.items.map((item) => [
        order.id,
        formatDate(order.timestamp, "en"),
        order.status,
        item.name?.en ?? "",
        item.qty,
        `$${Number(item.price).toFixed(2)}`,
        `$${Number(item.qty * item.price).toFixed(2)}`,
      ]),
      [],
      ["Subtotal:", `$${Number(order.subtotal).toFixed(2)}`],
      ["Discount:", `-$${Number(order.discount).toFixed(2)}`],
      ["Tax (1.5%):", `$${Number(order.tax).toFixed(2)}`],
      ["Total:", `$${Number(order.total).toFixed(2)}`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order_${order.id}_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(t("orderExported"));
  };

  const printAllOrders = () => {
    if (orders.length === 0) {
      alert(t("noOrders"));
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = orders
      .map(
        (order) => `
    <tr>
      <td>#${order.id}</td>
      <td>${formatDate(order.timestamp, lang)}</td>
      <td>${order.items.length}</td>
      <td>$${Number(order.total).toFixed(2)}</td>
      <td>${order.status.toUpperCase()}</td>
    </tr>
  `,
      )
      .join("");

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${t("allOrdersReport")}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #f4f4f4;
        }
        .total {
          margin-top: 20px;
          font-size: 18px;
          font-weight: bold;
          text-align: right;
        }
        @media print {
          .print-container { display: none; }
        }
        .print-container {
          text-align: center;
          margin-top: 30px;
        }
        .print-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
      </style>
    </head>
    <body>
      <h1>${t("allOrdersReport")}</h1>
      <p>${t("date")}: ${new Date().toLocaleString()}</p>

      <table>
        <thead>
          <tr>
            <th>${t("orderId")}</th>
            <th>${t("date")}</th>
            <th>${t("items")}</th>
            <th>${t("total")}</th>
            <th>${t("status")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="total">
        ${t("totalRevenue")}: $${totalRevenue.toFixed(2)}
      </div>

      <div class="print-container">
        <button class="print-btn" onclick="window.print()">${t("printReport")}</button>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // -------------------- QR --------------------
  const generateQRCodeData = () => {
    const paymentData = {
      amount: totalAmount.toFixed(2),
      currency: "USD",
      orderId: `ORD-${Date.now()}`,
      timestamp: getCurrentDate(),
      merchant: "Restaurant POS",
    };

    return JSON.stringify(paymentData);
  };

  const renderQRCode = () => {
    if (!qrCode) {
      return <div className="text-gray-500">Generating QR...</div>;
    }

    return (
      <div className="text-center">
        <div className="bg-white p-6 rounded-xl inline-block border-4 border-black shadow-lg">
          <QRCodeCanvas value={qrCode} size={220} />

          <div className="mt-3 text-sm text-gray-600">{t("scanToPay")}</div>
          <div className="mt-1 text-xs text-gray-500">
            ${totalAmount.toFixed(2)}
          </div>

          <div className="mt-3 text-xs font-bold text-orange-500">
            {paymentStatus === "waiting" ? "Waiting for payment..." : ""}
          </div>
        </div>
      </div>
    );
  };

  // -------------------- UI --------------------
  return (
    <div
      className={`flex h-full gap-4 p-4 overflow-hidden ${lang === "km" ? "font-khmer" : "font-sans"}`}
    >
      {showAddSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-medium">
              {t("addedToCart")} <strong>{addSuccessItem}</strong>
            </span>
          </div>
        </div>
      )}

      <div className="w-64 bg-white rounded-2xl p-4 flex flex-col">
        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mb-4 flex items-center justify-center gap-2"
          onClick={openAddItemModal}
        >
          <Plus size={20} />
          {t("addNewItem")}
        </button>

        <button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold mb-4 flex items-center justify-center gap-2"
          onClick={openAddCategory}
        >
          <Plus size={18} />
          {t("addCategory")}
        </button>

        <div className="mb-5">
          <div className="relative">
            <input
              className="w-full border rounded-xl px-4 py-3 pl-10"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6 flex-1 bg overflow-y-auto pr-2">
          <button
            type="button"
            className={`w-full py-3 rounded-xl text-sm font-semibold ${
              category === "All"
                ? "bg-green-100 text-green-700 border-2 border-green-500"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setCategory("All")}
          >
            {t("allItems")}
          </button>

          {categories.length === 0
            ? categoryOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`w-full py-3 rounded-xl text-sm font-semibold ${
                    category === c
                      ? "bg-green-100 text-green-700 border-2 border-green-500"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setCategory(c)}
                >
                  {lang === "en" ? c : translateCategory(c)}
                </button>
              ))
            : categories.map((cat) => (
                <div key={cat.categoryId} className="relative group">
                  <button
                    type="button"
                    className={`w-full py-3 rounded-xl text-sm font-semibold ${
                      category === cat.categoryName
                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setCategory(cat.categoryName)}
                  >
                    {lang === "en"
                      ? cat.categoryName
                      : translateCategory(cat.categoryName)}
                  </button>

                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCategory(cat);
                      }}
                      className="bg-blue-500 text-white p-1 rounded"
                      title={t("editCategory")}
                    >
                      <Edit2 size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat);
                      }}
                      className="bg-red-500 text-white p-1 rounded"
                      title={t("deleteOrder")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-2 p-3 bg-gray-50 rounded-xl mb-4">
          <p className="text-sm font-medium mb-2">{t("totalProducts")}</p>
          <p className="text-2xl font-bold text-green-600">
            {loadingProducts ? "…" : products.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">{t("itemsInMenu")}</p>
        </div>

        <button
          type="button"
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold mb-3 flex items-center justify-center gap-2"
          onClick={viewOrderHistory}
        >
          <History size={18} />
          {t("orderHistory")}
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-lg font-bold">
            {category === "All"
              ? t("allItems")
              : lang === "en"
                ? category
                : translateCategory(category)}
            <span className="ml-2 text-sm text-gray-500">
              ({filteredProducts.length})
            </span>
          </h2>
        </div>

        {loadingProducts ? (
          <div className="text-center py-16 flex-1 flex flex-col justify-center text-gray-500">
            {t("loadingProducts")}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 flex-1 flex flex-col justify-center">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {t("noProducts")}
            </h3>
            {/* <p className="text-gray-500 mb-6">{t("startAddingFirstMenuItem")}</p> */}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 items-start auto-rows-min overflow-y-auto pr-2 flex-1 pb-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl p-3 text-center hover:shadow-lg cursor-pointer transition-all hover:scale-[1.02] relative group bg-linear-to-b from-white to-gray-50 h-fit self-start"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditItemModal(p);
                    }}
                    className="bg-blue-500 text-white p-1 rounded-lg hover:bg-blue-600"
                    title={t("editItem")}
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(p.id, e)}
                    className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                    title={t("deleteItem")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.name?.[lang]}
                    className="w-full h-24 object-cover rounded-lg mb-2 border"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/300x200?text=Invalid+URL";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <div className="text-sm font-semibold mb-1">
                    {p.name?.[lang]}
                  </div>
                  <div className="text-green-600 font-bold">
                    ${Number(p.price).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lang === "en" ? p.category : translateCategory(p.category)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <Clock size={10} />
                    {t("updatedOn")}: {formatDate(p.updatedAt, lang)}
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(p, e)}
                    disabled={quickAddProduct === p.id}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      quickAddProduct === p.id
                        ? "bg-green-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {quickAddProduct === p.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t("adding")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        {t("addNow")}
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const cartItem = items.find((it) => it.id === p.id);
                        const currentQty = cartItem ? cartItem.qty : 0;
                        if (currentQty > 0) updateQty(p.id, -1);
                      }}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-600"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="flex-1 text-center text-sm font-medium">
                      {items.find((it) => it.id === p.id)?.qty || 0}{" "}
                      {t("inCart")}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddWithQuantity(p, 1);
                      }}
                      className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded flex items-center justify-center text-blue-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-96 bg-white rounded-2xl p-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 mb-4">
          <div className="mb-4 p-4 rounded-2xl bg-linear-to-r from-slate-900 to-indigo-700 text-white">
            <p className="text-xs uppercase tracking-widest text-indigo-200">
              Current Order
            </p>

            <div className="flex items-end justify-between mt-2">
              <div>
                <h2 className="text-2xl font-black">
                  ${totalAmount.toFixed(2)}
                </h2>
                <p className="text-sm text-indigo-100">
                  {items.reduce((sum, item) => sum + Number(item.qty || 0), 0)}{" "}
                  selected item(s)
                </p>
              </div>

              <ShoppingCart size={34} className="text-indigo-200" />
            </div>
          </div>

          <div className="grid grid-cols-3 font-bold text-sm border-b pb-2 mb-2 sticky top-0 bg-white">
            <span>{t("name")}</span>
            <span className="text-center">{t("qty")}</span>
            <span className="text-right">{t("price")}</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart size={42} className="text-gray-300" />
              </div>

              <h3 className="text-lg font-bold mb-2">{t("cartEmpty")}</h3>
              <p className="text-sm text-gray-400">{t("clickItemsToAdd")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-3 items-center py-3 border-b hover:bg-gray-50 rounded-lg px-2 transition-all duration-300 ${
                    removingCartItemId === item.id
                      ? "opacity-0 -translate-x-8 scale-95"
                      : "opacity-100 translate-x-0 scale-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t("removeFromCartConfirm"))) {
                          setRemovingCartItemId(item.id);

                          setTimeout(() => {
                            removeFromCart(item.id);
                            setRemovingCartItemId(null);
                          }, 250);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>

                    <span className="text-sm font-medium truncate">
                      {item.name?.[lang]}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100 shrink-0"
                    >
                      <Minus size={12} />
                    </button>

                    <span
                      key={item.qty}
                      className="w-8 text-center inline-block animate-qtyPop"
                    >
                      {item.qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100 shrink-0"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="text-right font-bold">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm border-t pt-4 shrink-0">
          <div className="flex justify-between items-center">
            <span>{t("discount")}</span>
            <input
              type="number"
              className="w-24 border rounded px-2 py-1 text-right shrink-0"
              value={discountPercent}
              onChange={(e) =>
                setDiscountPercent(parseFloat(e.target.value || 0))
              }
              min="0"
              max="100"
            />
          </div>

          <div className="flex justify-between">
            <span>{t("subTotal")}</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>{t("tax")}</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>{t("total")}</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3 mt-6 shrink-0">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            onClick={openPaymentModal}
            disabled={items.length === 0}
          >
            <CreditCard size={18} />
            <span>
              {t("payment")} (${totalAmount.toFixed(2)})
            </span>
          </button>

          <button
            type="button"
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-colors border ${
              items.length === 0
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-red-50 hover:bg-red-100 text-red-600 border-red-100"
            }`}
            onClick={handleCancelOrder}
            disabled={items.length === 0}
          >
            <X size={16} />
            <span>{t("cancelOrder")}</span>
          </button>
        </div>

        {editingOrderId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{t("editingOrder")}</span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              {t("editingOrderHelp")}
            </p>
          </div>
        )}
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {categoryModalMode === "add"
                  ? t("addCategory")
                  : t("editCategory")}
              </h2>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <input
              className="w-full border rounded-xl px-4 py-3 mb-4"
              value={categoryNameInput}
              onChange={(e) => setCategoryNameInput(e.target.value)}
              placeholder={t("categoryName")}
            />

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
              <button
                type="button"
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium transition-colors"
                onClick={() => {
                  setShowQRModal(false);
                  setQrCode("");
                  setKhqrOrderId(null);
                  setPaymentStatus("idle");
                }}
              >
                {t("cancel")}
              </button>

              <div className="flex-1">
                {paymentStatus === "paid" ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="success-checkmark">
                      <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                      </div>
                    </div>

                    <div className="text-green-600 font-bold mt-2 animate-pulse">
                      Payment Successful!
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 text-orange-600 py-3 rounded-xl font-bold text-center border border-orange-200">
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="inline-block w-5 h-5 border-2 border-orange-500 border-t-transparent border-r-transparent rounded-full animate-spin"></span>
                      <span className="animate-pulse">
                        Waiting for KHQR payment...
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-xl font-bold">
                {modalMode === "add"
                  ? t("addNewItemTitle")
                  : t("editItemTitle")}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false);
                  resetImage();
                  setIsUploading(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("itemName")}
                </label>
                <input
                  type="text"
                  className="w-full border rounded-xl px-4 py-3"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder={t("enterItemName")}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("nameSavedBothLanguages")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("priceLabel")}
                </label>
                <input
                  type="number"
                  className="w-full border rounded-xl px-4 py-3"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("category")}
                </label>
                <div className="relative">
                  <select
                    className="w-full border rounded-xl px-4 py-3 appearance-none"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    disabled={isUploading}
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {lang === "en" ? c : translateCategory(c)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("itemImage")}
                </label>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg ${
                      uploadMethod === "url"
                        ? "bg-blue-100 text-blue-600 border border-blue-300"
                        : "bg-gray-100"
                    }`}
                    onClick={() => {
                      setUploadMethod("url");
                      setImageError(false);
                    }}
                    disabled={isUploading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ImageIcon size={16} />
                      <span>{t("imageUrl")}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg ${
                      uploadMethod === "file"
                        ? "bg-blue-100 text-blue-600 border border-blue-300"
                        : "bg-gray-100"
                    }`}
                    onClick={() => {
                      setUploadMethod("file");
                      setImageError(false);
                    }}
                    disabled={isUploading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Upload size={16} />
                      <span>{t("uploadFile")}</span>
                    </div>
                  </button>
                </div>

                {uploadMethod === "url" && (
                  <div>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3"
                      value={newItem.imageUrl}
                      onChange={(e) => {
                        setImageError(false);
                        setNewItem({
                          ...newItem,
                          imageUrl: normalizeImageUrl(e.target.value),
                          image: null,
                          imagePreview: null,
                        });
                      }}
                      placeholder={t("enterImageUrl")}
                      disabled={isUploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("leaveEmpty")}
                    </p>
                  </div>
                )}

                {uploadMethod === "file" && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />

                    {newItem.imagePreview ? (
                      <div className="relative">
                        <img
                          src={newItem.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl mb-2 border"
                        />
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={resetImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X size={16} />
                          </button>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                            <div className="text-white">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                              <p className="mt-2">{t("uploading")}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
                        onClick={openFileInput}
                      >
                        <div className="flex flex-col items-center">
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600">
                            {t("clickToUpload")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("fileTypes")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadMethod === "url" && newItem.imageUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">{t("preview")}</p>
                    <img
                      src={newItem.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl border"
                      onError={(e) => {
                        setImageError(true);
                        e.currentTarget.src =
                          "https://placehold.co/300x200?text=No+Image";
                        e.currentTarget.onerror = null;
                      }}
                    />
                    {imageError && (
                      <p className="text-xs text-red-600 mt-2">
                        {t("invalidImageUrl")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium transition-colors"
                  onClick={() => {
                    setShowItemModal(false);
                    resetImage();
                    setIsUploading(false);
                  }}
                  disabled={isUploading}
                >
                  {t("cancel")}
                </button>

                <button
                  type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveItem}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t("saving")}
                    </span>
                  ) : modalMode === "add" ? (
                    t("addItem")
                  ) : (
                    t("updateItem")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-xl font-bold">{t("qrPaymentTitle")}</h2>
              <button
                type="button"
                onClick={() => {
                  setShowQRModal(false);
                  setIsProcessingPayment(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isProcessingPayment}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-lg font-bold mb-2">{t("paymentAmount")}</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(getCurrentDate(), lang)}
                  </p>
                </div>

                <div className="mb-6">
                  {renderQRCode()}
                  <p className="text-sm text-gray-600 mt-3">{t("scanQr")}</p>
                </div>

                <div className="flex justify-between font-bold text-lg mt-3">
                  <span>{t("change")}</span>
                  <span
                    className={
                      changeAmount >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    ${changeAmount > 0 ? changeAmount.toFixed(2) : "0.00"}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span>{t("subTotal")}</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>{t("discount")}</span>
                    <span className="text-red-600">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>{t("tax")}</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{t("total")}</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium transition-colors"
                  onClick={() => {
                    setShowQRModal(false);
                    setIsProcessingPayment(false);
                  }}
                  disabled={isProcessingPayment}
                >
                  {t("cancel")}
                </button>

                <div className="flex-1 bg-orange-50 text-orange-600 py-3 rounded-xl font-bold text-center border border-orange-200">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
                    Waiting for KHQR payment...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOrderHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-7xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
              <div>
                <h2 className="text-xl font-bold">{t("orderHistoryTitle")}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t("totalOrders")}: {orders.length}
                </p>
              </div>

              <div className="flex gap-2">
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={printAllOrders}
                    className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <Printer size={16} />
                    {t("printAll")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowOrderHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              <div className="flex gap-2 items-center flex-1 min-w-[320px]">
                <div className="relative w-full max-w-md">
                  <input
                    className="w-full border rounded-xl px-4 py-3 pl-10"
                    placeholder={t("searchOrders")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                </div>

                <button
                  type="button"
                  className={`px-3 py-3 rounded-xl border font-medium flex items-center gap-2 ${
                    showFilters
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setShowFilters((v) => !v)}
                >
                  <Filter size={16} />
                  {t("filters")}
                </button>
              </div>

              <div className="flex gap-2 items-center">
                <select
                  className="border rounded-xl px-3 py-3"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">{t("newest")}</option>
                  <option value="oldest">{t("oldest")}</option>
                  <option value="highest">{t("highest")}</option>
                  <option value="lowest">{t("lowest")}</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 border rounded-2xl p-4 mb-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    className="border rounded-xl px-3 py-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">{t("allStatus")}</option>
                    <option value="paid">{t("paid")}</option>
                    <option value="saved">{t("saved")}</option>
                  </select>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 font-medium"
                    onClick={clearHistoryFilters}
                  >
                    {t("clear")}
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={refreshOrders}
                    disabled={loadingOrders}
                  >
                    {loadingOrders ? t("loading") : t("refresh")}
                  </button>
                </div>
              </div>
            )}

            {sortedOrders.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                {t("noOrders")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-3 pr-3">{t("orderId")}</th>
                      <th className="py-3 pr-3">{t("date")}</th>
                      <th className="py-3 pr-3">{t("items")}</th>
                      <th className="py-3 pr-3 text-right">{t("total")}</th>
                      <th className="py-3 pr-3">{t("status")}</th>
                      <th className="py-3 pr-3 text-right">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders.map((o) => (
                      <tr key={o.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-3 font-semibold">#{o.id}</td>
                        <td className="py-3 pr-3 text-gray-600">
                          {(() => {
                            const d = new Date(o.timestamp);

                            return (
                              <div className="flex flex-col">
                                <span>
                                  {d.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {d.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3 pr-3">
                          {(() => {
                            const totalQty = o.items.reduce(
                              (sum, item) => sum + Number(item.qty || 0),
                              0,
                            );

                            return (
                              <div className="flex flex-col gap-2">
                                <span className="font-medium">
                                  {totalQty} {t("itemsCount")}
                                </span>

                                <div className="flex flex-col gap-1">
                                  {o.items.slice(0, 3).map((it, index) => (
                                    <div
                                      key={`${it.id}-${index}`}
                                      className="flex items-center gap-2"
                                    >
                                      <img
                                        src={getImageUrl(it.image)}
                                        alt={
                                          it.name?.[lang] ||
                                          it.name?.en ||
                                          "Item"
                                        }
                                        className="w-8 h-8 rounded-lg object-cover border"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "https://placehold.co/80x80?text=No+Image";
                                          e.currentTarget.onerror = null;
                                        }}
                                      />

                                      <span className="text-xs text-gray-500">
                                        {it.name?.[lang] ||
                                          it.name?.en ||
                                          "Unknown item"}
                                        {Number(it.qty || 0) > 1
                                          ? ` x${it.qty}`
                                          : ""}
                                      </span>
                                    </div>
                                  ))}

                                  {o.items.length > 3 && (
                                    <span className="text-xs text-gray-400">
                                      ...
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3 pr-3 text-right font-bold text-green-700">
                          ${Number(o.total).toFixed(2)}
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              o.status,
                            )}`}
                          >
                            {getStatusText(o.status)}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                              onClick={() => handleEditOrder(o)}
                              title={t("editOrder")}
                            >
                              <Edit2 size={14} />
                              {t("editOrder")}
                            </button>

                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center gap-2"
                              onClick={() => handleDuplicateOrder(o)}
                              title={t("duplicateOrder")}
                            >
                              <Copy size={14} />
                              {t("duplicateOrder")}
                            </button>

                            {/* {o.status !== "paid" ? (
                              <button
                                type="button"
                                className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                onClick={() =>
                                  handleUpdateOrderStatus(o, "paid")
                                }
                                title={t("markAsPaid")}
                              >
                                <CheckCircle2 size={14} />
                                {t("markAsPaid")}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                onClick={() =>
                                  handleUpdateOrderStatus(o, "saved")
                                }
                                title={t("markAsSaved")}
                              >
                                <Save size={14} />
                                {t("markAsSaved")}
                              </button>
                            )} */}

                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2"
                              onClick={() => printOrderReceipt(o)}
                              title={t("printReceipt")}
                            >
                              <Printer size={14} />
                              {t("printReceipt")}
                            </button>

                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                              onClick={() => exportOrderToCSV(o)}
                              title={t("exportOrder")}
                            >
                              <FileText size={14} />
                              {t("exportOrder")}
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                                onClick={() => handleDeleteOrder(o.id)}
                                title={t("deleteOrder")}
                              >
                                <Trash2 size={14} />
                                {t("deleteOrder")}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
