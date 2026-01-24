
import React, { useState, useRef, useEffect } from "react";
import { Plus, Minus, Trash2, Search, X, Globe, PauseCircle, CreditCard, ChevronDown, Upload, ImageIcon, Save, Edit2, QrCode, Calendar, Clock, History, Printer, Download, FileText, AlertCircle, ShoppingCart, Star, Filter, DollarSign, Tag, Users, TrendingUp, CalendarDays, CalendarRange } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useLang } from "../context/LangContext";

const CATEGORIES = [
  "Coffee",
  "Beverages",
  "BBQ",
  "Snacks",
];

// Helper function to format date
const formatDate = (dateString, lang = 'en') => {
  const date = new Date(dateString);
  if (lang === 'km') {
    return date.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get current date in correct format
const getCurrentDate = () => {
  return new Date().toISOString();
};

// Load products from localStorage
const loadProductsFromStorage = () => {
  try {
    const savedProducts = localStorage.getItem('restaurant_products');
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      // Ensure all products have date fields
      return products.map(product => ({
        ...product,
        createdAt: product.createdAt || getCurrentDate(),
        updatedAt: product.updatedAt || getCurrentDate()
      }));
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }
  return [];
};

// Save products to localStorage
const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem('restaurant_products', JSON.stringify(products));
  } catch (error) {
    console.error("Error saving products:", error);
  }
};

