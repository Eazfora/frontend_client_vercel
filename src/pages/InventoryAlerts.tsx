import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  MoreVertical,
  Zap,
  RefreshCw,
  Package,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../utils/currency';

const API_BASE = 'https://backend-service-vercel-up9v.vercel.app';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
  severity: string;
  recommendation: string;
}

interface Alert {
  id: number;
  type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
}

interface InventoryData {
  products: Product[];
  alerts: Alert[];
}

const severityConfig: Record<string, { badge: string; dot: string; icon: string }> = {
  critical: {
    badge: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800',
    dot: 'bg-red-500',
    icon: 'text-red-500',
  },
  warning: {
    badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800',
    dot: 'bg-amber-500',
    icon: 'text-amber-500',
  },
  safe: {
    badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    icon: 'text-emerald-500',
  },
};

export default function InventoryAlerts() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

 const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/api/dashboard/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // INI ADALAH BAGIAN REAL-TIME: Memasukkan data asli dari database ke layar
      setData(response.data);
      
    } catch (err) {
      console.error('Error fetching inventory:', err);
      
      // HAPUS DATA DUMMY: Jika server error, kosongkan saja datanya
      // agar tidak menampilkan produk asing (seperti Alpha-Series Router)
      setData({
        products: [],
        alerts: []
      });
      
      // Opsional: Beri tahu pengguna kalau gagal memuat data asli
      alert("Gagal memuat data inventaris riil dari server.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FITUR: EKSPOR DATA INVENTARIS KE CSV
  // ==========================================
  const handleExportCSV = () => {
    if (!data || !data.products || data.products.length === 0) {
      alert("Tidak ada data inventaris yang bisa diekspor.");
      return;
    }

    // 1. Tentukan Header Kolom CSV
    const headers = ['SKU', 'Nama Produk', 'Kategori', 'Stok (Unit)', 'Harga (Rp)', 'Status', 'Rekomendasi AI'];
    
    // 2. Map data produk menjadi baris-baris CSV
    const rows = data.products.map(p => [
      `"${p.sku}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      p.stock,
      p.price,
      `"${p.status}"`,
      `"${p.recommendation}"`
    ]);

    // 3. Gabungkan Header dan Baris dengan koma dan baris baru
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // 4. Buat file Blob CSV dan otomatis unduh di browser
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    // Beri nama file dinamis dengan tanggal hari ini
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Laporan_Inventaris_OmnisightsBI_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredProducts = data?.products?.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || p.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  }) ?? [];

  const criticalCount = data?.products?.filter((p) => p.severity === 'critical').length ?? 0;
  const warningCount = data?.products?.filter((p) => p.severity === 'warning').length ?? 0;
  const safeCount = data?.products?.filter((p) => p.severity === 'safe').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Anomaly Detection & Smart Restock</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI-driven predictive analysis for optimal inventory management.</p>
        </div>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/50 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical Anomalies</p>
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <h4 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{criticalCount}</h4>
          <p className="text-sm text-red-500 mt-2 font-medium">Requires immediate attention</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/50 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Depleting Fast</p>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <h4 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{warningCount}</h4>
          <p className="text-sm text-amber-600 mt-2 font-medium">Monitor closely</p>
        </div>
        <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 p-6 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-800 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Healthy Stock</p>
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h4 className="text-4xl font-bold text-brand-900 dark:text-brand-100 mt-3">{safeCount}</h4>
          <p className="text-sm text-brand-600 dark:text-brand-400 mt-2 font-medium">Optimum levels</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <Package className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventory Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{filteredProducts.length} products</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all w-48"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white border border-transparent focus:border-brand-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="safe">Safe</option>
              </select>
            </div>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">AI Recommendation</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
                      <span className="text-sm text-slate-500">Loading inventory data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    No products match your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const config = severityConfig[item.severity] ?? severityConfig.safe;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors text-slate-600 dark:text-slate-300">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${item.stock < 20 ? 'text-red-600 dark:text-red-400' : item.stock < 100 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {item.stock}
                          </span>
                          <span className="text-xs text-slate-400">units</span>
                        </div>
                        {/* Stock bar */}
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.stock < 20 ? 'bg-red-500' : item.stock < 100 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((item.stock / 500) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.severity === 'critical' && <Zap className={`w-4 h-4 ${config.icon} flex-shrink-0`} />}
                          {item.severity === 'warning' && <Zap className={`w-4 h-4 ${config.icon} flex-shrink-0`} />}
                          {item.severity === 'safe' && <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          <span className={`text-xs ${item.severity === 'critical' ? 'text-slate-900 dark:text-white font-semibold' : ''}`}>
                            {item.recommendation}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Alerts</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">System-generated alerts from AI monitoring</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="p-4 px-6 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alert.severity === 'CRITICAL'
                        ? 'text-red-500'
                        : alert.severity === 'HIGH'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{alert.description}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full flex-shrink-0">
                  {alert.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
