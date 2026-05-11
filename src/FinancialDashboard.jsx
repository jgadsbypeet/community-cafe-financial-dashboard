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
  Calculator,
  PiggyBank,
  Landmark,
  Receipt,
  Download,
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
  // Fixed costs (monthly)
  staffWages: 3000,
  rent: 2000,
  utilities: 800,
  insuranceTech: 500,
  // Director payroll (annual figures unless noted)
  directorGrossSalary: 50000,
  employerPensionRate: 3,
  pensionThreshold: 6240,
  employerNIRate: 15,
  niThreshold: 5000,
  employmentAllowance: 10500,
  // VAT
  vatThreshold: 90000,
  vatRate: 20,
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
  { key: 'staffWages', label: 'Staff wages', icon: Users },
  { key: 'rent', label: 'Rent', icon: Home },
  { key: 'utilities', label: 'Utilities', icon: Zap },
  { key: 'insuranceTech', label: 'Insurance & technology', icon: ShieldCheck },
];

const PAYROLL_FIELDS = [
  {
    key: 'directorGrossSalary',
    label: 'Director gross salary',
    helper: 'Annual',
    icon: Briefcase,
    step: 500,
  },
  {
    key: 'employerPensionRate',
    label: 'Employer pension rate',
    helper: 'Auto-enrolment %',
    icon: PiggyBank,
    prefix: null,
    suffix: '%',
    step: 0.5,
    max: 100,
    decimals: 1,
  },
  {
    key: 'pensionThreshold',
    label: 'Pension qualifying threshold',
    helper: 'Annual lower band',
    icon: PiggyBank,
    step: 100,
  },
  {
    key: 'employerNIRate',
    label: 'Employer NI rate',
    helper: 'Secondary Class 1',
    icon: Percent,
    prefix: null,
    suffix: '%',
    step: 0.5,
    max: 100,
    decimals: 1,
  },
  {
    key: 'niThreshold',
    label: 'NI secondary threshold',
    helper: 'Annual',
    icon: Landmark,
    step: 100,
  },
  {
    key: 'employmentAllowance',
    label: 'Employment allowance',
    helper: 'Annual offset against NI',
    icon: Landmark,
    step: 100,
  },
];

