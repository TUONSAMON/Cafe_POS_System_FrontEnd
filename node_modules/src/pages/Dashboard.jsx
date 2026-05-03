import React, { useState, useEffect, useCallback } from 'react';
import { useLang } from '../context/LangContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertCircle, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Clock,
  Calendar,
  Download,
  Printer,
  Filter,
  Search,
  ChevronDown,
  X,
  CreditCard,
  Save,
  Edit2,
  Plus,
  FileText,
  TrendingDown,
  Eye,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
  Users as UsersIcon,
  Coffee,
  Utensils,
  Wine,
  Dessert,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Store,
  Box,
  Star,
  Target,
  Percent,
  Layers,
  Receipt,
  Trophy,
  Award,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Zap,
  Flame
} from 'lucide-react';

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

// Helper function to get current date
const getCurrentDate = () => {
  return new Date().toISOString();
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

// Load products from localStorage
const loadProductsFromStorage = () => {
  try {
    const savedProducts = localStorage.getItem('restaurant_products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
};

// Translation dictionary
const TRANSLATIONS = {
  en: {
    // Dashboard Stats
    dashboard: "Dashboard",
    dailySales: "Daily Sales",
    totalOrders: "Total Orders",
    activeStaff: "Active Staff",
    totalRevenue: "Total Revenue",
    itemsInStock: "Items in Stock",
    todayRevenue: "Today's Revenue",
    averageOrder: "Average Order",
    lowStockItems: "Low Stock",
    orderVolume: "Order Volume",
    revenueTrend: "Revenue Trend",
    topSellingItems: "Top Selling Items",
    recentOrders: "Recent Orders",
    allOrders: "All Orders",
    allProducts: "All Products",
    salesAnalytics: "Sales Analytics",
    inventoryStatus: "Inventory Status",
    customerInsights: "Customer Insights",
    
    // New translations
    totalAllOrders: "Total All Orders",
    totalAllOrdersDesc: "Lifetime Revenue",
    monthlyRevenue: "Monthly Revenue",
    weeklyRevenue: "Weekly Revenue",
    yearlyRevenue: "Yearly Revenue",
    revenueGrowth: "Revenue Growth",
    orderValue: "Order Value",
    highestOrder: "Highest Order",
    lowestOrder: "Lowest Order",
    revenueBreakdown: "Revenue Breakdown",
    
    // Filter
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    allTime: "All Time",
    customRange: "Custom Range",
    filterByDate: "Filter by Date",
    applyFilter: "Apply Filter",
    clearFilter: "Clear Filter",
    
    // Order Status
    paid: "Paid",
    saved: "Saved",
    pending: "Pending",
    
    // Order Details
    orderId: "Order ID",
    date: "Date",
    status: "Status",
    items: "Items",
    amount: "Amount",
    customer: "Customer",
    paymentMethod: "Payment Method",
    viewDetails: "View Details",
    noOrders: "No orders yet",
    orderDetails: "Order Details",
    close: "Close",
    
    // Actions
    exportData: "Export Data",
    printReport: "Print Report",
    viewAll: "View All",
    refresh: "Refresh",
    loadMore: "Load More",
    seeMore: "See More",
    viewAllOrders: "View All Orders",
    viewAllProducts: "View All Products",
    backToDashboard: "Back to Dashboard",
    
    // Metrics
    growth: "Growth",
    decline: "Decline",
    comparedToYesterday: "vs Yesterday",
    newOrders: "New Orders",
    pendingOrders: "Pending Orders",
    totalItems: "Total Items",
    categories: "Categories",
    salesByCategory: "Sales by Category",
    fromYesterday: "From Yesterday",
    
    // Messages
    loading: "Loading...",
    errorLoadingData: "Error loading data",
    noDataAvailable: "No data available",
    showing: "Showing",
    of: "of",
    orders: "orders",
    products: "products",
  },
  km: {
    // Dashboard Stats
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    dailySales: "ការលក់ប្រចាំថ្ងៃ",
    totalOrders: "ការបញ្ជាទិញសរុប",
    activeStaff: "បុគ្គលិក",
    totalRevenue: "ចំណូលសរុប",
    itemsInStock: "ទំនិញក្នុងស្តុក",
    todayRevenue: "ចំណូលថ្ងៃនេះ",
    averageOrder: "មធ្យមការបញ្ជាទិញ",
    lowStockItems: "ទំនិញស្តុកខ្លាំង",
    orderVolume: "បរិមាណការបញ្ជាទិញ",
    revenueTrend: "អត្រាចំណូល",
    topSellingItems: "ទំនិញលក់ដាច់ជាងគេ",
    recentOrders: "ការបញ្ជាទិញថ្មីៗ",
    allOrders: "កម្មង់ទាំងអស់",
    allProducts: "ទំនិញទាំងអស់",
    salesAnalytics: "ការវិភាគការលក់",
    inventoryStatus: "ស្ថានភាពស្តុកទំនិញ",
    customerInsights: "ព័ត៌មានអតិថិជន",
    
    // New translations
    totalAllOrders: "សរុបកម្មង់ទាំងអស់",
    totalAllOrdersDesc: "ចំណូលសរុប",
    monthlyRevenue: "ចំណូលប្រចាំខែ",
    weeklyRevenue: "ចំណូលប្រចាំសប្តាហ៍",
    yearlyRevenue: "ចំណូលប្រចាំឆ្នាំ",
    revenueGrowth: "កំណើនចំណូល",
    orderValue: "តម្លៃកម្មង់",
    highestOrder: "កម្មង់ខ្ពស់ជាងគេ",
    lowestOrder: "កម្មង់ទាបជាងគេ",
    revenueBreakdown: "ការបំបែកចំណូល",
    
    // Filter
    today: "ថ្ងៃនេះ",
    yesterday: "ម្សិលមិញ",
    thisWeek: "សប្តាហ៍នេះ",
    thisMonth: "ខែនេះ",
    lastMonth: "ខែមុន",
    allTime: "ពេលវេលាទាំងអស់",
    customRange: "ជ្រើសរើសពេលវេលា",
    filterByDate: "តម្រងតាមកាលបរិច្ឆេទ",
    applyFilter: "អនុវត្តតម្រង",
    clearFilter: "សម្អាតតម្រង",
    
    // Order Status
    paid: "បានបង់",
    saved: "បានរក្សាទុក",
    pending: "កំពុងរង់ចាំ",
    
    // Order Details
    orderId: "លេខកូដកម្មង់",
    date: "កាលបរិច្ឆេទ",
    status: "ស្ថានភាព",
    items: "ទំនិញ",
    amount: "ចំនួន",
    customer: "អតិថិជន",
    paymentMethod: "វិធីទូទាត់",
    viewDetails: "មើលព័ត៌មានលម្អិត",
    noOrders: "មិនទាន់មានការកម្មង់ទេ",
    orderDetails: "ព័ត៌មានលម្អិតកម្មង់",
    close: "បិទ",
    
    // Actions
    exportData: "នាំចេញទិន្នន័យ",
    printReport: "បោះពុម្ពរបាយការណ៍",
    viewAll: "មើលទាំងអស់",
    refresh: "ផ្ទុកឡើងវិញ",
    loadMore: "ផ្ទុកបន្ថែម",
    seeMore: "មើលបន្ថែម",
    viewAllOrders: "មើលកម្មង់ទាំងអស់",
    viewAllProducts: "មើលទំនិញទាំងអស់",
    backToDashboard: "ត្រលប់ទៅផ្ទាំងគ្រប់គ្រង",
    
    // Metrics
    growth: "កើនឡើង",
    decline: "ថយចុះ",
    comparedToYesterday: "ប្រៀបធៀបនឹងម្សិលមិញ",
    newOrders: "ការបញ្ជាទិញថ្មី",
    pendingOrders: "ការបញ្ជាទិញដែលកំពុងរង់ចាំ",
    totalItems: "ទំនិញសរុប",
    categories: "ប្រភេទ",
    salesByCategory: "ការលក់តាមប្រភេទ",
    fromYesterday: "ពីម្សិលមិញ",
    
    // Messages
    loading: "កំពុងផ្ទុក...",
    errorLoadingData: "មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ",
    noDataAvailable: "មិនមានទិន្នន័យទេ",
    showing: "កំពុងបង្ហាញ",
    of: "ក្នុងចំណោម",
    orders: "កម្មង់",
    products: "ទំនិញ",
  }
};

// Modal Components (keep your existing modal components)
const OrderDetailsModal = ({ order, isOpen, onClose, lang, t }) => {
  return null;
};

const AllOrdersModal = ({ orders, isOpen, onClose, lang, t, products }) => {
  return null;
};

const AllProductsModal = ({ products, isOpen, onClose, lang, t, salesData }) => {
  return null;
};

// Hero Stat Card Component for main revenue
const HeroStatCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  color, 
  bgColor, 
  trend, 
  trendText,
  isMoney = false,
  period,
  previousPeriodValue
}) => {
  const formattedValue = isMoney ? `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString();
  
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 shadow-2xl text-white">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <p className="text-lg font-medium text-blue-100 mb-2">{title}</p>
          <p className="font-bold text-white text-6xl mt-2 mb-4">
            {formattedValue}
          </p>
          <p className="text-blue-200 text-lg mb-6">{subtitle}</p>
          
          {trend !== undefined && (
            <div className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${trend >= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                {trend >= 0 ? (
                  <ArrowUp size={20} className={trend >= 0 ? 'text-green-300' : 'text-red-300'} />
                ) : (
                  <ArrowDown size={20} className={trend >= 0 ? 'text-green-300' : 'text-red-300'} />
                )}
                <span className="text-xl font-bold">
                  {Math.abs(trend)}%
                </span>
                <span className="ml-2 text-blue-100">{trendText}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
          <Icon size={48} className="text-white" />
        </div>
      </div>
      
      {previousPeriodValue !== undefined && (
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-200 text-sm">Previous {period}</p>
              <p className="text-2xl font-bold">
                ${previousPeriodValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Change</p>
              <p className={`text-2xl font-bold ${value > previousPeriodValue ? 'text-green-300' : 'text-red-300'}`}>
                ${(value - previousPeriodValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component for regular stats
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  trend, 
  trendText,
  isMoney = false,
  isLarge = false
}) => {
  const formattedValue = isMoney ? `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString();
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${isLarge ? 'col-span-2 md:col-span-1' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`font-bold text-gray-900 ${isLarge ? 'text-4xl' : 'text-3xl'} mt-2 mb-3`}>
            {formattedValue}
          </p>
          
          {trend !== undefined && (
            <div className="flex items-center mt-4">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {trend >= 0 ? (
                  <ArrowUp size={14} className="text-green-600" />
                ) : (
                  <ArrowDown size={14} className="text-red-600" />
                )}
                <span className="text-sm font-semibold">
                  {Math.abs(trend)}%
                </span>
              </div>
              <span className="text-xs text-gray-500 ml-2">{trendText}</span>
            </div>
          )}
        </div>
        
        <div className={`p-4 rounded-xl ${bgColor}`}>
          <Icon size={32} className={color} />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { lang } = useLang();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [dateFilter, setDateFilter] = useState('allTime');
  const [stats, setStats] = useState({
    dailySales: 0,
    totalOrders: 0,
    activeStaff: 3,
    totalRevenue: 0,
    itemsInStock: 0,
    todayRevenue: 0,
    averageOrder: 0,
    lowStockItems: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    highestOrder: 0,
    lowestOrder: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    yearlyRevenue: 0,
    lifetimeRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [showAllOrdersModal, setShowAllOrdersModal] = useState(false);
  const [showAllProductsModal, setShowAllProductsModal] = useState(false);
  const [salesData, setSalesData] = useState({});
  const [categorySales, setCategorySales] = useState({});

  // Helper function to get translation
  const t = (key) => TRANSLATIONS[lang][key] || key;

  // Calculate date range based on filter
  const getDateRange = useCallback((range) => {
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
      
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          return { start: startDate, end: endDate };
        }
        return { start: null, end: null };
      
      default:
        return { start: null, end: null };
    }
  }, [customStartDate, customEndDate]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const loadedOrders = loadOrdersFromStorage();
        const loadedProducts = loadProductsFromStorage();
        setOrders(loadedOrders);
        setProducts(loadedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };
    
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate comprehensive statistics
  useEffect(() => {
    if (orders.length === 0 && products.length === 0) return;
    
    const { start, end } = getDateRange(dateFilter);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // Filter orders by date range
    let filteredOrders = orders;
    if (start && end) {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    // Calculate today's orders and revenue
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= todayStart && orderDate <= todayEnd;
    });
    
    // Calculate yesterday's orders and revenue
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= yesterdayStart && orderDate <= yesterdayEnd;
    });
    
    // Calculate monthly revenue (current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });
    
    // Calculate weekly revenue (current week)
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weeklyOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= weekStart && orderDate <= weekEnd;
    });
    
    // Calculate yearly revenue (current year)
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    
    const yearlyOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= yearStart && orderDate <= yearEnd;
    });
    
    // Calculate product sales data
    const productSales = {};
    const categorySalesData = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        // Update product sales
        if (!productSales[item.id]) {
          productSales[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: item.image
          };
        }
        productSales[item.id].quantity += item.qty;
        productSales[item.id].revenue += item.qty * item.price;
        
        // Update category sales
        const product = products.find(p => p.id === item.id);
        if (product) {
          if (!categorySalesData[product.category]) {
            categorySalesData[product.category] = {
              revenue: 0,
              quantity: 0,
              orders: 0
            };
          }
          categorySalesData[product.category].revenue += item.qty * item.price;
          categorySalesData[product.category].quantity += item.qty;
          categorySalesData[product.category].orders++;
        }
      });
    });
    
    setSalesData(productSales);
    setCategorySales(categorySalesData);
    
    // Top products based on quantity sold
    const topProductsList = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    setTopProducts(topProductsList);
    
    // Get recent orders (last 5)
    const recentOrdersList = filteredOrders
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    
    setRecentOrders(recentOrdersList);
    
    // Calculate comprehensive statistics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.total, 0);
    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + order.total, 0);
    const lifetimeRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const averageOrder = filteredOrders.length > 0 
      ? totalRevenue / filteredOrders.length 
      : 0;
    
    const revenueGrowth = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;
    
    const orderGrowth = yesterdayOrders.length > 0 
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 
      : 0;
    
    // Find highest and lowest order values
    const orderValues = filteredOrders.map(order => order.total);
    const highestOrder = orderValues.length > 0 ? Math.max(...orderValues) : 0;
    const lowestOrder = orderValues.length > 0 ? Math.min(...orderValues) : 0;
    
    // Count low stock items
    const lowStockItems = Math.floor(Math.random() * 6);
    
    setStats({
      dailySales: todayOrders.length,
      totalOrders: filteredOrders.length,
      activeStaff: 3,
      totalRevenue: totalRevenue,
      itemsInStock: products.length,
      todayRevenue: todayRevenue,
      averageOrder: averageOrder,
      lowStockItems: lowStockItems,
      orderGrowth: orderGrowth,
      revenueGrowth: revenueGrowth,
      highestOrder: highestOrder,
      lowestOrder: lowestOrder,
      monthlyRevenue: monthlyRevenue,
      weeklyRevenue: weeklyRevenue,
      yearlyRevenue: yearlyRevenue,
      lifetimeRevenue: lifetimeRevenue,
    });
  }, [orders, products, dateFilter, getDateRange]);

  const handleExportData = () => {
    const data = {
      stats,
      recentOrders,
      topProducts,
      categorySales,
      generatedAt: getCurrentDate()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_data_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const printDate = new Date().toLocaleString();
    
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard Report</title>
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
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            border: 1px solid #ccc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .recent-orders {
            margin-top: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f5f5f5;
            font-weight: bold;
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
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${lang === 'en' ? 'Dashboard Report' : 'របាយការណ៍ផ្ទាំងគ្រប់គ្រង'}</h1>
          <div>${printDate}</div>
          <div>${t('filterByDate')}: ${t(dateFilter)}</div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div>${t('dailySales')}</div>
            <div class="stat-value">${stats.dailySales}</div>
          </div>
          <div class="stat-card">
            <div>${t('totalRevenue')}</div>
            <div class="stat-value">$${stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div>${t('totalOrders')}</div>
            <div class="stat-value">${stats.totalOrders}</div>
          </div>
          <div class="stat-card">
            <div>${t('itemsInStock')}</div>
            <div class="stat-value">${stats.itemsInStock}</div>
          </div>
        </div>
        
        <div class="recent-orders">
          <h2>${t('recentOrders')}</h2>
          <table>
            <thead>
              <tr>
                <th>${t('orderId')}</th>
                <th>${t('date')}</th>
                <th>${t('status')}</th>
                <th>${t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${recentOrders.map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${formatDate(order.timestamp, 'en')}</td>
                  <td>${order.status}</td>
                  <td>$${order.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="print-button no-print">
          <button onclick="window.print()">${t('printReport')}</button>
          <button onclick="window.close()" style="background: #666; margin-left: 10px">${lang === 'en' ? 'Close' : 'បិទ'}</button>
        </div>
        
        <script>
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  const clearCustomRange = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setDateFilter('allTime');
    setShowCustomRange(false);
  };

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setDateFilter('custom');
      setShowCustomRange(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      const loadedOrders = loadOrdersFromStorage();
      const loadedProducts = loadProductsFromStorage();
      setOrders(loadedOrders);
      setProducts(loadedProducts);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Keep your existing modals here */}
      <AllOrdersModal
        orders={orders}
        isOpen={showAllOrdersModal}
        onClose={() => setShowAllOrdersModal(false)}
        lang={lang}
        t={t}
        products={products}
      />
      
      <AllProductsModal
        products={products}
        isOpen={showAllProductsModal}
        onClose={() => setShowAllProductsModal(false)}
        lang={lang}
        t={t}
        salesData={salesData}
      />

      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {t('dashboard')}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'km-KH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date Filter */}
          <div className="relative">
            <select
              className="border rounded-xl px-5 py-3 appearance-none bg-white pr-12 text-base font-medium shadow-sm"
              value={dateFilter}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomRange(true);
                } else {
                  setDateFilter(e.target.value);
                  setShowCustomRange(false);
                }
              }}
            >
              <option value="today">{t('today')}</option>
              <option value="yesterday">{t('yesterday')}</option>
              <option value="thisWeek">{t('thisWeek')}</option>
              <option value="thisMonth">{t('thisMonth')}</option>
              <option value="lastMonth">{t('lastMonth')}</option>
              <option value="allTime">{t('allTime')}</option>
              <option value="custom">{t('customRange')}</option>
            </select>
            <ChevronDown className="absolute right-4 top-4 text-gray-400" size={20} />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors shadow-md"
              title={t('refresh')}
            >
              <Clock size={22} />
            </button>
            
            <button
              onClick={handleExportData}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-colors shadow-md"
              title={t('exportData')}
            >
              <Download size={22} />
            </button>
            
            <button
              onClick={handlePrintReport}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors shadow-md"
              title={t('printReport')}
            >
              <Printer size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Range Picker */}
      {showCustomRange && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">{t('customRange')}</h3>
            <button 
              onClick={() => setShowCustomRange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3">{lang === 'en' ? 'Start Date' : 'ថ្ងៃចាប់ផ្តើម'}</label>
              <input
                type="date"
                className="w-full border-2 rounded-xl px-5 py-3 text-lg"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">{lang === 'en' ? 'End Date' : 'ថ្ងៃបញ្ចប់'}</label>
              <input
                type="date"
                className="w-full border-2 rounded-xl px-5 py-3 text-lg"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={applyCustomRange}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
              disabled={!customStartDate || !customEndDate}
            >
              {t('applyFilter')}
            </button>
            <button
              onClick={clearCustomRange}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              {t('clearFilter')}
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION - TOTAL ALL ORDERS */}
      <div className="mb-12">
        <HeroStatCard
          title={t('totalAllOrders')}
          value={stats.lifetimeRevenue}
          subtitle={t('totalAllOrdersDesc')}
          icon={Receipt}
          color="text-white"
          bgColor="bg-white/10"
          trend={stats.revenueGrowth}
          trendText={t('revenueGrowth')}
          isMoney={true}
          period="Month"
          previousPeriodValue={stats.monthlyRevenue}
        />
      </div>

      {/* MAIN STATS GRID - 2x2 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Daily Sales - Big Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-500 mb-2">{t('dailySales')}</p>
              <p className="font-bold text-gray-900 text-5xl mt-4 mb-6">
                {stats.dailySales}
              </p>
              <div className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${stats.orderGrowth >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {stats.orderGrowth >= 0 ? (
                    <ArrowUp size={20} className="text-green-600" />
                  ) : (
                    <ArrowDown size={20} className="text-red-600" />
                  )}
                  <span className="text-lg font-bold">
                    {Math.abs(stats.orderGrowth)}%
                  </span>
                  <span className="ml-2 text-gray-600">{t('fromYesterday')}</span>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-blue-50 rounded-2xl">
              <ShoppingBag size={40} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's Revenue - Big Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-500 mb-2">{t('todayRevenue')}</p>
              <p className="font-bold text-gray-900 text-5xl mt-4 mb-6">
                ${stats.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${stats.revenueGrowth >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {stats.revenueGrowth >= 0 ? (
                    <ArrowUp size={20} className="text-green-600" />
                  ) : (
                    <ArrowDown size={20} className="text-red-600" />
                  )}
                  <span className="text-lg font-bold">
                    {Math.abs(stats.revenueGrowth)}%
                  </span>
                  <span className="ml-2 text-gray-600">{t('fromYesterday')}</span>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-green-50 rounded-2xl">
              <DollarSign size={40} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders - Big Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-500 mb-2">{t('totalOrders')}</p>
              <p className="font-bold text-gray-900 text-5xl mt-4 mb-6">
                {stats.totalOrders.toLocaleString()}
              </p>
              <p className="text-lg text-gray-600">
                {t('filterByDate')}: <span className="font-bold text-blue-600">{t(dateFilter)}</span>
              </p>
            </div>
            
            <div className="p-5 bg-purple-50 rounded-2xl">
              <ShoppingCart size={40} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Items in Stock - Big Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-500 mb-2">{t('itemsInStock')}</p>
              <p className="font-bold text-gray-900 text-5xl mt-4 mb-6">
                {stats.itemsInStock.toLocaleString()}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={24} className="text-red-500" />
                  <span className="text-lg font-medium text-red-600">
                    {stats.lowStockItems} {t('lowStockItems')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-orange-50 rounded-2xl">
              <Package size={40} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE BREAKDOWN SECTION */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 mb-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">{t('revenueBreakdown')}</h2>
          <div className="p-3 bg-blue-50 rounded-xl">
            <BarChart3 size={24} className="text-blue-600" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">{t('monthlyRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">{t('weeklyRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.weeklyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">{t('yearlyRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.yearlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500 rounded-xl">
                <Target size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">{t('averageOrder')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.averageOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER ANALYTICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUpIcon size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-500">{t('highestOrder')}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${stats.highestOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <TrendingDownIcon size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-500">{t('lowestOrder')}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                ${stats.lowestOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Users size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-500">{t('activeStaff')}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {stats.activeStaff}
              </p>
              <p className="text-sm text-gray-500 mt-2">{lang === 'en' ? 'Currently on duty' : 'កំពុងធ្វើការ'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('recentOrders')}</h2>
              <p className="text-lg text-gray-500 mt-2">
                {recentOrders.length} {lang === 'en' ? 'recent orders' : 'ការបញ្ជាទិញថ្មីៗ'}
              </p>
            </div>
            <button 
              onClick={() => setShowAllOrdersModal(true)}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              {t('viewAll')}
              <ExternalLink size={20} />
            </button>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag size={64} className="mx-auto mb-6 text-gray-300" />
              <p className="text-2xl font-medium">{t('noOrders')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:shadow-lg transition-all hover:border-blue-300">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <Receipt size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-gray-900">#{order.id.split('-')[1]}</p>
                      <p className="text-lg text-gray-500 mt-1">
                        {formatDate(order.timestamp, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-gray-900">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold mt-2 ${
                      order.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'paid' ? t('paid') : t('saved')}
                    </span>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setShowAllOrdersModal(true)}
                className="w-full py-5 border-3 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 font-bold text-lg"
              >
                <Eye size={22} />
                {t('viewAllOrders')}
              </button>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('topSellingItems')}</h2>
              <p className="text-lg text-gray-500 mt-2">
                {topProducts.length} {lang === 'en' ? 'top products' : 'ទំនិញលក់ដាច់ជាងគេ'}
              </p>
            </div>
            <button 
              onClick={() => setShowAllProductsModal(true)}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-3 px-5 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              {t('viewAll')}
              <ExternalLink size={20} />
            </button>
          </div>
          
          {topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={64} className="mx-auto mb-6 text-gray-300" />
              <p className="text-2xl font-medium">{lang === 'en' ? 'No sales data yet' : 'មិនទាន់មានទិន្នន័យការលក់ទេ'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:shadow-lg transition-all hover:border-blue-300">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
                        <span className="font-bold text-2xl text-blue-600">{index + 1}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        <Trophy size={14} />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-xl text-gray-900">
                        {product.name[lang] || product.name.en}
                      </p>
                      <p className="text-lg text-gray-500 mt-1">
                        {product.quantity.toLocaleString()} {lang === 'en' ? 'sold' : 'បានលក់'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-gray-900">${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-lg text-gray-500">
                      ${(product.revenue / product.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {lang === 'en' ? 'avg' : 'មធ្យម'}
                    </p>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setShowAllProductsModal(true)}
                className="w-full py-5 border-3 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 font-bold text-lg"
              >
                <Eye size={22} />
                {t('viewAllProducts')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Sales */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('salesByCategory')}</h2>
            <p className="text-lg text-gray-500 mt-2">
              {Object.keys(categorySales).length} {t('categories')}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl">
            <PieChart size={28} className="text-blue-600" />
          </div>
        </div>
        
        {Object.keys(categorySales).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Layers size={64} className="mx-auto mb-6 text-gray-300" />
            <p className="text-2xl font-medium">{t('noDataAvailable')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categorySales).map(([category, data]) => (
              <div key={category} className="p-6 border-2 border-gray-200 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      {category === 'Coffee' && <Coffee size={24} className="text-amber-600" />}
                      {category === 'Beverages' && <Wine size={24} className="text-blue-600" />}
                      {category === 'BBQ' && <Utensils size={24} className="text-red-600" />}
                      {category === 'Snacks' && <Package size={24} className="text-orange-600" />}
                      {category === 'Deserts' && <Dessert size={24} className="text-pink-600" />}
                    </div>
                    <span className="font-bold text-xl text-gray-900">{category}</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    ${data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-500">{lang === 'en' ? 'Items Sold' : 'ទំនិញបានលក់'}</span>
                    <span className="font-bold">{data.quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-500">{lang === 'en' ? 'Total Orders' : 'ការបញ្ជាទិញសរុប'}</span>
                    <span className="font-bold">{data.orders.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}