// Load orders from localStorage
const loadOrdersFromStorage = () => {
  try {
    const savedOrders = localStorage.getItem('restaurant_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
};

// Save orders to localStorage
const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem('restaurant_orders', JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving orders:", error);
  }
};

// Translation dictionary
const TRANSLATIONS = {
  en: {
    // Left sidebar
    addNewItem: "ADD NEW ITEM",
    searchPlaceholder: "Search items here...",
    checkout: "Checkout",
    
    // Center section 
    popular: "Popular",
    editItem: "Edit Item",
    deleteItem: "Delete Item",
    noProducts: "No items available. Add your first item!",
    viewAll: "View All",
    totalProducts: "Total Products",
    itemsInMenu: "Items in your menu",
    addedOn: "Added on",
    updatedOn: "Updated on",
    addToCart: "Add to Cart",
    quickAdd: "Quick Add",
    addNow: "Add Now",
    addedToCart: "Added to cart!",
    
    // Right sidebar
    name: "Name",
    qty: "QTY",
    price: "Price",
    discount: "Discount (%)",
    subTotal: "Sub Total",
    tax: "Tax 1.5%",
    total: "Total",
    visitSite: "Visit site",
    cancelOrder: "Cancel Order",
    holdOrder: "Hold Order",
    saveOrder: "Save Order",
    pay: "Pay",
    apply20: "Apply 20%",
    qrPayment: "QR Payment",
    orderHistory: "Order History",
    
    // Modal
    addNewItemTitle: "Add New Item",
    editItemTitle: "Edit Item",
    itemName: "Item Name",
    enterItemName: "Enter item name",
    priceLabel: "Price ($)",
    category: "Category",
    itemImage: "Item Image",
    imageUrl: "Image URL",
    uploadFile: "Upload File",
    enterImageUrl: "Enter image URL",
    leaveEmpty: "Leave empty for default image",
    clickToUpload: "Click to upload image",
    fileTypes: "JPG, PNG, GIF up to 5MB",
    preview: "Preview",
    cancel: "Cancel",
    addItem: "Add Item",
    updateItem: "Update Item",
    
    // QR Payment Modal
    qrPaymentTitle: "QR Code Payment",
    scanQr: "Scan this QR code to complete payment",
    paymentAmount: "Payment Amount",
    paymentComplete: "Payment Complete",
    confirmPayment: "Confirm Payment",
    processing: "Processing...",
    
    // Order History Modal
    orderHistoryTitle: "Order History",
    orderId: "Order ID",
    date: "Date",
    amount: "Amount",
    status: "Status",
    items: "Items",
    paid: "Paid",
    saved: "Saved",
    viewDetails: "View Details",
    noOrders: "No orders yet",
    printReceipt: "Print Receipt",
    exportOrder: "Export Order",
    printAll: "Print All Orders",
    editOrder: "Edit Order",
    deleteOrder: "Delete Order",
    duplicateOrder: "Duplicate Order",
    markAsPaid: "Mark as Paid",
    markAsSaved: "Mark as Saved",
    confirmDeleteOrder: "Are you sure you want to delete this order?",
    confirmEditOrder: "Edit this order? This will load it into the cart.",
    orderDeleted: "Order deleted successfully!",
    orderUpdated: "Order updated successfully!",
    orderLoaded: "Order loaded into cart!",
    cannotEditPaid: "Cannot edit paid orders. Please duplicate instead.",
    
    // Search and Filter
    searchOrders: "Search orders...",
    filterOrders: "Filter Orders",
    allStatus: "All Status",
    allPaymentMethods: "All Payment Methods",
    allTime: "All Time",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    customRange: "Custom Range",
    startDate: "Start Date",
    endDate: "End Date",
    applyFilter: "Apply Filter",
    clearFilter: "Clear Filter",
    totalOrders: "Total Orders",
    totalRevenue: "Total Revenue",
    averageOrder: "Average Order",
    highestOrder: "Highest Order",
    searchById: "Search by Order ID",
    searchByDate: "Search by Date",
    searchByItem: "Search by Item Name",
    searchByAmount: "Search by Amount",
    sortBy: "Sort By",
    newestFirst: "Newest First",
    oldestFirst: "Oldest First",
    highestAmount: "Highest Amount",
    lowestAmount: "Lowest Amount",
    
    // Messages
    cartEmpty: "Cart is empty",
    addItemSuccess: "Item added successfully!",
    updateItemSuccess: "Item updated successfully!",
    deleteItemSuccess: "Item deleted successfully!",
    enterNamePrice: "Please enter name and price",
    selectImageFile: "Please select an image file",
    fileTooLarge: "File size should be less than 5MB",
    confirmCancel: "Are you sure you want to cancel the order?",
    confirmDelete: "Are you sure you want to delete this item?",
    confirmHold: "Hold this order for later?",
    orderHeld: "Order held successfully",
    orderSaved: "Order saved successfully!",
    paymentSuccess: "Payment processed successfully!",
    apply20Discount: "20% discount applied!",
    removeFromCartConfirm: "Remove this item from cart?",
    saveSuccess: "Item saved successfully!",
    uploadComplete: "Upload complete!",
    orderProcessed: "Order processed successfully!",
    receiptPrinted: "Receipt printed successfully!",
    printAllOrders: "Printing all orders...",
    orderExported: "Order exported successfully!",
  },
  km: {
    // Left sidebar
    addNewItem: "បន្ថែមទំនិញថ្មី",
    searchPlaceholder: "ស្វែងរកឈ្មោះទំនិញ",
    checkout: "បញ្ជាទិញ",
    
    // Center section
    popular: "ពេញនិយម",
    editItem: "កែសម្រួលទំនិញ",
    deleteItem: "លុបទំនិញ",
    noProducts: "គ្មានទំនិញទេ។ បន្ថែមទំនិញដំបូងរបស់អ្នក!",
    viewAll: "មើលទាំងអស់",
    totalProducts: "ទំនិញសរុប",
    itemsInMenu: "ទំនិញក្នុងមីនុយរបស់អ្នក",
    addedOn: "បានបន្ថែមនៅ",
    updatedOn: "បានកែសម្រួលនៅ",
    addToCart: "បន្ថែមទៅរទេះ",
    quickAdd: "បន្ថែមរហ័ស",
    addNow: "បន្ថែមឥឡូវ",
    addedToCart: "បានបន្ថែមទៅក្នុងរទេះ!",
    
    // Right sidebar
    name: "ឈ្មោះ",
    qty: "ចំនួន",
    price: "តម្លៃ",
    discount: "បញ្ចុះតម្លៃ (%)",
    subTotal: "សរុបមុន",
    tax: "ពន្ធី 1.5%",
    total: "សរុប",
    visitSite: "ទស្សនាគេហទំព័រ",
    cancelOrder: "បោះបង់ការកម្មង់",
    holdOrder: "ផ្ទុកការកម្មង់",
    saveOrder: "រក្សាទុកការកម្មង់",
    pay: "បង់ប្រាក់",
    apply20: "ប្រើប្រាស់ 20%",
    qrPayment: "ទូទាត់តាម QR",
    orderHistory: "ប្រវត្តិការកម្មង់",
    
    // Modal
    addNewItemTitle: "បន្ថែមទំនិញថ្មី",
    editItemTitle: "កែសម្រួលទំនិញ",
    itemName: "ឈ្មោះទំនិញ",
    enterItemName: "បញ្ចូលឈ្មោះទំនិញ",
    priceLabel: "តម្លៃ ($)",
    category: "ប្រភេទ",
    itemImage: "រូបភាពទំនិញ",
    imageUrl: "URL រូបភាព",
    uploadFile: "ផ្ទុកឯកសារ",
    enterImageUrl: "បញ្ចូល URL រូបភាព",
    leaveEmpty: "ទុកទទេសម្រាប់រូបភាពលំនាំដើម",
    clickToUpload: "ចុចដើម្បីផ្ទុករូបភាព",
    fileTypes: "JPG, PNG, GIF រហូតដល់ 5MB",
    preview: "មើលជាមុន",
    cancel: "បោះបង់",
    addItem: "បន្ថែមទំនិញ",
    updateItem: "ធ្វើបច្ចុប្បន្នភាពទំនិញ",
    
    // QR Payment Modal
    qrPaymentTitle: "ការទូទាត់តាម QR Code",
    scanQr: "ស្កេន QR code នេះដើម្បីបញ្ចប់ការទូទាត់",
    paymentAmount: "ចំនួនទឹកប្រាក់",
    paymentComplete: "ការទូទាត់បានជោគជ័យ",
    confirmPayment: "បញ្ជាក់ការទូទាត់",
    processing: "កំពុងដំណើរការ...",
    
    // Order History Modal
    orderHistoryTitle: "ប្រវត្តិការកម្មង់",
    orderId: "លេខកូដកម្មង់",
    date: "កាលបរិច្ឆេទ",
    amount: "ចំនួន",
    status: "ស្ថានភាព",
    items: "ទំនិញ",
    paid: "បានបង់",
    saved: "បានរក្សាទុក",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    noOrders: "មិនទាន់មានការកម្មង់ទេ",
    printReceipt: "បោះពុម្ពបង្កាន់ដៃ",
    exportOrder: "នាំចេញកម្មង់",
    printAll: "បោះពុម្ពកម្មង់ទាំងអស់",
    editOrder: "កែសម្រួលកម្មង់",
    deleteOrder: "លុបកម្មង់",
    duplicateOrder: "ចម្លងកម្មង់",
    markAsPaid: "សម្គាល់ថាបានបង់",
    markAsSaved: "សម្គាល់ថារក្សាទុក",
    confirmDeleteOrder: "តើអ្នកប្រាកដថាចង់លុបកម្មង់នេះឬ?",
    confirmEditOrder: "កែសម្រួលកម្មង់នេះ? វានឹងត្រូវបានផ្ទុកទៅក្នុងរទេះទំនិញ។",
    orderDeleted: "កម្មង់ត្រូវបានលុបដោយជោគជ័យ!",
    orderUpdated: "កម្មង់ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!",
    orderLoaded: "កម្មង់ត្រូវបានផ្ទុកទៅក្នុងរទេះទំនិញ!",
    cannotEditPaid: "មិនអាចកែសម្រួលកម្មង់ដែលបានបង់ប្រាក់។ សូមចម្លងវិញ។",
    
    // Search and Filter
    searchOrders: "ស្វែងរកកម្មង់...",
    filterOrders: "តម្រងកម្មង់",
    allStatus: "ស្ថានភាពទាំងអស់",
    allPaymentMethods: "វិធីទូទាត់ទាំងអស់",
    allTime: "ពេលវេលាទាំងអស់",
    today: "ថ្ងៃនេះ",
    yesterday: "ម្សិលមិញ",
    thisWeek: "សប្តាហ៍នេះ",
    thisMonth: "ខែនេះ",
    lastMonth: "ខែមុន",
    customRange: "ជ្រើសរើសពេលវេលា",
    startDate: "ថ្ងៃចាប់ផ្តើម",
    endDate: "ថ្ងៃបញ្ចប់",
    applyFilter: "អនុវត្តតម្រង",
    clearFilter: "សម្អាតតម្រង",
    totalOrders: "កម្មង់សរុប",
    totalRevenue: "ចំណូលសរុប",
    averageOrder: "មធ្យមកម្មង់",
    highestOrder: "កម្មង់ខ្ពស់ជាងគេ",
    searchById: "ស្វែងរកតាមលេខកូដ",
    searchByDate: "ស្វែងរកតាមកាលបរិច្ឆេទ",
    searchByItem: "ស្វែងរកតាមឈ្មោះទំនិញ",
    searchByAmount: "ស្វែងរកតាមចំនួន",
    sortBy: "តម្រៀបតាម",
    newestFirst: "ថ្មីជាងមុន",
    oldestFirst: "ចាស់ជាងមុន",
    highestAmount: "ចំនួនខ្ពស់ជាងគេ",
    lowestAmount: "ចំនួនទាបជាងគេ",
    
    // Messages
    cartEmpty: "រទេះទំនិញទទេ",
    addItemSuccess: "ទំនិញត្រូវបានបន្ថែមដោយជោគជ័យ!",
    updateItemSuccess: "ទំនិញត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!",
    deleteItemSuccess: "ទំនិញត្រូវបានលុបដោយជោគជ័យ!",
    enterNamePrice: "សូមបញ្ចូលឈ្មោះ និងតម្លៃ",
    selectImageFile: "សូមជ្រើសរើសឯកសាររូបភាព",
    fileTooLarge: "ទំហំឯកសារគួរតែតូចជាង 5MB",
    confirmCancel: "តើអ្នកប្រាកដថាចង់បោះបង់ការកម្មង់នេះឬ?",
    confirmDelete: "តើអ្នកប្រាកដថាចង់លុបទំនិញនេះឬ?",
    confirmHold: "ផ្ទុកការកម្មង់នេះសម្រាប់ពេលក្រោយ?",
    orderHeld: "ការកម្មង់ត្រូវបានផ្ទុកដោយជោគជ័យ",
    orderSaved: "កម្មង់ត្រូវបានរក្សាទុកដោយជោគជ័យ!",
    paymentSuccess: "ការទូទាត់បានជោគជ័យ!",
    apply20Discount: "បញ្ចុះតម្លៃ 20% ត្រូវបានអនុវត្ត!",
    removeFromCartConfirm: "ដកធាតុនេះចេញពីរទេះទំនិញ?",
    saveSuccess: "ទំនិញត្រូវបានរក្សាទុកដោយជោគជ័យ!",
    uploadComplete: "បានផ្ទុករូបភាពដោយជោគជ័យ!",
    orderProcessed: "ការកម្មង់ត្រូវបានដំណើរការដោយជោគជ័យ!",
    receiptPrinted: "បង្កាន់ដៃត្រូវបានបោះពុម្ពដោយជោគជ័យ!",
    printAllOrders: "កំពុងបោះពុម្ពកម្មង់ទាំងអស់...",
    orderExported: "កម្មង់ត្រូវបាននាំចេញដោយជោគជ័យ!",
  }
};

export default function OrderScreen() {
  const { lang } = useLang();
  const { items, updateQty, removeFromCart, totals, addToCart, clearCart } = useCart();

  const [products, setProducts] = useState(() => loadProductsFromStorage());
  const [orders, setOrders] = useState(() => loadOrdersFromStorage());
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [discountPercent, setDiscountPercent] = useState(20);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
  const fileInputRef = useRef(null);
  
  // Order History Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  const discountAmount = totals.subtotal * (discountPercent / 100);
  const taxAmount = (totals.subtotal - discountAmount) * 0.015;
  const totalAmount = totals.subtotal - discountAmount + taxAmount;

  // Save products to localStorage whenever products change
  useEffect(() => {
    saveProductsToStorage(products);
  }, [products]);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);

  // Filter products based on category and search
  const filteredProducts = category === "All" 
    ? products.filter(p => p.name[lang].toLowerCase().includes(search.toLowerCase()))
    : products.filter(p => 
        p.category === category && 
        p.name[lang].toLowerCase().includes(search.toLowerCase())
      );

  // Get popular items (most recent 4 items)
  const popularItems = products.slice(0, 4);

  // Helper function to get translation
  const t = (key) => TRANSLATIONS[lang][key] || key;

  // Show success message when item is added
  useEffect(() => {
    if (showAddSuccess && addSuccessItem) {
      const timer = setTimeout(() => {
        setShowAddSuccess(false);
        setAddSuccessItem(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAddSuccess, addSuccessItem]);

  // Handle quick add to cart
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
    
    // Show success message
    setAddSuccessItem(product.name[lang]);
    setShowAddSuccess(true);
    
    // Reset quick add state
    setTimeout(() => {
      setQuickAddProduct(null);
    }, 500);
  };

  // Handle add with quantity selection
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
    
    // Show success message
    setAddSuccessItem(`${product.name[lang]} (${quantity})`);
    setShowAddSuccess(true);
    
    // Reset quick add state
    setTimeout(() => {
      setQuickAddProduct(null);
    }, 500);
  };

  // Get date range for filtering
  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch(range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      
      case 'thisWeek':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      
      case 'lastMonth':
        start.setMonth(start.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      
      default:
        return { start: null, end: null };
    }
  };

  // Filter orders based on search and filter criteria
  const filteredOrders = orders.filter(order => {
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(searchLower);
      const matchesDate = formatDate(order.timestamp, lang).toLowerCase().includes(searchLower);
      const matchesAmount = order.total.toString().includes(searchLower);
      const matchesItems = order.items.some(item => 
        item.name[lang].toLowerCase().includes(searchLower)
      );
      
      if (!matchesId && !matchesDate && !matchesAmount && !matchesItems) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      if (paymentMethodFilter === 'qr' && order.paymentMethod !== 'qr') {
        return false;
      }
      if (paymentMethodFilter === 'none' && order.paymentMethod !== 'none') {
        return false;
      }
    }
    
    // Date range filter
    if (dateRangeFilter !== 'all') {
      const orderDate = new Date(order.timestamp);
      
      if (dateRangeFilter === 'custom') {
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          
          if (orderDate < startDate || orderDate > endDate) {
            return false;
          }
        }
      } else {
        const { start, end } = getDateRange(dateRangeFilter);
        if (start && end && (orderDate < start || orderDate > end)) {
          return false;
        }
      }
    }
    
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    switch(sortBy) {
      case 'newest':
        return dateB - dateA;
      case 'oldest':
        return dateA - dateB;
      case 'highest':
        return b.total - a.total;
      case 'lowest':
        return a.total - b.total;
      default:
        return dateB - dateA;
    }
  });

  // Get statistics
  const orderStats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
    averageOrder: filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length 
      : 0,
    highestOrder: filteredOrders.length > 0 
      ? Math.max(...filteredOrders.map(order => order.total))
      : 0,
    paidOrders: filteredOrders.filter(order => order.status === 'paid').length,
    savedOrders: filteredOrders.filter(order => order.status === 'saved').length,
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setDateRangeFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("newest");
  };

  const printOrderReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    const receiptDate = formatDate(order.timestamp, lang);
    
    const itemsList = order.items.map(item => 
      `<tr>
        <td>${item.name[lang]}</td>
        <td style="text-align: center">${item.qty}</td>
        <td style="text-align: right">$${item.price.toFixed(2)}</td>
        <td style="text-align: right">$${(item.qty * item.price).toFixed(2)}</td>
      </tr>`
    ).join('');

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order ${order.id}</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 0.5cm; }
            .no-print { display: none !important; }
          }
          body {
            font-family: 'Courier New', monospace;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .restaurant-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .address {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .receipt-info {
            margin-bottom: 15px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          th {
            text-align: left;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
            font-weight: bold;
          }
          td {
            padding: 3px 0;
          }
          .total-section {
            border-top: 2px dashed #000;
            margin-top: 10px;
            padding-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            margin-left: 5px;
          }
          .print-button {
            text-align: center;
            margin-top: 20px;
          }
          button {
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">RESTAURANT POS</div>
          <div class="address">123 Main Street, Phnom Penh</div>
          <div class="address">Tel: 012 345 678</div>
        </div>
        
        <div class="receipt-info">
          <div class="info-row">
            <span>${t('orderId')}:</span>
            <span><strong>${order.id}</strong></span>
          </div>
          <div class="info-row">
            <span>${t('date')}:</span>
            <span>${receiptDate}</span>
          </div>
          <div class="info-row">
            <span>${t('status')}:</span>
            <span>
              ${getStatusText(order.status)}
              <span class="status-badge" style="background: ${order.status === 'paid' ? '#d4edda' : '#cce5ff'}; color: ${order.status === 'paid' ? '#155724' : '#004085'}">
                ${order.status === 'paid' ? '✓' : '💾'}
              </span>
            </span>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${t('name')}</th>
              <th style="text-align: center">${t('qty')}</th>
              <th style="text-align: right">${t('price')}</th>
              <th style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>${t('subTotal')}:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>${t('discount')}:</span>
            <span style="color: red">-$${order.discount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>${t('tax')} (1.5%):</span>
            <span>$${order.tax.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>${t('total')}:</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>Thank you for your order!</div>
          <div>--- ${lang === 'en' ? 'RECEIPT' : 'បង្កាន់ដៃ'} ---</div>
          <div>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <div class="print-button no-print">
          <button onclick="window.print()">${lang === 'en' ? 'Print Receipt' : 'បោះពុម្ពបង្កាន់ដៃ'}</button>
          <button onclick="window.close()" style="background: #666; margin-left: 10px">${lang === 'en' ? 'Close' : 'បិទ'}</button>
        </div>
        
        <script>
          // Auto-print after a short delay
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      alert(t("receiptPrinted"));
    }, 1000);
  };

  const exportOrderToCSV = (order) => {
    const csvContent = [
      ['Order ID', 'Date', 'Status', 'Item Name', 'Quantity', 'Price', 'Subtotal'],
      ...order.items.map(item => [
        order.id,
        formatDate(order.timestamp, 'en'),
        order.status,
        item.name.en,
        item.qty,
        `$${item.price.toFixed(2)}`,
        `$${(item.qty * item.price).toFixed(2)}`
      ]),
      [],
      ['Subtotal:', `$${order.subtotal.toFixed(2)}`],
      ['Discount:', `-$${order.discount.toFixed(2)}`],
      ['Tax (1.5%):', `$${order.tax.toFixed(2)}`],
      ['Total:', `$${order.total.toFixed(2)}`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
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
    
    const printWindow = window.open('', '_blank');
    const printDate = new Date().toLocaleString();
    
    const ordersList = orders.map(order => `
      <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <strong>${t('orderId')}:</strong> ${order.id}<br>
            <strong>${t('date')}:</strong> ${formatDate(order.timestamp, lang)}<br>
            <strong>${t('status')}:</strong> ${getStatusText(order.status)}
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 18px;">$${order.total.toFixed(2)}</strong>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #000;">
              <th style="text-align: left; padding: 5px 0;">${t('items')}</th>
              <th style="text-align: right; padding: 5px 0;">${t('qty')}</th>
              <th style="text-align: right; padding: 5px 0;">${t('price')}</th>
              <th style="text-align: right; padding: 5px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 3px 0;">${item.name[lang]}</td>
                <td style="text-align: right; padding: 3px 0;">${item.qty}</td>
                <td style="text-align: right; padding: 3px 0;">$${item.price.toFixed(2)}</td>
                <td style="text-align: right; padding: 3px 0;">$${(item.qty * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 10px; text-align: right;">
          <div>${t('subTotal')}: $${order.subtotal.toFixed(2)}</div>
          <div>${t('discount')}: -$${order.discount.toFixed(2)}</div>
          <div>${t('tax')}: $${order.tax.toFixed(2)}</div>
          <div style="font-weight: bold; font-size: 16px;">${t('total')}: $${order.total.toFixed(2)}</div>
        </div>
      </div>
    `).join('');

    const allOrdersHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>All Orders Report</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          body {
            font-family: Arial, sans-serif;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
            color: black;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          .summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
          }
          .print-button {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
          }
          button {
            padding: 12px 25px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${lang === 'en' ? 'Orders Report' : 'របាយការណ៍កម្មង់'}</h1>
          <div>${printDate}</div>
          <div>Total Orders: ${orders.length}</div>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div>${t('total')}</div>
            <div class="summary-value">$${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div>${t('paid')}</div>
            <div class="summary-value">${orders.filter(o => o.status === 'paid').length}</div>
          </div>
          <div class="summary-item">
            <div>${t('saved')}</div>
            <div class="summary-value">${orders.filter(o => o.status === 'saved').length}</div>
          </div>
        </div>
        
        ${ordersList}
        
        <div class="print-button no-print">
          <button onclick="window.print()">${lang === 'en' ? 'Print Report' : 'បោះពុម្ពរបាយការណ៍'}</button>
          <button onclick="window.close()" style="background: #666">${lang === 'en' ? 'Close' : 'បិទ'}</button>
        </div>
        
        <script>
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(allOrdersHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      alert(t("printAllOrders"));
    }, 1000);
  };

  const handleEditOrder = (order) => {
    if (order.status === 'paid') {
      alert(t("cannotEditPaid"));
      return;
    }
    
    if (window.confirm(t("confirmEditOrder"))) {
      // Clear current cart
      clearCart();
      
      // Load order items into cart
      order.items.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          qty: item.qty,
        });
      });
      
      // Set discount percentage based on order
      const calculatedDiscountPercent = order.subtotal > 0 ? (order.discount / order.subtotal) * 100 : 0;
      setDiscountPercent(calculatedDiscountPercent);
      
      // Set editing order ID
      setEditingOrderId(order.id);
      
      // Close order history modal
      setShowOrderHistory(false);
      
      alert(t("orderLoaded"));
    }
  };

  const handleDuplicateOrder = (order) => {
    // Clear current cart
    clearCart();
    
    // Load order items into cart
    order.items.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: item.qty,
      });
    });
    
    // Set discount percentage based on order
    const calculatedDiscountPercent = order.subtotal > 0 ? (order.discount / order.subtotal) * 100 : 0;
    setDiscountPercent(calculatedDiscountPercent);
    
    // Reset editing order ID
    setEditingOrderId(null);
    
    // Close order history modal
    setShowOrderHistory(false);
    
    alert(t("orderLoaded"));
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(t("confirmDeleteOrder"))) {
      setOrders(orders.filter(order => order.id !== orderId));
      alert(t("orderDeleted"));
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? {
        ...order,
        status: newStatus,
        timestamp: getCurrentDate()
      } : order
    ));
    alert(t("orderUpdated"));
  };

  const handleSaveOrder = () => {
    if (items.length === 0) {
      alert(t("cartEmpty"));
      return;
    }
    
    const orderData = {
      id: editingOrderId || `ORD-${Date.now()}`,
      items: items.map(item => ({
        ...item,
        addedAt: getCurrentDate()
      })),
      subtotal: totals.subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: totalAmount,
      timestamp: getCurrentDate(),
      status: "saved",
      paymentMethod: "none",
    };
    
    if (editingOrderId) {
      // Update existing order
      setOrders(orders.map(order => 
        order.id === editingOrderId ? orderData : order
      ));
      setEditingOrderId(null);
      alert(lang === 'en' ? 'Order updated successfully!' : 'កម្មង់ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!');
    } else {
      // Create new order
      setOrders([orderData, ...orders]);
      alert(t("orderSaved"));
    }
    
    // Clear cart after saving
    clearCart();
    setDiscountPercent(20);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert(t("selectImageFile"));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert(t("fileTooLarge"));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewItem({
          ...newItem,
          image: file,
          imagePreview: e.target.result,
          imageUrl: ""
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddItemModal = () => {
    setModalMode("add");
    setNewItem({
      name: "",
      price: "",
      category: "Coffee",
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
    setNewItem({
      name: product.name.en,
      price: product.price.toString(),
      category: product.category,
      image: null,
      imagePreview: null,
      imageUrl: product.image,
    });
    setUploadMethod("url");
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert(t("enterNamePrice"));
      return;
    }

    let imageUrl = newItem.imageUrl;
    
    if (uploadMethod === "file" && newItem.image) {
      setIsUploading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (newItem.imagePreview) {
          imageUrl = newItem.imagePreview;
          alert(t("uploadComplete"));
        }
      } catch (error) {
        alert(lang === "en" ? "Failed to upload image" : "ផ្ទុករូបភាពមិនជោគជ័យ");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (!imageUrl) {
      const defaultImages = {
        Coffee: "https://images.unsplash.com/photo-1513118171418-46b8c4e07e43?w=300&h=200&fit=crop",
        Beverages: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=200&fit=crop",
        BBQ: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop",
        Snacks: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop",
        Deserts: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&h=200&fit=crop",
      };
      imageUrl = defaultImages[newItem.category] || defaultImages.Coffee;
    }

    const currentTime = getCurrentDate();

    if (modalMode === "add") {
      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct = {
        id: newId,
        category: newItem.category,
        name: { 
          en: newItem.name, 
          km: newItem.name
        },
        price: parseFloat(newItem.price),
        image: imageUrl,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      setProducts([newProduct, ...products]);
      
      // Auto-add to cart option
      const shouldAddToCart = window.confirm(
        lang === "en" 
          ? "Add this item to cart?" 
          : "បន្ថែមទំនិញនេះទៅក្នុងរទេះទំនិញ?"
      );
      
      if (shouldAddToCart) {
        handleAddWithQuantity({
          id: newId,
          name: { en: newItem.name, km: newItem.name },
          price: parseFloat(newItem.price),
          image: imageUrl,
        }, 1);
      }

      alert(t("addItemSuccess"));
    } else {
      // Edit mode - update existing product
      setProducts(products.map(p => 
        p.id === editingItemId ? {
          ...p,
          category: newItem.category,
          name: { 
            en: newItem.name, 
            km: newItem.name
          },
          price: parseFloat(newItem.price),
          image: imageUrl,
          updatedAt: currentTime,
        } : p
      ));

      alert(t("updateItemSuccess"));
    }

    // Reset form
    setNewItem({
      name: "",
      price: "",
      category: "Coffee",
      image: null,
      imagePreview: null,
      imageUrl: "",
    });
    setUploadMethod("url");
    setShowItemModal(false);
  };

  const handleDeleteItem = (productId, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(t("confirmDelete"))) {
      setProducts(products.filter(p => p.id !== productId));
      
      const cartItem = items.find(item => item.id === productId);
      if (cartItem) {
        removeFromCart(productId);
      }
      
      alert(t("deleteItemSuccess"));
    }
  };

  const apply20PercentDiscount = () => {
    setDiscountPercent(20);
    alert(t("apply20Discount"));
  };

  const handleCancelOrder = () => {
    if (window.confirm(t("confirmCancel"))) {
      clearCart();
      setDiscountPercent(20);
      setEditingOrderId(null);
    }
  };

  const handleHoldOrder = () => {
    if (window.confirm(t("confirmHold"))) {
      alert(t("orderHeld"));
    }
  };

  const handleQRPayment = () => {
    if (items.length === 0) {
      alert(t("cartEmpty"));
      return;
    }
    setShowQRModal(true);
  };

  const processPayment = () => {
    setIsProcessingPayment(true);
    
    const orderData = {
      id: editingOrderId || `ORD-${Date.now()}`,
      items: items.map(item => ({
        ...item,
        addedAt: getCurrentDate()
      })),
      subtotal: totals.subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: totalAmount,
      timestamp: getCurrentDate(),
      status: "paid",
      paymentMethod: "qr",
    };
    
    setTimeout(() => {
      if (editingOrderId) {
        // Update existing order
        setOrders(orders.map(order => 
          order.id === editingOrderId ? orderData : order
        ));
        setEditingOrderId(null);
      } else {
        // Create new order
        setOrders([orderData, ...orders]);
      }
      
      setIsProcessingPayment(false);
      alert(t("paymentSuccess"));
      clearCart();
      setShowQRModal(false);
      setDiscountPercent(20);
    }, 2000);
  };

  const openFileInput = () => {
    fileInputRef.current.click();
  };

  const resetImage = () => {
    setNewItem({
      ...newItem,
      image: null,
      imagePreview: null,
      imageUrl: ""
    });
  };

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
    const qrData = generateQRCodeData();
    return (
      <div className="text-center">
        <div className="bg-white p-6 rounded-xl inline-block border-4 border-black shadow-lg">
          <div className="mb-4">
            <QrCode size={180} className="mx-auto text-black" />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {lang === "en" ? "Scan QR code to pay" : "ស្កេន QR code ដើម្បីទូទាត់"}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            ${totalAmount.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  const viewOrderHistory = () => {
    setShowOrderHistory(true);
    clearAllFilters(); // Reset filters when opening
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'saved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'paid': return t('paid');
      case 'saved': return t('saved');
      default: return status;
    }
  };

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      {/* SUCCESS TOAST */}
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

      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-white rounded-2xl p-4 flex flex-col">
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mb-4 flex items-center justify-center gap-2"
          onClick={openAddItemModal}
        >
          <Plus size={20} />
          {t("addNewItem")}
        </button>
        
        <div className="mb-6">
          <div className="relative">
            <input
              className="w-full border rounded-xl px-4 py-3 pl-10"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>

        <div className="space-y-2 mb-6 flex-1 overflow-y-auto pr-2">
          <button
            className={`w-full py-3 rounded-xl text-sm font-semibold ${
              category === "All" ? "bg-green-100 text-green-700 border-2 border-green-500" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setCategory("All")}
          >
            {lang === "en" ? "All Items" : "ទំនិញទាំងអស់"}
          </button>
          
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`w-full py-3 rounded-xl text-sm font-semibold ${
                category === c ? "bg-green-100 text-green-700 border-2 border-green-500" : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setCategory(c)}
            >
              {lang === "en" ? c : translateCategory(c)}
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-xl mb-4">
          <p className="text-sm font-medium mb-2">{t("totalProducts")}</p>
          <p className="text-2xl font-bold text-green-600">{products.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t("itemsInMenu")}</p>
        </div>

        <button 
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold mb-3 flex items-center justify-center gap-2"
          onClick={viewOrderHistory}
        >
          <History size={18} />
          {t("orderHistory")}
        </button>

        <button 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-lg"
          onClick={handleQRPayment}
        >
          {t("checkout")}
        </button>
      </div>

      {/* CENTER - PRODUCT GRID */}
      <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col overflow-hidden">
        {products.length > 0 && (
          <div className="mb-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                {t("popular")}
              </h3>
              <span className="text-sm text-gray-500">
                {products.length} {lang === 'en' ? 'items' : 'ទំនិញ'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {popularItems.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-xl p-3 text-center hover:shadow-lg cursor-pointer transition-all relative group bg-gradient-to-b from-white to-gray-50"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
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
                      onClick={(e) => handleDeleteItem(p.id, e)}
                      className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                      title={t("deleteItem")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <img
                      src={p.image}
                      alt={p.name[lang]}
                      className="w-full h-24 object-cover rounded-lg mb-2 border"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                    <div className="text-sm font-semibold mb-1 line-clamp-1">
                      {p.name[lang]}
                    </div>
                    <div className="text-green-600 font-bold">${p.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                      <Calendar size={10} />
                      {formatDate(p.createdAt, lang)}
                    </div>
                  </div>
                  
                  {/* Quick Add Button */}
                  <div className="mt-3">
                    <button
                      onClick={(e) => handleQuickAdd(p, e)}
                      disabled={quickAddProduct === p.id}
                      className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                        quickAddProduct === p.id
                          ? 'bg-green-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {quickAddProduct === p.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {lang === 'en' ? 'Adding...' : 'កំពុងបន្ថែម...'}
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          {t("quickAdd")}
                        </>
                      )}
                    </button>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const cartItem = items.find(item => item.id === p.id);
                          const currentQty = cartItem ? cartItem.qty : 0;
                          if (currentQty > 0) {
                            updateQty(p.id, -1);
                          }
                        }}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="flex-1 text-center text-sm font-medium">
                        {items.find(item => item.id === p.id)?.qty || 0} in cart
                      </span>
                      <button
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
          </div>
        )}

        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold">
            {category === "All" 
              ? (lang === "en" ? "All Items" : "ទំនិញទាំងអស់") 
              : (lang === "en" ? category : translateCategory(category))}
            <span className="ml-2 text-sm text-gray-500">({filteredProducts.length})</span>
          </h2>
          <button 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => setCategory("All")}
          >
            {t("viewAll")}
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 flex-1 flex flex-col justify-center">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {t("noProducts")}
            </h3>
            <p className="text-gray-500 mb-6">
              {lang === "en" 
                ? "Start by adding your first menu item" 
                : "ចាប់ផ្តើមដោយបន្ថែមទំនិញដំបូងក្នុងមីនុយ"}
            </p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
              onClick={openAddItemModal}
            >
              <Plus size={20} />
              {t("addNewItem")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 flex-1 pb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl p-3 text-center hover:shadow-lg cursor-pointer transition-all hover:scale-[1.02] relative group bg-gradient-to-b from-white to-gray-50"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
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
                    onClick={(e) => handleDeleteItem(p.id, e)}
                    className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                    title={t("deleteItem")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <img
                    src={p.image}
                    alt={p.name[lang]}
                    className="w-full h-24 object-cover rounded-lg mb-2 border"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  <div className="text-sm font-semibold mb-1">
                    {p.name[lang]}
                  </div>
                  <div className="text-green-600 font-bold">${p.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lang === "en" ? p.category : translateCategory(p.category)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <Clock size={10} />
                    {t("updatedOn")}: {formatDate(p.updatedAt, lang)}
                  </div>
                </div>
                
                {/* Quick Add Button */}
                <div className="mt-3">
                  <button
                    onClick={(e) => handleQuickAdd(p, e)}
                    disabled={quickAddProduct === p.id}
                    className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      quickAddProduct === p.id
                        ? 'bg-green-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {quickAddProduct === p.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {lang === 'en' ? 'Adding...' : 'កំពុងបន្ថែម...'}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        {t("addNow")}
                      </>
                    )}
                  </button>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const cartItem = items.find(item => item.id === p.id);
                        const currentQty = cartItem ? cartItem.qty : 0;
                        if (currentQty > 0) {
                          updateQty(p.id, -1);
                        }
                      }}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">
                      {items.find(item => item.id === p.id)?.qty || 0} in cart
                    </span>
                    <button
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

      {/* RIGHT - CART & PAYMENT */}
      <div className="w-96 bg-white rounded-2xl p-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 mb-4">
          <div className="grid grid-cols-3 font-bold text-sm border-b pb-2 mb-2 sticky top-0 bg-white">
            <span>{t("name")}</span>
            <span className="text-center">{t("qty")}</span>
            <span className="text-right">{t("price")}</span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">{t("cartEmpty")}</h3>
              <p className="text-sm text-gray-400">
                {lang === 'en' 
                  ? 'Click on items to add them to your cart'
                  : 'ចុចលើទំនិញដើម្បីបន្ថែមវាទៅក្នុងរទេះរបស់អ្នក'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="grid grid-cols-3 items-center py-3 border-b hover:bg-gray-50 rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (window.confirm(t("removeFromCartConfirm"))) {
                          removeFromCart(item.id);
                        }
                      }} 
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="text-sm font-medium truncate">
                      {item.name[lang]}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => updateQty(item.id, -1)} 
                      className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100 flex-shrink-0"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.id, 1)} 
                      className="w-6 h-6 border rounded flex items-center justify-center hover:bg-gray-100 flex-shrink-0"
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

        <div className="space-y-3 text-sm border-t pt-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <span>{t("discount")}</span>
            <div className="flex gap-2">
              <button
                onClick={apply20PercentDiscount}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-200 flex-shrink-0"
              >
                {t("apply20")}
              </button>
              <input
                type="number"
                className="w-24 border rounded px-2 py-1 text-right flex-shrink-0"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value || 0))}
                min="0"
                max="100"
              />
            </div>
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

        <div className="grid grid-cols-2 gap-3 mt-6 flex-shrink-0">
          <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors">
            <Globe size={16} />
            <span>{t("visitSite")}</span>
          </button>
          <button 
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-colors"
            onClick={handleCancelOrder}
          >
            <X size={16} />
            <span>{t("cancelOrder")}</span>
          </button>
          <button 
            className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl transition-colors"
            onClick={handleHoldOrder}
          >
            <PauseCircle size={16} />
            <span>{t("holdOrder")}</span>
          </button>
          <button 
            className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl transition-colors"
            onClick={handleSaveOrder}
          >
            <Save size={16} />
            <span>{editingOrderId ? (lang === 'en' ? 'Update Order' : 'ធ្វើបច្ចុប្បន្នភាពកម្មង់') : t("saveOrder")}</span>
          </button>
          <button 
            className="col-span-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors"
            onClick={handleQRPayment}
            disabled={items.length === 0}
          >
            <QrCode size={16} />
            <span>
              {editingOrderId ? (lang === 'en' ? 'Pay & Update' : 'បង់ និងធ្វើបច្ចុប្បន្នភាព') : t("pay")} (${totalAmount.toFixed(2)})
            </span>
          </button>
        </div>
        
        {editingOrderId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">
                {lang === 'en' ? 'Editing Order' : 'កំពុងកែសម្រួលកម្មង់'}
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              {lang === 'en' 
                ? 'Changes will update the existing order. Click "Cancel Order" to stop editing.' 
                : 'ការផ្លាស់ប្តូរនឹងធ្វើបច្ចុប្បន្នភាពកម្មង់ដែលមានស្រាប់។ ចុច "បោះបង់ការកម្មង់" ដើម្បីឈប់កែសម្រួល។'}
            </p>
          </div>
        )}
      </div>

      {/* MODAL FOR ADD/EDIT ITEM */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-xl font-bold">
                {modalMode === "add" ? t("addNewItemTitle") : t("editItemTitle")}
              </h2>
              <button 
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
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder={t("enterItemName")}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {lang === "en" 
                    ? "Name will be saved in both English and Khmer" 
                    : "ឈ្មោះនឹងត្រូវរក្សាទុកទាំងភាសាអង់គ្លេស និងខ្មែរ"}
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
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
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
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    disabled={isUploading}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {lang === "en" ? c : translateCategory(c)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("itemImage")}
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    className={`flex-1 py-2 rounded-lg ${uploadMethod === "url" ? "bg-blue-100 text-blue-600 border border-blue-300" : "bg-gray-100"}`}
                    onClick={() => setUploadMethod("url")}
                    disabled={isUploading}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ImageIcon size={16} />
                      <span>{t("imageUrl")}</span>
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg ${uploadMethod === "file" ? "bg-blue-100 text-blue-600 border border-blue-300" : "bg-gray-100"}`}
                    onClick={() => setUploadMethod("file")}
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
                      onChange={(e) => setNewItem({
                        ...newItem, 
                        imageUrl: e.target.value,
                        image: null,
                        imagePreview: null
                      })}
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
                              <p className="mt-2">
                                {lang === "en" ? "Uploading..." : "កំពុងផ្ទុក..."}
                              </p>
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
                        e.target.src = "https://via.placeholder.com/300x200?text=Invalid+Image+URL";
                        alert(lang === "en" ? "Invalid image URL" : "URL រូបភាពមិនត្រឹមត្រូវ");
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveItem}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {lang === "en" ? "Saving..." : "កំពុងរក្សាទុក..."}
                    </span>
                  ) : (
                    modalMode === "add" ? t("addItem") : t("updateItem")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR PAYMENT MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-xl font-bold">
                {t("qrPaymentTitle")}
              </h2>
              <button 
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
                  <p className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(getCurrentDate(), lang)}
                  </p>
                </div>
                
                <div className="mb-6">
                  {renderQRCode()}
                  <p className="text-sm text-gray-600 mt-3">
                    {t("scanQr")}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span>{t("subTotal")}</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>{t("discount")}</span>
                    <span className="text-red-600">-${discountAmount.toFixed(2)}</span>
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
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-medium transition-colors"
                  onClick={() => {
                    setShowQRModal(false);
                    setIsProcessingPayment(false);
                  }}
                  disabled={isProcessingPayment}
                >
                  {t("cancel")}
                </button>
                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={processPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t("processing")}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard size={16} />
                      {editingOrderId ? (lang === 'en' ? 'Update & Pay' : 'ធ្វើបច្ចុប្បន្នភាព និងបង់') : t("confirmPayment")}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY MODAL */}
      {showOrderHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-7xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
              <div>
                <h2 className="text-xl font-bold">{t("orderHistoryTitle")}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {lang === 'en' ? `Total Orders: ${orders.length}` : `កម្មង់សរុប: ${orders.length}`}
                </p>
              </div>
              <div className="flex gap-2">
                {orders.length > 0 && (
                  <button 
                    onClick={printAllOrders}
                    className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <Printer size={16} />
                    {t("printAll")}
                  </button>
                )}
                <button 
                  onClick={() => setShowOrderHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{t("totalOrders")}</p>
                    <p className="text-2xl font-bold text-blue-800">{orderStats.totalOrders}</p>
                  </div>
                  <TrendingUp size={24} className="text-blue-500" />
                </div>
                <div className="mt-2 flex text-xs text-blue-600">
                  <span className="flex items-center mr-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {orderStats.paidOrders} {t("paid")}
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    {orderStats.savedOrders} {t("saved")}
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">{t("totalRevenue")}</p>
                    <p className="text-2xl font-bold text-green-800">${orderStats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign size={24} className="text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {lang === 'en' ? 'All time revenue' : 'ចំណូលសរុប'}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">{t("averageOrder")}</p>
                    <p className="text-2xl font-bold text-purple-800">${orderStats.averageOrder.toFixed(2)}</p>
                  </div>
                  <Tag size={24} className="text-purple-500" />
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {lang === 'en' ? 'Per order average' : 'មធ្យមកម្មង់'}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">{t("highestOrder")}</p>
                    <p className="text-2xl font-bold text-orange-800">${orderStats.highestOrder.toFixed(2)}</p>
                  </div>
                  <TrendingUp size={24} className="text-orange-500" />
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {lang === 'en' ? 'Highest single order' : 'កម្មង់ខ្ពស់ជាងគេ'}
                </p>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3 pl-10"
                      placeholder={t("searchOrders")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs text-gray-500">{t("searchById")}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{t("searchByDate")}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{t("searchByItem")}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{t("searchByAmount")}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl font-medium flex items-center gap-2"
                  >
                    <Filter size={18} />
                    {t("filterOrders")}
                    {Object.values({statusFilter, paymentMethodFilter, dateRangeFilter}).some(v => v !== 'all') && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {Object.values({statusFilter, paymentMethodFilter, dateRangeFilter}).filter(v => v !== 'all').length}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative">
                    <select
                      className="border rounded-xl px-4 py-3 appearance-none bg-white min-w-[140px]"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">{t("newestFirst")}</option>
                      <option value="oldest">{t("oldestFirst")}</option>
                      <option value="highest">{t("highestAmount")}</option>
                      <option value="lowest">{t("lowestAmount")}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-gray-50 border rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{t("filterOrders")}</h3>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      {t("clearFilter")}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("status")}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-3 py-2 rounded-lg text-sm ${statusFilter === 'all' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-white border hover:bg-gray-50'}`}
                          onClick={() => setStatusFilter('all')}
                        >
                          {t("allStatus")}
                        </button>
                        <button
                          className={`px-3 py-2 rounded-lg text-sm ${statusFilter === 'paid' ? 'bg-green-100 text-green-600 border border-green-300' : 'bg-white border hover:bg-gray-50'}`}
                          onClick={() => setStatusFilter('paid')}
                        >
                          {t("paid")}
                        </button>
                        <button
                          className={`px-3 py-2 rounded-lg text-sm ${statusFilter === 'saved' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-white border hover:bg-gray-50'}`}
                          onClick={() => setStatusFilter('saved')}
                        >
                          {t("saved")}
                        </button>
                      </div>
                    </div>
                    
                    {/* Payment Method Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'en' ? 'Payment Method' : 'វិធីទូទាត់'}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-3 py-2 rounded-lg text-sm ${paymentMethodFilter === 'all' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-white border hover:bg-gray-50'}`}
                          onClick={() => setPaymentMethodFilter('all')}
                        >
                          {t("allPaymentMethods")}
                        </button>
                        <button
                          className={`px-3 py-2 rounded-lg text-sm ${paymentMethodFilter === 'qr' ? 'bg-purple-100 text-purple-600 border border-purple-300' : 'bg-white border hover:bg-gray-50'}`}
                          onClick={() => setPaymentMethodFilter('qr')}
                        >
                          QR Payment
                        </button>
                        <button
                          className={`px-3 py-2 rounded-lg text-sm ${paymentMethodFilter === 'none' ? 'bg-gray-100 text-gray-600 border border-gray-300' : 'bg-white border hover:bg-gray-50'}`}
                          onClick={() => setPaymentMethodFilter('none')}
                        >
                          {lang === 'en' ? 'No Payment' : 'មិនទាន់បង់'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">{t("date")}</label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {['all', 'today', 'yesterday', 'thisWeek', 'thisMonth', 'lastMonth', 'custom'].map((range) => (
                            <button
                              key={range}
                              className={`px-3 py-1 rounded-lg text-xs ${dateRangeFilter === range ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'bg-white border hover:bg-gray-50'}`}
                              onClick={() => setDateRangeFilter(range)}
                            >
                              {t(range === 'custom' ? 'customRange' : range)}
                            </button>
                          ))}
                        </div>
                        
                        {dateRangeFilter === 'custom' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="block text-xs mb-1">{t("startDate")}</label>
                              <input
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">{t("endDate")}</label>
                              <input
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {lang === 'en' ? 'Showing' : 'កំពុងបង្ហាញ'} {sortedOrders.length} {lang === 'en' ? 'of' : 'ក្នុងចំណោម'} {orders.length} {lang === 'en' ? 'orders' : 'កម្មង់'}
                      </span>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        {t("applyFilter")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {sortedOrders.length === 0 ? (
              <div className="text-center py-12">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {orders.length === 0 ? t("noOrders") : lang === 'en' ? 'No matching orders found' : 'រកមិនឃើញកម្មង់ដែលត្រូវគ្នាទេ'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {orders.length === 0 
                    ? (lang === "en" 
                        ? "Start by creating your first order" 
                        : "ចាប់ផ្តើមដោយបង្កើតការកម្មង់ដំបូងរបស់អ្នក")
                    : (lang === "en" 
                        ? "Try adjusting your search or filter criteria" 
                        : "សាកល្បងកែសម្រួលលក្ខណៈស្វែងរក ឬតម្រងរបស់អ្នក")
                  }
                </p>
                {orders.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                  >
                    <Filter size={20} />
                    {t("clearFilter")}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <div key={order.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{t("orderId")}:</span>
                          <span className="text-blue-600 font-mono">{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{formatDate(order.timestamp, lang)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {order.paymentMethod === 'qr' && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              QR Payment
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex gap-2 mb-2">
                          <button 
                            onClick={() => exportOrderToCSV(order)}
                            className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                            title={t("exportOrder")}
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => printOrderReceipt(order)}
                            className="text-gray-500 hover:text-green-600 transition-colors p-1"
                            title={t("printReceipt")}
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="col-span-2">
                        <div className="font-medium mb-1">{t("items")}: {order.items.length}</div>
                        <div className="text-gray-600 max-h-32 overflow-y-auto pr-2 bg-gray-50 rounded-lg p-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                              <div className="flex-1 truncate mr-2">{item.name[lang]}</div>
                              <div className="whitespace-nowrap text-right">
                                <span className="text-gray-500 mr-2">
                                  {item.qty} × ${item.price.toFixed(2)}
                                </span>
                                <span className="font-medium">${(item.qty * item.price).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t("subTotal")}:</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("discount")}:</span>
                          <span className="text-red-600">-${order.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("tax")}:</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                          <span>{t("total")}:</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex gap-2">
                        {order.status === 'saved' && (
                          <button 
                            onClick={() => handleEditOrder(order)}
                            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-3 rounded-lg flex items-center gap-1"
                          >
                            <Edit2 size={14} />
                            {t("editOrder")}
                          </button>
                        )}
                        <button 
                          onClick={() => handleDuplicateOrder(order)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-lg flex items-center gap-1"
                        >
                          <Plus size={14} />
                          {t("duplicateOrder")}
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded-lg flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          {t("deleteOrder")}
                        </button>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'saved' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                            className="text-sm bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded-lg flex items-center gap-1"
                          >
                            <CreditCard size={14} />
                            {t("markAsPaid")}
                          </button>
                        )}
                        {order.status === 'paid' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'saved')}
                            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-3 rounded-lg flex items-center gap-1"
                          >
                            <Save size={14} />
                            {t("markAsSaved")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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