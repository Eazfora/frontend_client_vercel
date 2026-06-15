import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Filter, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../utils/currency';
import axios from 'axios';

// Pastikan base URL ini sesuai dengan backend NestJS kamu
const API_BASE = 'https://backend-service-vercel-up9v.vercel.app';

interface ChartDataPoint {
  date: string;
  actual: number | null;
  predicted: number | null;
  lowerBound: number | null;
  upperBound: number | null;
}

export default function AIForecast() {
  const { t } = useTranslation();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [region] = useState('All');


  // 1. State Filter
  const [category, setCategory] = useState('All');
  
  // Set default: 30 hari yang lalu sampai hari ini
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  // 2. State Data Dinamis
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  // 3. State Insights dari AI (Sudah dibersihkan dari nextMonthTarget)
  const [insights, setInsights] = useState({
    anomalySpike: 0,
    anomalyCategory: 'Semua',
    confidenceScore: 0,
    correlation: { promo: 0, weekend: 0 },
  });

  // 4. State UI (Loading & Modal)
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // ==========================================
  // FETCH 1: AMBIL DAFTAR KATEGORI UNTUK DROPDOWN
  // ==========================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE}/api/dashboard/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // MASUKKAN LOG INI UNTUK DEBUGGING:
        console.log('Cek Raw Response Kategori:', response.data);

        const fetchedData = response.data.data?.data || response.data.data || response.data;
        
        // MASUKKAN LOG INI JUGA:
        console.log('Hasil mapping (fetchedData):', fetchedData);

        if (Array.isArray(fetchedData)) {
          setDbCategories(fetchedData);
        } else {
          console.warn('Data kategori bukan array! Gagal set state.');
        }
      } catch (error) {
        console.error('Gagal memuat daftar kategori:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // ==========================================
  // FETCH 2: AMBIL DATA GRAFIK & INSIGHTS 
  // (Dipanggil ulang setiap kali filter diubah)
  // ==========================================
  useEffect(() => {
    const fetchForecastData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE}/api/dashboard/forecast-chart`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { category, startDate, endDate, region },
        });

        // Pelindung Anti-Crash untuk Array Map
        const rawChartData = Array.isArray(response.data?.data) 
          ? response.data.data 
          : Array.isArray(response.data) ? response.data : [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedData: ChartDataPoint[] = rawChartData.map((item: any) => {
          // Membuat batas bayangan/toleransi atas bawah
          const lower = item.predicted ? Math.round(item.predicted * 0.92) : null;
          const upper = item.predicted ? Math.round(item.predicted * 1.08) : null;

          return {
            date: new Date(item.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            }),
            actual: item.actual,
            predicted: item.predicted,
            lowerBound: lower,
            upperBound: upper,
          };
        });

        setChartData(processedData);

        // Proses data Insights agar card sebelah kanan ikut dinamis
        if (response.data.insights) {
          setInsights({
            anomalySpike: response.data.insights.anomalySpike || 0,
            anomalyCategory: response.data.insights.anomalyCategory || category,
            confidenceScore: response.data.insights.confidenceScore || 0,
            correlation: response.data.insights.correlation || { promo: 0, weekend: 0 },
          });
        }
      } catch (error) {
        console.error('Gagal memuat data prakiraan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecastData();
  }, [category, startDate, endDate, region, refreshTrigger]);

  // ==========================================
  // FUNGSI: LATIH ULANG MODEL AI
  // ==========================================
  const handleRetrainModel = async () => {
    setIsRetraining(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_BASE}/api/dashboard/retrain-model`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success' || response.data.message) {
        alert(response.data.message || 'Model berhasil dilatih ulang!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Model gagal dilatih: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Gagal melatih ulang model:', error);
      alert('Terjadi kesalahan saat menghubungi server AI Python.');
    } finally {
      setIsRetraining(false);
    }
  };

  // ==========================================
  // KALKULASI TOTAL UNTUK STAT CARD
  // ==========================================
  // 1. Total Aktual: Jumlahkan semua penjualan nyata di rentang tanggal kalender
  const totalActualSales = chartData.reduce((sum, item) => sum + (item.actual || 0), 0);
  
  // 2. Total Prediksi: Jumlahkan angka prediksi AI khusus untuk hari-hari masa depan
  const totalPredictedSales = chartData.reduce((sum, item) => {
    if (item.actual === null && item.predicted !== null) {
      return sum + item.predicted;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('forecast.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
            {t('forecast.subtitle')}
          </p>
        </div>
        <button
          onClick={handleRetrainModel}
          disabled={isRetraining}
          className="bg-slate-800 dark:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-900 dark:hover:bg-brand-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isRetraining ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isRetraining ? 'Melatih Model...' : t('forecast.retrain')}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* DROPDOWN KATEGORI */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Kategori:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-900 dark:text-white"
          >
            <option value="All">Semua</option>
            {dbCategories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

       {/* KALENDER RENTANG WAKTU */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Rentang:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              max={today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        
      </div>

      {/* ========================================== */}
      {/* KARTU RINGKASAN ANGKA (DARI 3 JADI 2 KARTU)  */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Kartu Aktual */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Aktual (Rentang Terpilih)</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatRupiah(totalActualSales)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-300"></span>
          </div>
        </div>
        
        {/* Kartu Prediksi */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Prakiraan (7 Hari Kedepan)</p>
            <p className="text-3xl font-bold text-brand-500 dark:text-brand-400">
              {formatRupiah(totalPredictedSales)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-brand-400"></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AREA CHART KIRI */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('forecast.volume_forecast')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('forecast.model_label')}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-800 dark:bg-slate-300"></span>
                <span className="text-slate-600 dark:text-slate-400">
                  {t('forecast.actual_sales')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-400"></span>
                <span className="text-slate-600 dark:text-slate-400">
                  {t('forecast.forecast_label')}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mb-4 text-brand-500" />
                <p>Memuat kalkulasi AI...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}jt`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                    }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) =>
                      value
                        ? [formatRupiah(Number(value)), undefined]
                        : ['-', undefined]
                    }
                  />

                  {/* Visualisasi Margin/Bound */}
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="none"
                    fill="#2dd4bf"
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                  />

                  {/* Garis Aktual */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#1e293b"
                    strokeWidth={3}
                    fill="none"
                    dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  
                  {/* Garis Prediksi AI */}
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#2dd4bf"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fill="url(#colorForecast)"
                    dot={{ r: 4, fill: '#2dd4bf', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: INSIGHTS & GROWTH */}
        <div className="space-y-6">
          <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {t('forecast.anomaly_title')}
                </h3>
                {/* TEKS ANOMALI DINAMIS */}
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  Prakiraan menunjukkan lonjakan{' '}
                  <strong className="text-brand-600 dark:text-brand-400">
                    {insights.anomalySpike}%
                  </strong>{' '}
                  yang tidak biasa dalam permintaan untuk kategori{' '}
                  <span className="font-semibold text-slate-900 dark:text-white border-b border-slate-300">
                    {insights.anomalyCategory}
                  </span>{' '}
                  diperkirakan pada akhir minggu ini.
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMatrix(true);
                  }}
                  className="text-brand-600 dark:text-brand-400 text-sm font-semibold hover:underline mt-2 flex items-center gap-1"
                >
                  Lihat matriks korelasi &rarr;
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('forecast.growth_title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Volume penjualan keseluruhan mempertahankan tren positif. Model
              prediktif menunjukkan kepercayaan tinggi berdasarkan data historis.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{t('forecast.confidence')}</span>
                {/* SKOR KEPERCAYAAN DINAMIS */}
                <span className="text-slate-900 dark:text-white font-bold">
                  {insights.confidenceScore}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${insights.confidenceScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL MATRIKS KORELASI (POP-UP)              */}
      {/* ========================================== */}
      {showMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                Analisis Korelasi Anomali
              </h3>
              <button
                onClick={() => setShowMatrix(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Nilai korelasi Pearson antara faktor eksternal dengan lonjakan
              permintaan{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {insights.anomalyCategory}
              </span>
              .
            </p>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Faktor / Variabel</th>
                    <th className="px-4 py-3 font-medium text-center">
                      Skor Korelasi
                    </th>
                    <th className="px-4 py-3 font-medium">Dampak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className="bg-white dark:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                      Promo Mingguan
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded font-mono text-xs font-semibold">
  +{insights.correlation.promo ? insights.correlation.promo : '0.85'}
</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      Sangat Kuat
                    </td>
                  </tr>
                  <tr className="bg-white dark:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                      Akhir Pekan (Weekend)
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                       <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded font-mono text-xs font-semibold">
  +{insights.correlation.weekend ? insights.correlation.weekend : '0.72'}
</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      Kuat
                    </td>
                  </tr>
                  <tr className="bg-white dark:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                      Cuaca (Curah Hujan)
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-1 rounded font-mono text-xs font-semibold">
                          -0.45
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      Negatif Sedang
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMatrix(false)}
                className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}