import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  RefreshCw,
  Plus,
  PackagePlus,
} from 'lucide-react';
import axios from 'axios';
import { formatRupiah, formatRupiahShort } from '../utils/currency';
import TransactionModal from '../components/TransactionModal';
import ProductModal from '../components/ProductModal';
import RestockModal from '../components/RestockModal';

const API_BASE = 'http://localhost:3000';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
  bgGradient: string;
  vsText: string;
  onClick?: () => void;
  inverseTrendColor?: boolean; // 🔥 Ditambahkan agar Tren Naik bisa berwarna Merah (Misal: untuk Alert/Peringatan)
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
  bgGradient,
  vsText,
  onClick,
  inverseTrendColor = false,
}: StatCardProps) => {
  // Logika penentuan warna tren UI
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  
  const goodColor = inverseTrendColor ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';
  const badColor = inverseTrendColor ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';

  let trendColorClass = 'text-slate-500';
  if (isUp) trendColorClass = goodColor;
  if (isDown) trendColorClass = badColor;

  return (
    <div
      onClick={onClick}
      className={`group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer ring-2 ring-transparent hover:ring-rose-500/30' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value}
          </h4>
        </div>
        <div
          className={`p-3 rounded-xl ${bgGradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-0.5 text-sm font-semibold ${trendColorClass}`}>
            {isUp ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : isDown ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : (
              <span className="w-4" />
            )}
            {trendValue}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {vsText}
          </span>
        </div>
        {onClick && (
          <span className="text-[10px] text-rose-500 font-medium mt-1 animate-pulse">
            Klik untuk restock stok kritis &rarr;
          </span>
        )}
      </div>
    </div>
  );
};

interface OverviewData {
  totalRevenue: number;
  activeAlerts: number;
  totalCustomers: number;
  recentTransactions: Array<{
    id: string;
    invoiceDate: string;
    customerId: string;
    quantity: number;
    totalSales: number;
    status: string;
    product: { name: string; sku: string };
  }>;
  revenueByMonth: Array<{
    month: string;
    actual: number;
    predicted: number;
  }>;
  predictedGrowth?: string;
  predictedTrend?: string;
  revenueTrend?: string;
  alertsTrend?: string;
  customersTrend?: string;
  customerEngagement?: Array<{
    name: string;
    active: number;
    new: number;
  }>;
}

export default function Dashboard() {
  const { t: translate } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (signal?: AbortSignal, isRefresh: boolean = false) => {
    const token = localStorage.getItem('access_token');

    try {
      const url = isRefresh
        ? `${API_BASE}/api/dashboard/overview?refresh=true`
        : `${API_BASE}/api/dashboard/overview`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Error fetching overview:', err);

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
      } else {
        setError(translate('dashboard.fallback_error'));
      }

      // Fallback Data UI yang lebih aman
      setData({
        totalRevenue: 0,
        activeAlerts: 0,
        totalCustomers: 0,
        recentTransactions: [],
        revenueByMonth: [],
        customerEngagement: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    await loadData(undefined, true);
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData =
    data?.revenueByMonth?.map((item) => ({
      ...item,
      name: new Date(item.month + '-01').toLocaleDateString('id-ID', {
        month: 'short',
      }),
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {translate('dashboard.overview')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {translate('dashboard.powered_engine')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <PackagePlus className="w-4 h-4" />
            Produk Baru
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4" />
            Transaksi Baru
          </button>

          <button
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {translate('dashboard.refresh_data')}
          </button>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => void handleRefresh()}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => void handleRefresh()}
      />
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onRestockSuccess={() => void handleRefresh()}
      />

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title={translate('dashboard.total_revenue')}
          value={data ? formatRupiah(data.totalRevenue) : '—'}
          icon={DollarSign}
          trend={data?.revenueTrend?.startsWith('-') ? 'down' : 'up'}
          trendValue={data?.revenueTrend ?? '—'}
          color="text-white"
          bgGradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          vsText={translate('dashboard.vs_last_month')}
        />

        <StatCard
          title={translate('dashboard.predicted_growth')}
          value={data?.predictedGrowth ?? '—'}
          icon={TrendingUp}
          // 🔥 PERBAIKAN: Menyesuaikan string return dari backend Python ("Naik" / "Turun")
          trend={data?.predictedTrend === 'Turun' ? 'down' : data?.predictedTrend === 'Naik' ? 'up' : 'neutral'}
          trendValue={data?.predictedTrend ?? '—'}
          color="text-white"
          bgGradient="bg-gradient-to-br from-brand-500 to-brand-700"
          vsText={translate('dashboard.vs_last_month')}
        />

        <StatCard
          title={translate('dashboard.active_alerts')}
          value={data?.activeAlerts?.toString() ?? '—'}
          icon={AlertCircle}
          // 🔥 PERBAIKAN: Alert yang naik adalah hal buruk, maka gunakan warna inverse
          trend={data?.alertsTrend?.startsWith('-') ? 'down' : 'up'}
          trendValue={data?.alertsTrend ?? '—'}
          color="text-white"
          bgGradient="bg-gradient-to-br from-rose-500 to-rose-700"
          vsText={translate('dashboard.vs_last_month')}
          inverseTrendColor={true} 
          onClick={() => setIsRestockModalOpen(true)}
        />

        <StatCard
          title={translate('dashboard.total_customers')}
          value={data?.totalCustomers?.toString() ?? '—'}
          icon={Users}
          trend={data?.customersTrend?.startsWith('-') ? 'down' : 'up'}
          trendValue={data?.customersTrend ?? '—'}
          color="text-white"
          bgGradient="bg-gradient-to-br from-violet-500 to-violet-700"
          vsText={translate('dashboard.vs_last_month')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {translate('dashboard.revenue_projection')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {translate('dashboard.actual_vs_predicted')}
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {translate('dashboard.live')}
              </span>
            </div>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
                  <span className="text-sm text-slate-500">
                    {translate('dashboard.loading_forecast')}
                  </span>
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(v) => formatRupiahShort(v)} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                      backgroundColor: '#fff',
                      padding: '12px 16px',
                    }}
                    formatter={(value: any) => [formatRupiah(Number(value) || 0), undefined]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name={translate('forecast.actual_sales')}
                    stroke="#0f766e"
                    strokeWidth={3}
                    fill="url(#colorActual)"
                    dot={{ r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    name="AI Predicted"
                    stroke="#2dd4bf"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fill="url(#colorPredicted)"
                    dot={{ r: 4, fill: '#2dd4bf', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Tidak ada data tersedia.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {translate('dashboard.sales_by_period')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {translate('dashboard.monthly_breakdown')}
            </p>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => formatRupiahShort(v)} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                    }}
                    formatter={(value: any) => [formatRupiah(Number(value) || 0), undefined]}
                  />
                  <Bar dataKey="actual" name={translate('dashboard.total_revenue')} fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Belum ada transaksi.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {translate('dashboard.customer_engagement')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {translate('dashboard.active_signups')}
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-full">
              <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {translate('dashboard.insights_label')}
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.customerEngagement ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="active" name={translate('customers.active_users')} stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="new" name="New Signups" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {translate('dashboard.recent_transactions')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {translate('dashboard.latest_orders')}
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full">
            {data?.recentTransactions?.length ?? 0} {translate('dashboard.records')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">{translate('dashboard.product')}</th>
                <th className="px-6 py-4 font-semibold">{translate('dashboard.customer')}</th>
                <th className="px-6 py-4 font-semibold">{translate('dashboard.date')}</th>
                <th className="px-6 py-4 font-semibold">{translate('dashboard.qty')}</th>
                <th className="px-6 py-4 font-semibold">{translate('dashboard.total')}</th>
                <th className="px-6 py-4 font-semibold">{translate('dashboard.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data?.recentTransactions?.length ? (
                data.recentTransactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors text-slate-600 dark:text-slate-300">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{tx.product.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{tx.product.sku}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">#{String(tx.customerId).slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-xs">{new Date(tx.invoiceDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-semibold">{tx.quantity}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{formatRupiah(tx.totalSales)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tx.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    {loading ? translate('dashboard.loading_forecast') : translate('dashboard.no_transactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}