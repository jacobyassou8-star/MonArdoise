import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface TurnoverChartProps {
  boutiqueId?: string; // specific boutique or all
}

export const TurnoverChart: React.FC<TurnoverChartProps> = ({ boutiqueId }) => {
  const { transactions, merchant, boutiques } = useApp();
  const [chartMode, setChartMode] = useState<'total' | 'split'>('total');

  // Compute daily turnover over the last 30 days
  const { data, totalCA, cashTotal, creditTotal, avgDaily, maxDay } = useMemo(() => {
    const daysArray: {
      date: string;
      label: string;
      comptant: number;
      credit: number;
      total: number;
      count: number;
    }[] = [];

    const now = new Date();
    // Normalize to end of today
    now.setHours(23, 59, 59, 999);

    // Build map of the last 30 days
    const dayMap = new Map<string, { comptant: number; credit: number; total: number; count: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dayMap.set(key, { comptant: 0, credit: 0, total: 0, count: 0 });
    }

    // Filter relevant transactions (active sales: vente_comptant or vente_credit)
    const salesTx = transactions.filter((t) => {
      if (t.status !== 'active') return false;
      if (t.type !== 'vente_comptant' && t.type !== 'vente_credit') return false;
      if (boutiqueId && boutiqueId !== 'all' && t.boutiqueId !== boutiqueId) return false;
      return true;
    });

    let sumTotal = 0;
    let sumCash = 0;
    let sumCredit = 0;

    salesTx.forEach((t) => {
      const dayKey = t.timestamp.slice(0, 10);
      if (dayMap.has(dayKey)) {
        const item = dayMap.get(dayKey)!;
        if (t.type === 'vente_comptant') {
          item.comptant += t.amount;
          sumCash += t.amount;
        } else {
          item.credit += t.amount;
          sumCredit += t.amount;
        }
        item.total += t.amount;
        item.count += 1;
        sumTotal += t.amount;
      }
    });

    let highestDay = { label: 'Aucun', amount: 0 };

    dayMap.forEach((val, key) => {
      const parts = key.split('-');
      const dayFormatted = `${parts[2]}/${parts[1]}`;
      daysArray.push({
        date: key,
        label: dayFormatted,
        comptant: val.comptant,
        credit: val.credit,
        total: val.total,
        count: val.count,
      });

      if (val.total > highestDay.amount) {
        highestDay = { label: dayFormatted, amount: val.total };
      }
    });

    const average = Math.round(sumTotal / 30);

    return {
      data: daysArray,
      totalCA: sumTotal,
      cashTotal: sumCash,
      creditTotal: sumCredit,
      avgDaily: average,
      maxDay: highestDay,
    };
  }, [transactions, boutiqueId]);

  const activeBoutiqueName = useMemo(() => {
    if (!boutiqueId || boutiqueId === 'all') return 'Toutes les boutiques';
    const b = boutiques.find((item) => item.id === boutiqueId);
    return b ? b.name : 'Boutique active';
  }, [boutiqueId, boutiques]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Analyse d'Activité Commerciale
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              30 derniers jours
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
            <span>Évolution du Chiffre d'Affaires</span>
            <span className="text-xs font-normal text-slate-400 truncate max-w-[150px] sm:max-w-[220px]">
              ({activeBoutiqueName})
            </span>
          </h3>
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('total')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              chartMode === 'total'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            CA Global
          </button>
          <button
            type="button"
            onClick={() => setChartMode('split')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              chartMode === 'split'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Comptant vs Crédit
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* KPI 1: Total CA */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total CA (30j)</div>
          <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatCurrency(totalCA, merchant.currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Ventes enregistrées</span>
          </div>
        </div>

        {/* KPI 2: Ventes Comptant */}
        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Comptant (Cash/OM)</div>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
            {formatCurrency(cashTotal, merchant.currency)}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            {totalCA > 0 ? `${Math.round((cashTotal / totalCA) * 100)}% du total` : '0%'}
          </div>
        </div>

        {/* KPI 3: Ventes à Crédit */}
        <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Ventes à Crédit</div>
          <div className="text-lg font-black text-amber-700 dark:text-amber-300 tabular-nums mt-0.5">
            {formatCurrency(creditTotal, merchant.currency)}
          </div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
            {totalCA > 0 ? `${Math.round((creditTotal / totalCA) * 100)}% sur Ardoise` : '0%'}
          </div>
        </div>

        {/* KPI 4: Moyenne / Pic */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Moyenne / Jour</div>
          <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
            {formatCurrency(avgDaily, merchant.currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Pic : {maxDay.label} ({formatCurrency(maxDay.amount, merchant.currency)})
          </div>
        </div>

      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorComptant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

            <XAxis 
              dataKey="label" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              interval="preserveStartEnd"
              minTickGap={20}
            />

            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              tickFormatter={(v) => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                if (v >= 1000) return `${Math.round(v / 1000)}k`;
                return v;
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xl text-xs space-y-1 border border-slate-800">
                      <div className="font-bold border-b border-slate-800 pb-1 text-slate-300">
                        Date : {d.label} ({d.date})
                      </div>
                      <div className="pt-0.5 space-y-0.5 font-mono text-[11px]">
                        <div className="text-white font-bold flex justify-between gap-4">
                          <span>CA Total :</span>
                          <span className="tabular-nums">{formatCurrency(d.total, merchant.currency)}</span>
                        </div>
                        <div className="text-emerald-400 flex justify-between gap-4">
                          <span>Comptant :</span>
                          <span className="tabular-nums">{formatCurrency(d.comptant, merchant.currency)}</span>
                        </div>
                        <div className="text-amber-400 flex justify-between gap-4">
                          <span>À Crédit :</span>
                          <span className="tabular-nums">{formatCurrency(d.credit, merchant.currency)}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] pt-1">
                          {d.count} vente{d.count > 1 ? 's' : ''} enregistrée{d.count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {chartMode === 'total' ? (
              <Area
                type="monotone"
                dataKey="total"
                name="Chiffre d'Affaires"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="comptant"
                  name="Ventes Comptant"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComptant)"
                />
                <Area
                  type="monotone"
                  dataKey="credit"
                  name="Ventes à Crédit"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCredit)"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Helper notes */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          {chartMode === 'total' ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span>Chiffre d'affaires journalier (Comptant + Crédit)</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Ventes comptant (Encaissé)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>Ventes à crédit (Créance ardoise)</span>
              </div>
            </>
          )}
        </div>

        <span className="text-[10px] text-slate-400">
          Chaque nouvelle vente comptant ou à crédit met à jour ce graphique en temps réel
        </span>
      </div>
    </div>
  );
};
