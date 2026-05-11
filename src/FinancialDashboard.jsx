import { useEffect, useMemo, useState } from 'react';
import {
  Coffee,
  Sun,
  Moon,
  Sparkles,
  Gift,
  Percent,
  Users,
  Calendar,
  Briefcase,
  Home,
  Zap,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  PoundSterling,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Default state                                                      */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  // Revenue levers
  daytimeSpend: 8.5,
  dailyCustomers: 45,
  operatingDays: 24,
  eveningEvents: 4,
  eveningSpend: 25.0,
  eveningCustomers: 30,
  grantIncome: 3000,
  cogsPercentage: 30,
  // Fixed costs
  directorSalary: 4800,
  staffWages: 3000,
  rent: 2000,
  utilities: 800,
  insuranceTech: 500,
};

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

const gbp0 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const gbp2 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtGBP = (n) => gbp0.format(Number.isFinite(n) ? n : 0);
const fmtGBPPrecise = (n) => gbp2.format(Number.isFinite(n) ? n : 0);

/* ------------------------------------------------------------------ */
/*  Lever / cost configuration                                         */
/* ------------------------------------------------------------------ */

const DAYTIME_LEVERS = [
  {
    key: 'daytimeSpend',
    label: 'Average spend per customer',
    description: 'Coffee, brunch, retail per head',
    icon: PoundSterling,
    min: 0,
    max: 30,
    step: 0.25,
    prefix: '£',
    decimals: 2,
    format: fmtGBPPrecise,
  },
  {
    key: 'dailyCustomers',
    label: 'Daily customers',
    description: 'People served on a typical day',
    icon: Users,
    min: 0,
    max: 200,
    step: 1,
    suffix: 'people',
    decimals: 0,
    format: (v) => `${v.toLocaleString('en-GB')} people`,
  },
  {
    key: 'operatingDays',
    label: 'Operating days per month',
    description: 'Trading days in a typical month',
    icon: Calendar,
    min: 0,
    max: 31,
    step: 1,
    suffix: 'days',
    decimals: 0,
    format: (v) => `${v} days`,
  },
];

const EVENING_LEVERS = [
  {
    key: 'eveningSpend',
    label: 'Average spend per guest',
    description: 'Food + drinks per attendee',
    icon: PoundSterling,
    min: 0,
    max: 100,
    step: 0.5,
    prefix: '£',
    decimals: 2,
    format: fmtGBPPrecise,
  },
  {
    key: 'eveningCustomers',
    label: 'Guests per event',
    description: 'Average attendance',
    icon: Users,
    min: 0,
    max: 150,
    step: 1,
    suffix: 'guests',
    decimals: 0,
    format: (v) => `${v.toLocaleString('en-GB')} guests`,
  },
  {
    key: 'eveningEvents',
    label: 'Evening events per month',
    description: 'Hires, supper clubs, gigs',
    icon: Sparkles,
    min: 0,
    max: 30,
    step: 1,
    suffix: 'events',
    decimals: 0,
    format: (v) => `${v} events`,
  },
];

const OTHER_LEVERS = [
  {
    key: 'grantIncome',
    label: 'Grant income',
    description: 'Other monthly funding',
    icon: Gift,
    min: 0,
    max: 20000,
    step: 100,
    prefix: '£',
    decimals: 0,
    format: fmtGBP,
  },
  {
    key: 'cogsPercentage',
    label: 'Cost of goods sold',
    description: 'Ingredients & stock as % of trading revenue',
    icon: Percent,
    min: 0,
    max: 100,
    step: 1,
    suffix: '%',
    decimals: 0,
    format: (v) => `${v}%`,
  },
];

const FIXED_COSTS = [
  { key: 'directorSalary', label: 'Director salary', icon: Briefcase },
  { key: 'staffWages', label: 'Staff wages', icon: Users },
  { key: 'rent', label: 'Rent', icon: Home },
  { key: 'utilities', label: 'Utilities', icon: Zap },
  { key: 'insuranceTech', label: 'Insurance & technology', icon: ShieldCheck },
];

