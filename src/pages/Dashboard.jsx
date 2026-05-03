import React, { useEffect, useMemo, useState } from 'react';
import translations from '../translations/index';
import { useLang } from '../context/LangContext';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  RefreshCw,
  Download,
  Printer,
  TrendingUp,
  Receipt,
  Coffee,
  BarChart3,
  Activity,
  CheckCircle2,
  Archive
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ORDERS_API = `${API_BASE}/api/orders`;
const PRODUCTS_API = `${API_BASE}/api/products`;
const INGREDIENTS_API = `${API_BASE}/api/ingredients`;

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatDateTime = (dateString, lang = 'en') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString(lang === 'km' ? 'km-KH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isToday = (dateString) => {
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const normalizeOrder = (order) => ({
  id: order.orderId,
  date: order.orderDate,
  total: Number(order.totalAmount || 0),
  status: String(order.orderStatus || 'SAVED').toUpperCase(),
  items: Array.isArray(order.orderDetails)
    ? order.orderDetails.map((detail) => ({
      productId: detail.product?.productId,
      productName: detail.product?.productName || 'Unknown',
      qty: Number(detail.quantity || 0),
      unitPrice: Number(detail.unitPrice || 0),
      subTotal: Number(detail.subTotal || 0)
    }))
    : []
});

const buildDailyRevenue = (orders) => {
  const last7 = [];
  const today = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const revenue = orders
      .filter((o) => (o.date || '').slice(0, 10) === key)
      .reduce((sum, o) => sum + o.total, 0);

    last7.push({
      key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue
    });
  }

  return last7;
};

const buildTopProducts = (orders) => {
  const map = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!map[item.productId]) {
        map[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0
        };
      }

      map[item.productId].quantity += item.qty;
      map[item.productId].revenue += item.subTotal;
    });
  });

  return Object.values(map)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

