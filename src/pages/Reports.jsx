import React, { useEffect, useState } from 'react';
import translations from '../translations';
import { useLang } from '../context/LangContext';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Wallet,
  BarChart3,
  Coffee,
  Download
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function Reports() {
  const { lang } = useLang();
  const t = (key) => translations?.[lang]?.reports?.[key] || key;
  const dayText = (day) => translations?.[lang]?.reports?.days?.[day] || day;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reports/summary`);

      if (!res.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error(error);
      alert(t('failedLoadReports'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">{t('loadingReports')}</div>;
  }

  if (!report) {
    return <div className="p-6 text-red-500">{t('noReportData')}</div>;
  }

  const salesByDay = report.salesByDay || [];
  const topItems = report.topItems || [];
  const maxSales = Math.max(
    ...salesByDay.map((item) => Number(item.sales || 0)),
    1
  );
  const downloadReportCSV = () => {
    const rows = [
      ['Report Summary'],
      ['Total Sales', `$${Number(report.totalSales || 0).toFixed(2)}`],
      ['Paid Orders', report.totalOrders || 0],
      ['Total Staff', report.totalStaff || 0],
      ['Monthly Payroll', `$${Number(report.monthlyPayroll || 0).toFixed(2)}`],
      [],
      ['Weekly Sales'],
      ['Day', 'Sales'],
      ...salesByDay.map((item) => [
        dayText(item.day),
        `$${Number(item.sales || 0).toFixed(2)}`
      ]),
      [],
      ['Top Selling Items'],
      ['Item', 'Quantity'],
      ...topItems.map((item) => [
        item.name,
        item.quantity || 0
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `business_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">

      <div className="rounded-4xl p-8 bg-linear-to-r from-slate-900 via-indigo-900 to-cyan-800 text-white shadow-2xl">
        <p className="text-cyan-200 text-sm font-semibold tracking-[0.2em] uppercase">
          {t('reports')}
        </p>

        <h1 className="mt-3 text-4xl font-black">
          {t('businessReports')}
        </h1>

        <p className="mt-3 text-cyan-100 text-lg">
          {t('description')}
        </p>
        <button
          type="button"
          onClick={downloadReportCSV}
          className="mt-6 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-2xl font-bold border border-white/20 transition-colors"
        >
          <Download size={18} />
          {t('downloadReport')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ReportCard
          title={t('totalSales')}
          value={`$${Number(report.totalSales || 0).toFixed(2)}`}
          icon={<DollarSign size={24} />}
        />

        <ReportCard
          title={t('paidOrders')}
          value={report.totalOrders || 0}
          icon={<ShoppingCart size={24} />}
        />

        <ReportCard
          title={t('totalStaff')}
          value={report.totalStaff || 0}
          icon={<Users size={24} />}
        />

        <ReportCard
          title={t('monthlyPayroll')}
          value={`$${Number(report.monthlyPayroll || 0).toFixed(2)}`}
          icon={<Wallet size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-indigo-500" />
            <h2 className="text-xl font-black dark:text-white">
              {t('weeklySales')}
            </h2>
          </div>

          {salesByDay.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t('noSalesData')}
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-3">
              {salesByDay.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <div
                    style={{
                      height: `${(Number(item.sales || 0) / maxSales) * 100}%`
                    }}
                    className="w-full bg-indigo-500 rounded-t-xl min-h-4"
                    title={`$${Number(item.sales || 0).toFixed(2)}`}
                  />

                  <p className="text-xs text-gray-500 font-bold">
                    {dayText(item.day)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Coffee className="text-amber-500" />
            <h2 className="text-xl font-black dark:text-white">
              {t('topSellingItems')}
            </h2>
          </div>

          {topItems.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t('noPaidOrders')}
            </div>
          ) : (
            <div className="space-y-4">
              {topItems.slice(0, 5).map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.image
                          ? item.image.startsWith('http')
                            ? item.image
                            : `${API_BASE}${item.image}`
                          : 'https://placehold.co/80x80?text=No+Image'
                      }
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image';
                        e.currentTarget.onerror = null;
                      }}
                    />

                    <div>
                      <p className="font-bold dark:text-white">
                        #{index + 1} {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {t('soldQuantity')}
                      </p>
                    </div>
                  </div>

                  <div className="text-2xl font-black text-indigo-500">
                    {item.quantity || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-3xl font-black dark:text-white mt-2">
            {value}
          </h3>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-500">
          {icon}
        </div>
      </div>
    </div>
  );
}