const VAT_FIELDS = [
  {
    key: 'vatThreshold',
    label: 'VAT registration threshold',
    helper: 'Annual taxable turnover',
    icon: Receipt,
    step: 1000,
  },
  {
    key: 'vatRate',
    label: 'VAT rate',
    helper: 'Standard rate',
    icon: Percent,
    prefix: null,
    suffix: '%',
    step: 1,
    max: 100,
  },
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
  const { key, label, icon: Icon, helper } = cost;
  const prefix = cost.prefix === null ? null : (cost.prefix ?? '£');
  const suffix = cost.suffix;
  const step = cost.step ?? 50;
  const max = cost.max;
  const decimals = cost.decimals ?? 0;
  const id = `${key}-input`;
  const descId = helper ? `${key}-desc` : undefined;
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label
        htmlFor={id}
        className="flex flex-1 items-start gap-2 text-sm font-medium text-slate-800"
      >
        <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        <span className="flex flex-col">
          <span>{label}</span>
          {helper && (
            <span id={descId} className="text-xs font-normal text-slate-500">
              {helper}
            </span>
          )}
        </span>
      </label>
      <div className="w-36 shrink-0">
        <NumberField
          id={id}
          value={value}
          onChange={onChange}
          min={0}
          max={max}
          step={step}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          ariaDescribedBy={descId}
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
  const renderAmount = (n) =>
    n < 0 ? `−${fmtGBP(Math.abs(n))}` : fmtGBP(n);
  const annual = value * 12;
  return (
    <tr className={rowBg}>
      <th
        scope="row"
        className={`py-2 ${indent ? 'pl-6' : 'pl-3'} pr-3 text-left text-sm ${weight} text-slate-700`}
      >
        {label}
      </th>
      <td
        className={`py-2 pl-3 pr-3 text-right text-sm tabular-nums ${weight} ${toneClass}`}
      >
        {renderAmount(value)}
      </td>
      <td
        className={`py-2 pl-3 pr-4 text-right text-sm tabular-nums ${weight} ${toneClass}`}
      >
        {renderAmount(annual)}
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

  /* ---- CSV export ------------------------------------------------ */
  const exportToCSV = () => {
    // Snapshot the values at the moment of click. `model` and `calc` are
    // captured from the current render, so they already reflect the latest
    // slider / number-input positions (including dynamically derived figures
    // such as VAT payable and employer NI).
    const m = model;
    const c = calc;

    const escapeCell = (value) => {
      const str = String(value ?? '');
      // RFC 4180-style quoting: wrap in double quotes and escape internal quotes
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const round2 = (n) => Math.round(Number(n) * 100) / 100;

    const sections = [
      {
        heading: 'Inputs - Revenue Levers',
        rows: [
          ['Average daytime spend per customer (GBP)', round2(m.daytimeSpend)],
          ['Daily customers', m.dailyCustomers],
          ['Operating days per month', m.operatingDays],
          ['Average evening spend per guest (GBP)', round2(m.eveningSpend)],
          ['Guests per evening event', m.eveningCustomers],
          ['Evening events per month', m.eveningEvents],
          ['Grant income (GBP, monthly)', round2(m.grantIncome)],
          ['Cost of goods sold (%)', m.cogsPercentage],
        ],
      },
      {
        heading: 'Inputs - Fixed Costs',
        rows: [
          ['Staff wages (GBP, monthly)', round2(m.staffWages)],
          ['Rent (GBP, monthly)', round2(m.rent)],
          ['Utilities (GBP, monthly)', round2(m.utilities)],
          ['Insurance & technology (GBP, monthly)', round2(m.insuranceTech)],
        ],
      },
      {
        heading: 'Inputs - Tax & Payroll',
        rows: [
          ['Director gross salary (GBP, annual)', round2(m.directorGrossSalary)],
          ['Employer pension rate (%)', m.employerPensionRate],
          ['Pension qualifying threshold (GBP, annual)', round2(m.pensionThreshold)],
          ['Employer NI rate (%)', m.employerNIRate],
          ['NI secondary threshold (GBP, annual)', round2(m.niThreshold)],
          ['Employment allowance (GBP, annual)', round2(m.employmentAllowance)],
          ['VAT registration threshold (GBP, annual)', round2(m.vatThreshold)],
          ['VAT rate (%)', m.vatRate],
        ],
      },
      {
        heading: 'Outputs - Monthly P&L',
        rows: [
          ['Daytime revenue (GBP)', round2(c.daytimeRevenue)],
          ['Evening revenue (GBP)', round2(c.eveningRevenue)],
          ['Monthly trading revenue (GBP)', round2(c.monthlyTradingRevenue)],
          ['Annualised trading revenue (GBP)', round2(c.annualizedTradingRevenue)],
          ['VAT registered', c.isVatRegistered ? 'Yes' : 'No'],
          ['VAT payable (GBP, monthly)', round2(c.monthlyVatPayable)],
          ['Net trading revenue (GBP, monthly)', round2(c.netTradingRevenue)],
          ['Grant income (GBP, monthly)', round2(m.grantIncome)],
          ['Total gross revenue (GBP, monthly)', round2(c.totalGrossRevenue)],
          ['Cost of goods sold (GBP, monthly)', round2(c.cogsAmount)],
          ['Gross profit (GBP, monthly)', round2(c.grossProfit)],
          ['Director gross salary (GBP, monthly)', round2(c.monthlyGrossSalary)],
          ['Employer pension (GBP, monthly)', round2(c.monthlyPensionCost)],
          ['Employer NI (GBP, monthly)', round2(c.monthlyNiCost)],
          ['Total director cost (GBP, monthly)', round2(c.totalDirectorCost)],
          ['Total overheads (GBP, monthly)', round2(c.totalOverheads)],
          ['Net profit (GBP, monthly)', round2(c.netProfit)],
          ['Net profit (GBP, annualised)', round2(c.netProfit * 12)],
        ],
      },
    ];

    const lines = [['Category / Item', 'Value'].map(escapeCell).join(',')];
    sections.forEach((section, idx) => {
      if (idx > 0) lines.push('');
      lines.push([section.heading, ''].map(escapeCell).join(','));
      section.rows.forEach(([label, value]) => {
        lines.push([label, value].map(escapeCell).join(','));
      });
    });
    // BOM + CRLF for Excel compatibility on Windows
    const csv = '\uFEFF' + lines.join('\r\n') + '\r\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cafe-scenario-snapshot.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Defer revoke so the browser has time to start the download
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  /* ---- Calculations ---------------------------------------------- */
  const calc = useMemo(() => {
    // Revenue
    const daytimeRevenue =
      model.daytimeSpend * model.dailyCustomers * model.operatingDays;
    const eveningRevenue =
      model.eveningSpend * model.eveningCustomers * model.eveningEvents;
    const monthlyTradingRevenue = daytimeRevenue + eveningRevenue;
    const annualizedTradingRevenue = monthlyTradingRevenue * 12;

    // VAT — only payable once annualised turnover crosses the threshold.
    const isVatRegistered = annualizedTradingRevenue > model.vatThreshold;
    const monthlyVatPayable = isVatRegistered
      ? monthlyTradingRevenue -
        monthlyTradingRevenue / (1 + model.vatRate / 100)
      : 0;

    const netTradingRevenue = monthlyTradingRevenue - monthlyVatPayable;
    const totalGrossRevenue = netTradingRevenue + model.grantIncome;
    const cogsAmount = netTradingRevenue * (model.cogsPercentage / 100);
    const grossProfit = totalGrossRevenue - cogsAmount;

    // Director payroll (annual figures → monthly cost)
    const monthlyGrossSalary = model.directorGrossSalary / 12;

    const annualPensionCost =
      Math.max(0, model.directorGrossSalary - model.pensionThreshold) *
      (model.employerPensionRate / 100);
    const monthlyPensionCost = annualPensionCost / 12;

    const annualNiCost =
      Math.max(0, model.directorGrossSalary - model.niThreshold) *
      (model.employerNIRate / 100);
    const payableAnnualNi = Math.max(0, annualNiCost - model.employmentAllowance);
    const monthlyNiCost = payableAnnualNi / 12;

    const totalDirectorCost =
      monthlyGrossSalary + monthlyPensionCost + monthlyNiCost;

    const otherOverheads =
      model.staffWages + model.rent + model.utilities + model.insuranceTech;
    const totalOverheads = totalDirectorCost + otherOverheads;
    const netProfit = grossProfit - totalOverheads;

    return {
      daytimeRevenue,
      eveningRevenue,
      monthlyTradingRevenue,
      annualizedTradingRevenue,
      isVatRegistered,
      monthlyVatPayable,
      netTradingRevenue,
      totalGrossRevenue,
      cogsAmount,
      grossProfit,
      monthlyGrossSalary,
      annualPensionCost,
      monthlyPensionCost,
      annualNiCost,
      payableAnnualNi,
      monthlyNiCost,
      totalDirectorCost,
      otherOverheads,
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
                <li className="flex items-center justify-between py-2 pt-3 text-sm text-slate-700">
                  <span className="flex items-center gap-2">
                    <Briefcase aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    Director cost (calculated)
                  </span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {fmtGBP(calc.totalDirectorCost)}
                  </span>
                </li>
                <li className="flex items-center justify-between py-3 pt-4 text-sm font-semibold text-slate-900">
                  <span>Total overheads</span>
                  <span className="tabular-nums text-rose-700">
                    {fmtGBP(calc.totalOverheads)}
                  </span>
                </li>
              </ul>
            </section>

            <section
              aria-labelledby="tax-payroll-heading"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <Calculator aria-hidden="true" className="h-5 w-5 text-indigo-600" />
                <h2
                  id="tax-payroll-heading"
                  className="text-lg font-semibold text-slate-900"
                >
                  Tax &amp; payroll settings
                </h2>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                UK defaults shown. Annual figures are pro-rated to monthly cost.
              </p>

              <fieldset>
                <legend className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Briefcase aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  Director payroll
                </legend>
                <ul className="divide-y divide-slate-200">
                  {PAYROLL_FIELDS.map((field) => (
                    <li key={field.key}>
                      <FixedCostRow
                        cost={field}
                        value={model[field.key]}
                        onChange={updateField(field.key)}
                      />
                    </li>
                  ))}
                </ul>
              </fieldset>

              <hr className="my-5 border-slate-200" />

              <fieldset>
                <legend className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <Receipt aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  VAT
                </legend>
                <ul className="divide-y divide-slate-200">
                  {VAT_FIELDS.map((field) => (
                    <li key={field.key}>
                      <FixedCostRow
                        cost={field}
                        value={model[field.key]}
                        onChange={updateField(field.key)}
                      />
                    </li>
                  ))}
                </ul>
                <p
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    calc.isVatRegistered
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                  aria-live="polite"
                >
                  <Receipt aria-hidden="true" className="h-3.5 w-3.5" />
                  {calc.isVatRegistered
                    ? `Annualised trading revenue ${fmtGBP(calc.annualizedTradingRevenue)} — VAT registration required`
                    : `Annualised trading revenue ${fmtGBP(calc.annualizedTradingRevenue)} — below VAT threshold`}
                </p>
              </fieldset>
            </section>
          </div>

          {/* ------------------ Output column ------------------ */}
          <section
            aria-labelledby="pl-heading"
            aria-live="polite"
            className="lg:col-span-5"
          >
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Export */}
              <button
                type="button"
                onClick={exportToCSV}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Export snapshot to CSV
              </button>

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
                  <p className="text-xs text-slate-500">
                    Monthly and annualised figures, side by side.
                  </p>
                </div>
                <table className="w-full">
                  <caption className="sr-only">
                    Profit and loss breakdown derived from the inputs, shown in
                    pounds sterling. The second column annualises each monthly
                    figure.
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60">
                      <th
                        scope="col"
                        className="py-2 pl-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Line item
                      </th>
                      <th
                        scope="col"
                        className="py-2 pl-3 pr-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Monthly
                      </th>
                      <th
                        scope="col"
                        className="py-2 pl-3 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Annual
                      </th>
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
                      label={
                        calc.isVatRegistered
                          ? `VAT payable (${model.vatRate}%)`
                          : 'VAT payable (below threshold)'
                      }
                      value={-calc.monthlyVatPayable}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Net trading revenue"
                      value={calc.netTradingRevenue}
                      emphasis="subtotal"
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
                      label="Director gross salary"
                      value={-calc.monthlyGrossSalary}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Employer pension"
                      value={-calc.monthlyPensionCost}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Employer NI"
                      value={-calc.monthlyNiCost}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Staff wages"
                      value={-model.staffWages}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Rent"
                      value={-model.rent}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Utilities"
                      value={-model.utilities}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Insurance & technology"
                      value={-model.insuranceTech}
                      tone="negative"
                      indent
                    />
                    <PLRow
                      label="Total overheads"
                      value={-calc.totalOverheads}
                      emphasis="subtotal"
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
