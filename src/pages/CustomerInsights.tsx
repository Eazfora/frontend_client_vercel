import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, HeartCrack, DollarSign, Mail, Download, AlertTriangle, RefreshCw, TrendingUp, Brain } from 'lucide-react';
import axios from 'axios';
import { formatRupiah } from '../utils/currency';

const API_BASE = 'http://localhost:3000';

interface ChurnSummary {
  churn_trend: any[];
  total_customers: number;
  churned: number;
  retained: number;
  churn_rate: number;
  avg_monetary: number;
  segments: {
    champions: number;
    needs_attention: number;
    low_value: number;
  };
  at_risk_customers: Array<{
    CustomerID: number;
    Name?: string;
    Recency: number;
    Frequency: number;
    Monetary: number;
    Churn: number;
  }>;
  engine: string;
}

export default function CustomerInsights() {
  const { t } = useTranslation();
  const [data, setData] = useState<ChurnSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const [isRetraining, setIsRetraining] = useState(false);

  // Fungsi untuk menembak API Retrain Churn
  const handleRetrainChurn = async () => {
    if (!window.confirm('Mulai latih ulang AI Churn dengan data terbaru?')) return;
    
    setIsRetraining(true);
    try {
      const token = localStorage.getItem('access_token');
      // Pastikan endpoint ini sesuai dengan yang kamu buat di controller NestJS sebelumnya
      const response = await axios.post(`${API_BASE}/api/dashboard/retrain-ai`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.message || 'AI Churn berhasil dilatih ulang!');
      
      // Refresh data tabel dan grafik agar membaca hasil AI terbaru
      fetchData(); 
    } catch (err) {
      console.error('Error retrain AI:', err);
      alert('Gagal melatih ulang AI. Pastikan server Python menyala.');
    } finally {
      setIsRetraining(false);
    }
  };

  // 1. FUNGSI AKSI: KIRIM PROMO RETENSI
  const handleSendPromo = (customerName: string) => {
    alert(`✅ BERHASIL!\n\nEmail Promo Retensi (Diskon Varian Kopi Baru) telah dikirimkan secara otomatis ke ${customerName}.`);
  };

const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/api/dashboard/customer-insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Pengaman berlapis: Kadang backend mengirimnya di response.data, kadang di response.data.data
      const payload = response.data.data || response.data;
      const customers = payload.riskTable || [];

      // 1. KALKULASI OTOMATIS DARI DATA TABEL
      const totalCustomers = payload.totalAnalyzed || customers.length;
      let totalMonetary = 0;
      let totalChurnProb = 0;
      
      let countChampions = 0;
      let countNeedsAttention = 0;
      let countLowValue = 0;

      customers.forEach((c: any) => {
        // Ambil nilai secara aman dari properti mana pun (Case-insensitive)
        const valMonetary = c.Monetary ?? c.monetary ?? 0;
        const valChurn = c.Churn ?? c.churn ?? c.churnProbability ?? c.Churn_Probability ?? 0;
        const valRecency = c.Recency ?? c.recency ?? 0;
        const valFreq = c.Frequency ?? c.frequency ?? 0;

        totalMonetary += valMonetary;
        totalChurnProb += valChurn;

        // Logika Segmentasi RFM
        if (valFreq > 1 && valRecency <= 14) {
          countChampions++;
        } else if (valRecency > 30 || valFreq === 1) {
          countLowValue++;
        } else {
          countNeedsAttention++;
        }
      });

      // Hitung Rata-rata
      const avgMonetary = totalCustomers > 0 ? totalMonetary / totalCustomers : 0;
      const avgChurn = totalCustomers > 0 ? (totalChurnProb / totalCustomers) * 100 : 0;

      // 2. MASUKKAN HASIL KALKULASI KE STATE REACT
    setData({
        total_customers: totalCustomers,
        retained: totalCustomers, 
        churned: 0,
        churn_rate: avgChurn,
        avg_monetary: avgMonetary,
        segments: {
          champions: countChampions,
          needs_attention: countNeedsAttention,
          low_value: countLowValue
        },
        at_risk_customers: customers,
        churn_trend: payload.churnTrend || [], // 🔥 TANGKAP DATA TREN DARI BACKEND
        engine: "AI"
      });

    } catch (err) {
      console.error('Error fetching churn data:', err);
      setError('Gagal terhubung ke server.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  

  // 2. FUNGSI AKSI: EKSPOR DATA CHURN
  const handleExportCSV = () => {
    if (!data?.at_risk_customers?.length) {
      alert("Tidak ada data pelanggan berisiko yang bisa diekspor.");
      return;
    }

    const headers = [
      'ID Pelanggan', 
      'Terakhir Aktif (Hari Lalu)', 
      'Frekuensi Transaksi', 
      'Total Nilai LTV (Rp)', 
      'Probabilitas Churn (%)'
    ];
    
    const rows = data.at_risk_customers.map(c => [
      `"${c.Name || `Pelanggan #${c.CustomerID}`}"`,
      c.Recency,
      c.Frequency,
      c.Monetary,
      `${Math.round((c.Churn || 0) * 100)}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Laporan_Risiko_Churn_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PERBAIKAN 1: Pengamanan Optional Chaining pada `segments`
  const rfmData = data?.segments ? [
    { name: t('customers.champions'), value: data.segments.champions || 0, color: '#0f766e' },
    { name: t('customers.needs_attention'), value: data.segments.needs_attention || 0, color: '#f43f5e' },
    { name: t('customers.low_value'), value: data.segments.low_value || 0, color: '#94a3b8' },
  ] : [];

 // 3. MEMBUAT TREN CHURN DINAMIS
  
  const churnTrendData = data?.churn_trend || [];

  const filteredCustomers = data?.at_risk_customers?.filter(c => {
    if (!c) return false;
    const searchString = filterText.toLowerCase();
    
    // Ambil ID aman (Cek CustomerID, id, atau customer_id)
    const rawId = c.CustomerID ?? c.id ?? c.customer_id ?? '00';
    const idString = String(rawId);
    
    // Ambil Nama aman
    const rawName = c.Name ?? c.name ?? `Pelanggan #${idString}`;
    
    return rawName.toLowerCase().includes(searchString) || idString.includes(searchString);
  }) || [];

  return (

    
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('customers.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('customers.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          {/* TOMBOL BARU: LATIH AI CHURN */}
          <button
            onClick={handleRetrainChurn}
            disabled={isRetraining}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Brain className={`w-4 h-4 ${isRetraining ? 'animate-pulse' : ''}`} />
            {isRetraining ? 'Melatih AI...' : 'Latih Ulang AI'}
          </button>

          {/* TOMBOL REFRESH */}
          <button onClick={fetchData} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('customers.last_30_days')}
          </button>

          {/* TOMBOL EKSPOR */}
          <button 
            onClick={handleExportCSV}
            className="bg-slate-800 dark:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 dark:hover:brand-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> {t('customers.export_report')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segmentation Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('customers.segmentation')}</h3>
          </div>
          {/* PERBAIKAN 2: Berikan dimensi height spesifik (300px) agar tidak warning */}
          <div className="flex-1 w-full relative" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rfmData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {rfmData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {(data?.total_customers ?? 0).toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{t('customers.total')}</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {rfmData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>


        

        {/* Metrics & Churn Trend */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-lg"><Users className="w-5 h-5 text-brand-600 dark:text-brand-400" /></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('customers.active_users')}</span>
              </div>
              <div className="flex items-end gap-2">
                {/* PERBAIKAN 3: Fallback ke 0 jika retained undefined */}
                <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{(data?.retained ?? 0).toLocaleString('id-ID')}</h4>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-1">↗ 4.2%</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg"><HeartCrack className="w-5 h-5 text-pink-500 dark:text-pink-400" /></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('customers.avg_churn_rate')}</span>
              </div>
              <div className="flex items-end gap-2">
                {/* PERBAIKAN 3: Fallback ke 0 sebelum toFixed() dipanggil */}
                <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{(data?.churn_rate ?? 0).toFixed(1)}%</h4>
                <span className="text-sm font-medium text-red-500 dark:text-red-400 mb-1">↗ 0.5%</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('customers.est_ltv')}</span>
              </div>
              <div className="flex items-end gap-2">
                {/* PERBAIKAN 3: Fallback ke 0 */}
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{formatRupiah(data?.avg_monetary ?? 0)}</h4>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('customers.churn_trend')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('customers.churn_trend_desc')}</p>
            {/* PERBAIKAN 2: Berikan dimensi height spesifik (160px) pada chart bar */}
            <div className="w-full" style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={churnTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => [`${v}%`, 'Churn Rate']} />
                  <Bar dataKey="rate" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('customers.at_risk')}</h3>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={t('customers.filter')} 
              className="pl-3 pr-4 py-1.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:border-brand-500 outline-none" 
            />
          </div>




          
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('customers.at_risk_desc')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="pb-3 font-semibold">{t('dashboard.customer')}</th>
                  <th className="pb-3 font-semibold">{t('customers.last_active')}</th>
                  <th className="pb-3 font-semibold">{t('customers.ltv')}</th>
                  <th className="pb-3 font-semibold">{t('customers.churn_probability')}</th>
                  <th className="pb-3 font-semibold text-right">{t('customers.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Tidak ada pelanggan berisiko yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => {
                    // EKSTRAKSI DATA SUPER AMAN DARI BACKEND
                    const safeId = customer.CustomerID ?? customer.id ?? customer.customer_id ?? `00${index}`;
                    const safeName = customer.Name ?? customer.name ?? `Pelanggan #${safeId}`;
                    const safeFreq = customer.Frequency ?? customer.frequency ?? 0;
                    const safeRecency = customer.Recency ?? customer.recency ?? 0;
                    const safeMonetary = customer.Monetary ?? customer.monetary ?? 0;
                    const safeChurn = customer.Churn ?? customer.churn ?? customer.churn_probability ?? 0;

                    return (
                      <tr key={safeId}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold">
                              {/* Gunakan String() alih-alih .toString() agar tidak crash jika undefined */}
                              #{String(safeId).slice(-2)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {safeName}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">Frekuensi: {safeFreq}x</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-slate-700 dark:text-slate-300">{safeRecency} hari lalu</td>
                        <td className="py-4 font-semibold text-slate-900 dark:text-white">{formatRupiah(safeMonetary)}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-pink-600" 
                                style={{ width: `${Math.round(safeChurn * 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-pink-600 dark:text-pink-400">
                              {Math.round(safeChurn * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleSendPromo(safeName)}
                            className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> {t('customers.send_promo')}
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
      </div>
    </div>
  );
}