const AnimatedIconWrap = ({ children, tone = 'blue' }) => {
  const glowMap = {
    blue: 'shadow-blue-500/20',
    green: 'shadow-emerald-500/20',
    purple: 'shadow-violet-500/20',
    orange: 'shadow-orange-500/20',
    red: 'shadow-rose-500/20',
    indigo: 'shadow-indigo-500/20'
  };

  return (
    <div
      className={`animate-[floatIcon_3.2s_ease-in-out_infinite] ${glowMap[tone]} shadow-xl`}
    >
      {children}
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, tone = 'blue', subtitle, refreshKey }) => {
  const toneMap = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-green-500',
    purple: 'from-violet-500 to-purple-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-rose-500 to-red-500',
    indigo: 'from-indigo-500 to-blue-500'
  };

  return (
    <div
      key={refreshKey}
      className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/30 to-transparent pointer-events-none" />
      <div className="p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white animate-[fadeUp_0.7s_ease-out]">
              {value}
            </h3>
            {subtitle ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            ) : null}
          </div>

          <AnimatedIconWrap tone={tone}>
            <div
              className={`rounded-2xl bg-linear-to-br ${toneMap[tone]} p-3 text-white`}
            >
              <Icon size={24} className="animate-[iconPulse_2.5s_ease-in-out_infinite]" />
            </div>
          </AnimatedIconWrap>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children, right }) => (
  <div className="rounded-3xl border border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
    <div className="flex items-center justify-between px-6 pt-6">
      <div className="flex items-center gap-3">
        <AnimatedIconWrap>
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-2">
            <Icon size={20} className="text-slate-700 dark:text-slate-200" />
          </div>
        </AnimatedIconWrap>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {right}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const RevenueBarChart = ({ data, refreshKey }) => {
  const max = Math.max(...data.map((d) => Number(d.revenue || 0)), 1);
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));

  useEffect(() => {
    let frameId;
    let startTime;

    const targetHeights = data.map((item) => {
      const revenue = Number(item.revenue || 0);
      return revenue > 0 ? Math.max((revenue / max) * 100, 10) : 4;
    });

    const duration = 900;
    setAnimatedValues(data.map(() => 0));

    const animate = (time) => {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues(targetHeights.map((target) => target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [refreshKey, data, max]);

  return (
    <div className="h-72 flex items-end justify-between gap-4 px-4 pt-6">
      {data.map((item, index) => {
        const revenue = Number(item.revenue || 0);

        return (
          <div
            key={item.key}
            className="h-full flex-1 flex flex-col items-center justify-end gap-2"
          >
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 h-5">
              {revenue > 0 ? formatCurrency(revenue) : ''}
            </div>

            <div className="h-52 w-full flex items-end justify-center">
              <div
                style={{ height: `${animatedValues[index] || 4}%` }}
                className="w-10 rounded-t-2xl bg-indigo-500 shadow-lg transition-all duration-300"
              />
            </div>

            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DonutChart = ({ paid, saved, t, refreshKey }) => {
  const total = paid + saved || 1;
  const targetPaidPercent = (paid / total) * 100;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let frameId;
    let start;

    const duration = 950;

    setAnimatedPercent(0);

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetPaidPercent * eased;

      setAnimatedPercent(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [targetPaidPercent, refreshKey]);

  const savedPercent = Math.max(0, 100 - animatedPercent);

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-48 h-48">
        <div
          className="w-48 h-48 rounded-full shadow-xl transition-all duration-500 animate-[donutIn_0.8s_ease-out]"
          style={{
            background: `conic-gradient(#10b981 0% ${animatedPercent}%, #6366f1 ${animatedPercent}% 100%)`,
            transform: `scale(${0.96 + animatedPercent / 2500})`
          }}
        />
        <div className="absolute inset-5 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-inner">
          <div className="text-sm text-slate-500 dark:text-slate-400">{t('totalOrders')}</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{paid + saved}</div>
        </div>
      </div>

      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 animate-[fadeUp_0.6s_ease-out]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-800 dark:text-slate-100">{t('paidOrders')}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900 dark:text-white">{paid}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {animatedPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 p-4 animate-[fadeUp_0.75s_ease-out]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="font-medium text-slate-800 dark:text-slate-100">{t('savedOrders')}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-900 dark:text-white">{saved}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {savedPercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HorizontalBars = ({ data, refreshKey }) => {
  const max = Math.max(...data.map((d) => d.quantity), 1);
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));

  useEffect(() => {
    let frameId;
    let startTime;
    const duration = 850;

    const targets = data.map((item) => (item.quantity / max) * 100);
    setAnimatedValues(data.map(() => 0));

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues(targets.map((target) => target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [refreshKey, data, max]);

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.productId} className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="font-medium text-slate-800 dark:text-slate-100 truncate">
              {item.productName}
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {item.quantity}
            </div>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-150"
              style={{ width: `${animatedValues[index] || 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { lang } = useLang();
  const t = (key) => translations?.[lang]?.Dashboard?.[key] || key;

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, ingredientsRes] = await Promise.all([
        fetch(ORDERS_API),
        fetch(PRODUCTS_API),
        fetch(INGREDIENTS_API)
      ]);

      if (!ordersRes.ok) throw new Error('Failed to fetch orders');
      if (!productsRes.ok) throw new Error('Failed to fetch products');
      if (!ingredientsRes.ok) throw new Error('Failed to fetch ingredients');

      const [ordersData, productsData, ingredientsData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        ingredientsRes.json()
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData.map(normalizeOrder) : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setIngredients(Array.isArray(ingredientsData) ? ingredientsData : []);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Dashboard error:', error);
      setOrders([]);
      setProducts([]);
      setIngredients([]);
      setRefreshKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const todayOrders = orders.filter((order) => isToday(order.date));
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = orders.length ? totalRevenue / orders.length : 0;

    const lowStockProducts = products.filter((p) => {
      const stock = Number(p.stockQty || 0);
      return stock > 0 && stock <= 10;
    });

    const outOfStockProducts = products.filter((p) => {
      const stock = Number(p.stockQty || 0);
      return stock === 0;
    });
    const paidOrders = orders.filter((o) => o.status === 'PAID').length;
    const savedOrders = orders.length - paidOrders;

    return {
      totalRevenue,
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      totalProducts: products.length,
      averageOrder,
      lowStockIngredients: lowStockProducts.length + outOfStockProducts.length,
      paidOrders,
      savedOrders
    };
  }, [orders, products, ingredients]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [orders]
  );

  const topProducts = useMemo(() => buildTopProducts(orders), [orders]);
  const revenueData = useMemo(() => buildDailyRevenue(orders), [orders]);

  const lowStockList = useMemo(
    () =>
      products
        .filter((p) => Number(p.stockQty || 0) <= 10)
        .sort((a, b) => Number(a.stockQty || 0) - Number(b.stockQty || 0))
        .slice(0, 6),
    [products]
  );

  const handleExport = () => {
    const data = {
      stats,
      recentOrders,
      topProducts,
      lowStockList,
      revenueData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <style>{`
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes iconPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.9; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes donutIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div className="text-center">
          <div className="h-14 w-14 mx-auto rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          <p className="mt-4 text-slate-500 dark:text-slate-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-linear-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes donutIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="rounded-4xl p-8 bg-linear-to-r from-slate-900 via-blue-900 to-cyan-800 text-white shadow-2xl">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <p className="text-cyan-200 text-sm font-semibold tracking-[0.2em] uppercase">
              {t('dashboard')}
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">
              {t('businessOverview')}
            </h1>
            <p className="mt-3 text-cyan-100 text-lg">
              {formatDateTime(new Date().toISOString(), lang)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchData}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur flex items-center gap-2 font-semibold"
            >
              <RefreshCw
                size={18}
                className="transition-transform duration-500 hover:rotate-180"
              />
              {t('refresh')}
            </button>

            <button
              onClick={handleExport}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2 font-semibold shadow-lg"
            >
              <Download size={18} className="animate-[floatIcon_2.6s_ease-in-out_infinite]" />
              {t('export')}
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 flex items-center gap-2 font-semibold shadow-lg"
            >
              <Printer size={18} className="animate-[floatIcon_2.6s_ease-in-out_infinite]" />
              {t('print')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          title={t('totalRevenue')}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          tone="green"
          subtitle={t('overallSalesValue')}
          refreshKey={refreshKey}
        />
        <KpiCard
          title={t('totalOrders')}
          value={stats.totalOrders}
          icon={ShoppingBag}
          tone="blue"
          subtitle={t('allRecordedOrders')}
          refreshKey={refreshKey}
        />
        <KpiCard
          title={t('todayRevenue')}
          value={formatCurrency(stats.todayRevenue)}
          icon={TrendingUp}
          tone="purple"
          subtitle={t('salesForToday')}
          refreshKey={refreshKey}
        />
        <KpiCard
          title={t('lowStockIngredients')}
          value={stats.lowStockIngredients}
          icon={AlertTriangle}
          tone="red"
          subtitle={t('needAttention')}
          refreshKey={refreshKey}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SectionCard
            title={t('weeklyRevenueTrend')}
            icon={BarChart3}
            right={
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('last7Days')}
              </div>
            }
          >
            <RevenueBarChart data={revenueData} refreshKey={refreshKey} />
          </SectionCard>
        </div>

        <SectionCard title={t('orderStatus')} icon={Activity}>
          <DonutChart
            paid={stats.paidOrders}
            saved={stats.savedOrders}
            t={t}
            refreshKey={refreshKey}
          />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard
          title={t('topProducts')}
          icon={Coffee}
          right={
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t('bestSellingItems')}
            </div>
          }
        >
          {topProducts.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400">{t('noDataAvailable')}</div>
          ) : (
            <HorizontalBars data={topProducts} refreshKey={refreshKey} />
          )}
        </SectionCard>

        <SectionCard
          title={t('recentOrders')}
          icon={Receipt}
          right={
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {recentOrders.length} {t('items')}
            </div>
          }
        >
          {recentOrders.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400">{t('noOrders')}</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-[fadeUp_0.5s_ease-out]"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">#{order.id}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDateTime(order.date, lang)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </div>
                    <div
                      className={`mt-1 inline-flex px-3 py-1 rounded-full text-xs font-bold ${order.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        }`}
                    >
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title={t('inventoryHealth')} icon={Archive}>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 animate-[fadeUp_0.5s_ease-out]">
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('totalProducts')}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalProducts}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 animate-[fadeUp_0.65s_ease-out]">
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('todayOrders')}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats.todayOrders}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 animate-[fadeUp_0.8s_ease-out]">
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('averageOrder')}</div>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(stats.averageOrder)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 animate-[fadeUp_0.95s_ease-out]">
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('paidOrders')}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {stats.paidOrders}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="xl:col-span-2">
          <SectionCard
            title={t('lowStockAlerts')}
            icon={AlertTriangle}
            right={
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                <AlertTriangle size={14} className="animate-pulse" />
                {stats.lowStockIngredients} {t('alerts')}
              </div>
            }
          >
            {lowStockList.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-5 flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={20} className="animate-[iconPulse_2s_ease-in-out_infinite]" />
                {t('allStockGood')}
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockList.map((item, index) => {
                  const out = Number(item.stockQty || 0) === 0;
                  return (
                    <div
                      key={item.ingredientId}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 animate-[fadeUp_0.5s_ease-out]"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.productName}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {t('stock')}: {item.stockQty} · {t('minStock')}: 10
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${out
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300'
                          }`}
                      >
                        {out ? t('outOfStock') : t('lowStock')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}