/* ------------------------------------------------------------------ */
/*  Number input with a friendly typing experience                     */
/* ------------------------------------------------------------------ */

function NumberField({
  id,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  decimals = 0,
  ariaLabel,
  ariaDescribedBy,
  prefix,
  suffix,
  className = '',
}) {
  // Local string state so users can freely type "8." or clear the field
  // without the controlled value snapping back.
  const [local, setLocal] = useState(
    decimals > 0 ? Number(value).toFixed(decimals) : String(value),
  );

  useEffect(() => {
    // Resync when the upstream value changes (e.g. slider moved, reset).
    const next = decimals > 0 ? Number(value).toFixed(decimals) : String(value);
    setLocal((prev) => (Number(prev) === Number(next) ? prev : next));
  }, [value, decimals]);

  const commit = (raw) => {
    if (raw === '' || raw === '-' || raw === '.') {
      onChange(0);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(min, max != null ? Math.min(max, n) : n);
    onChange(clamped);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 text-sm font-medium text-slate-500"
        >
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          // Update parent only when input is a valid finished number
          if (!/[.\-]$/.test(e.target.value) && e.target.value !== '') {
            commit(e.target.value);
          }
        }}
        onBlur={() => commit(local)}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={`no-spin w-full rounded-lg border border-slate-300 bg-white py-2 text-right text-sm font-semibold text-slate-900 shadow-sm transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 ${
          prefix ? 'pl-7' : 'pl-3'
        } ${suffix ? 'pr-14' : 'pr-3'}`}
      />
      {suffix && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 text-xs font-medium text-slate-500"
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lever (slider + number) input                                      */
/* ------------------------------------------------------------------ */

function LeverInput({ lever, value, onChange }) {
  const {
    key,
    label,
    description,
    icon: Icon,
    min,
    max,
    step,
    prefix,
    suffix,
    decimals,
    format,
  } = lever;
  const inputId = `${key}-input`;
  const sliderId = `${key}-slider`;
  const descId = `${key}-desc`;

  const progress = useMemo(() => {
    if (max === min) return 0;
    const p = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, p));
  }, [value, min, max]);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={inputId}
          className="flex flex-1 items-start gap-2 text-sm font-medium text-slate-800"
        >
          <Icon
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
          />
          <span className="flex flex-col">
            <span>{label}</span>
            <span id={descId} className="text-xs font-normal text-slate-500">
              {description}
            </span>
          </span>
        </label>
        <div className="w-32 shrink-0">
          <NumberField
            id={inputId}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
            ariaDescribedBy={descId}
          />
        </div>
      </div>
      <input
        id={sliderId}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} slider`}
        aria-valuetext={format(value)}
        style={{ '--progress': `${progress}%` }}
      />
      <div
        aria-hidden="true"
        className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-slate-400"
      >
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fixed-cost row (number input only)                                 */
/* ------------------------------------------------------------------ */

function FixedCostRow({ cost, value, onChange }) {
  const { key, label, icon: Icon } = cost;
  const id = `${key}-input`;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-slate-800"
      >
        <Icon aria-hidden="true" className="h-4 w-4 text-slate-500" />
        {label}
      </label>
      <div className="w-36">
        <NumberField
          id={id}
          value={value}
          onChange={onChange}
          min={0}
          step={50}
          prefix="£"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  P&L row                                                            */
/* ------------------------------------------------------------------ */

function PLRow({ label, value, tone = 'neutral', emphasis = 'normal', indent }) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-700'
      : tone === 'negative'
        ? 'text-rose-700'
        : 'text-slate-900';
  const weight =
    emphasis === 'subtotal'
      ? 'font-semibold'
      : emphasis === 'final'
        ? 'font-bold'
        : 'font-medium';
  const rowBg =
    emphasis === 'subtotal'
      ? 'bg-slate-50'
      : emphasis === 'final'
        ? 'bg-slate-100'
        : '';
  return (
    <tr className={rowBg}>
      <th
        scope="row"
        className={`py-2 ${indent ? 'pl-6' : 'pl-3'} pr-3 text-left text-sm ${weight} text-slate-700`}
      >
        {label}
      </th>
      <td className={`py-2 pl-3 pr-4 text-right text-sm tabular-nums ${weight} ${toneClass}`}>
        {value < 0 ? `−${fmtGBP(Math.abs(value))}` : fmtGBP(value)}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function FinancialDashboard() {
  const [model, setModel] = useState(DEFAULTS);

  const updateField = (key) => (value) =>
    setModel((m) => ({ ...m, [key]: Number.isFinite(value) ? value : 0 }));

  const reset = () => setModel(DEFAULTS);

  /* ---- Calculations ---------------------------------------------- */
  const calc = useMemo(() => {
    const daytimeRevenue =
      model.daytimeSpend * model.dailyCustomers * model.operatingDays;
    const eveningRevenue =
      model.eveningSpend * model.eveningCustomers * model.eveningEvents;
    const tradingRevenue = daytimeRevenue + eveningRevenue;
    const totalGrossRevenue = tradingRevenue + model.grantIncome;
    const cogsAmount = tradingRevenue * (model.cogsPercentage / 100);
    const grossProfit = totalGrossRevenue - cogsAmount;
    const totalOverheads =
      model.directorSalary +
      model.staffWages +
      model.rent +
      model.utilities +
      model.insuranceTech;
    const netProfit = grossProfit - totalOverheads;
    return {
      daytimeRevenue,
      eveningRevenue,
      tradingRevenue,
      totalGrossRevenue,
      cogsAmount,
      grossProfit,
      totalOverheads,
      netProfit,
    };
  }, [model]);

  const isProfitable = calc.netProfit >= 0;
  const annualNetProfit = calc.netProfit * 12;

  /* ---- Render ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Coffee aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Community Cafe — Financial Model
              </h1>
              <p className="text-sm text-slate-600">
                Adjust the levers to see how your monthly profit and loss responds in real time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 md:self-auto"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset to defaults
          </button>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ------------------ Inputs column ------------------ */}
          <div className="space-y-6 lg:col-span-7">
            <section
              aria-labelledby="revenue-heading"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center gap-2">
                <TrendingUp aria-hidden="true" className="h-5 w-5 text-emerald-700" />
                <h2 id="revenue-heading" className="text-lg font-semibold text-slate-900">
                  Revenue levers
                </h2>
              </div>

              <fieldset className="space-y-5">
                <legend className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Sun aria-hidden="true" className="h-4 w-4 text-amber-500" />
                  Daytime trade
                </legend>
                {DAYTIME_LEVERS.map((lever) => (
                  <LeverInput
                    key={lever.key}
                    lever={lever}
                    value={model[lever.key]}
                    onChange={updateField(lever.key)}
                  />
                ))}
              </fieldset>

              <hr className="my-6 border-slate-200" />

              <fieldset className="space-y-5">
                <legend className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Moon aria-hidden="true" className="h-4 w-4 text-indigo-500" />
                  Evening events
                </legend>
                {EVENING_LEVERS.map((lever) => (
                  <LeverInput
                    key={lever.key}
                    lever={lever}
                    value={model[lever.key]}
                    onChange={updateField(lever.key)}
                  />
                ))}
              </fieldset>

              <hr className="my-6 border-slate-200" />

              <fieldset className="space-y-5">
                <legend className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Gift aria-hidden="true" className="h-4 w-4 text-pink-500" />
                  Other income &amp; cost ratios
                </legend>
                {OTHER_LEVERS.map((lever) => (
                  <LeverInput
                    key={lever.key}
                    lever={lever}
                    value={model[lever.key]}
                    onChange={updateField(lever.key)}
                  />
                ))}
              </fieldset>
            </section>

            <section
              aria-labelledby="fixed-heading"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <TrendingDown aria-hidden="true" className="h-5 w-5 text-rose-600" />
                <h2 id="fixed-heading" className="text-lg font-semibold text-slate-900">
                  Fixed costs (monthly overheads)
                </h2>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Costs that don&apos;t scale with how busy you are this month.
              </p>
              <ul className="divide-y divide-slate-200">
                {FIXED_COSTS.map((cost) => (
                  <li key={cost.key}>
                    <FixedCostRow
                      cost={cost}
                      value={model[cost.key]}
                      onChange={updateField(cost.key)}
                    />
                  </li>
                ))}
                <li className="flex items-center justify-between py-3 pt-4 text-sm font-semibold text-slate-900">
                  <span>Total overheads</span>
                  <span className="tabular-nums text-rose-700">
                    {fmtGBP(calc.totalOverheads)}
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* ------------------ Output column ------------------ */}
          <section
            aria-labelledby="pl-heading"
            aria-live="polite"
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Bottom line card */}
              <div
                className={`rounded-2xl border p-6 shadow-sm transition-colors ${
                  isProfitable
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isProfitable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      The bottom line
                    </p>
                    <h2
                      id="pl-heading"
                      className="mt-1 text-sm font-medium text-slate-700"
                    >
                      Monthly net profit
                    </h2>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isProfitable
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isProfitable ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </span>
                </div>
                <p
                  className={`mt-4 text-4xl font-bold tabular-nums sm:text-5xl ${
                    isProfitable ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {calc.netProfit < 0
                    ? `−${fmtGBP(Math.abs(calc.netProfit))}`
                    : fmtGBP(calc.netProfit)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {isProfitable ? 'Profitable' : 'Operating at a loss'} ·{' '}
                  <span className="font-semibold text-slate-900">
                    {annualNetProfit < 0
                      ? `−${fmtGBP(Math.abs(annualNetProfit))}`
                      : fmtGBP(annualNetProfit)}
                  </span>{' '}
                  annualised
                </p>
              </div>

              {/* P&L breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    Profit &amp; loss breakdown
                  </h3>
                  <p className="text-xs text-slate-500">All figures shown monthly.</p>
                </div>
                <table className="w-full">
                  <caption className="sr-only">
                    Monthly profit and loss breakdown derived from the inputs.
                  </caption>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Line item</th>
                      <th scope="col">Amount in GBP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <PLRow
                      label="Daytime revenue"
                      value={calc.daytimeRevenue}
                      tone="positive"
                    />
                    <PLRow
                      label="Evening revenue"
                      value={calc.eveningRevenue}
                      tone="positive"
                    />
                    <PLRow
                      label="Grant income"
                      value={model.grantIncome}
                      tone="positive"
                    />
                    <PLRow
                      label="Total gross revenue"
                      value={calc.totalGrossRevenue}
                      emphasis="subtotal"
                    />
                    <PLRow
                      label={`Cost of goods sold (${model.cogsPercentage}%)`}
                      value={-calc.cogsAmount}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Gross profit"
                      value={calc.grossProfit}
                      emphasis="subtotal"
                      tone={calc.grossProfit >= 0 ? 'positive' : 'negative'}
                    />
                    <PLRow
                      label="Total overheads"
                      value={-calc.totalOverheads}
                      tone="negative"
                    />
                    <PLRow
                      label="Net profit"
                      value={calc.netProfit}
                      emphasis="final"
                      tone={isProfitable ? 'positive' : 'negative'}
                    />
                  </tbody>
                </table>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Gross margin"
                  value={
                    calc.totalGrossRevenue > 0
                      ? `${((calc.grossProfit / calc.totalGrossRevenue) * 100).toFixed(1)}%`
                      : '—'
                  }
                />
                <StatCard
                  label="Net margin"
                  value={
                    calc.totalGrossRevenue > 0
                      ? `${((calc.netProfit / calc.totalGrossRevenue) * 100).toFixed(1)}%`
                      : '—'
                  }
                  tone={isProfitable ? 'positive' : 'negative'}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
        Indicative model only — figures are illustrative and not financial advice.
      </footer>
    </div>
  );
}

function StatCard({ label, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-700'
      : tone === 'negative'
        ? 'text-rose-700'
        : 'text-slate-900';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}
