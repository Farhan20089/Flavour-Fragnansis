'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, CheckCircle2, FlaskConical, Search, X } from 'lucide-react';
import { StoreProvider, useStore } from '@/src/context/StoreContext';
import type { Product } from '@/src/types';
import { ASSET_IMAGES } from '@/src/data/seedData';

type CategoryKind = 'flavours' | 'fragrances';
type InquiryIntent =
  | 'Sample Request'
  | 'Bulk Pricing'
  | 'Documentation Request'
  | 'IFRA Certificate Request'
  | 'SDS Request';

const flavourFilters = [
  'All profiles',
  'Sweet Flavours',
  'Savoury Solutions',
  'Beverage Emulsions',
  'Dairy & Bakery Essentials',
  'Pharma & Nutraceutical',
];

const fragranceFamilies = ['All notes', 'Citrus', 'Floral', 'Woody', 'Oriental', 'Fresh / Aquatic'];
const applications = ['Fine Perfumery', 'Personal Care', 'Home Care & Candles', 'Fabric Care'];

const categories: Record<CategoryKind, {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  alt: string;
}> = {
  flavours: {
    eyebrow: 'Taste, engineered',
    title: 'Artisanal Flavours & Taste Solutions',
    intro: 'Distinctive, application-ready flavour systems shaped around your process, product brief, and sensory ambition.',
    image: ASSET_IMAGES.flavours,
    alt: 'Botanical ingredients and flavour development',
  },
  fragrances: {
    eyebrow: 'The art of olfaction',
    title: 'Fine Fragrances & Perfumery Compounds',
    intro: 'Expressive fragrance compositions for fine perfumery, personal care, home, and fabric applications.',
    image: ASSET_IMAGES.fragrances,
    alt: 'Fragrance materials and perfumery development',
  },
};

function productFilterValue(product: Product, kind: CategoryKind): string {
  const words = `${product.name} ${product.category} ${product.subcategory} ${product.applications} ${product.ingredientsNotes}`.toLowerCase();
  if (kind === 'flavours') {
    if (/pharma|nutraceutical|tablet|capsule/.test(words)) return 'Pharma & Nutraceutical';
    if (/beverage|cola|drink|emulsion|juice|water/.test(words)) return 'Beverage Emulsions';
    if (/dairy|bakery|cream|milk|bread|biscuit|vanilla|chocolate/.test(words)) return 'Dairy & Bakery Essentials';
    if (/savoury|savory|meat|broth|cheese|umami/.test(words)) return 'Savoury Solutions';
    return 'Sweet Flavours';
  }

  if (/citrus|bergamot|lemon|orange|mandarin/.test(words)) return 'Citrus';
  if (/floral|rose|jasmine|peony|neroli/.test(words)) return 'Floral';
  if (/woody|wood|cedar|sandalwood|oud/.test(words)) return 'Woody';
  if (/oriental|amber|saffron|spice|vanilla/.test(words)) return 'Oriental';
  return 'Fresh / Aquatic';
}

function getFlavourSpecs(product: Product) {
  const description = `${product.shortDescription} ${product.fullDescription}`.toLowerCase();
  const heat = /bake-stable|baking|high-temperature/.test(description)
    ? 'Designed for bake applications'
    : /uht|pasteuri[sz]|heat-stable|thermal/.test(description)
      ? 'Designed for thermal processing'
      : 'Process stability confirmed to brief';
  const solubility = /oil|terpeneless|essential oil/.test(description)
    ? 'Oil-dispersible options'
    : /water|beverage|emulsion/.test(description)
      ? 'Water-dispersible options'
      : 'Carrier selected for application';
  return {
    taste: product.ingredientsNotes || product.shortDescription,
    heat,
    solubility,
    applications: product.applications,
  };
}

function getSafeDocumentUrl(value?: string) {
  if (!value) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  if (/^https:\/\/\S+$/i.test(value)) return value;
  return undefined;
}

function getFragranceSpecs(product: Product) {
  const notes = product.ingredientsNotes || 'Composition notes available on request.';
  const application = product.applications;
  const categoryMatch = product.fullDescription.match(/IFRA[^.]*\./i);
  const longevity = /14-hour|exceptional diffusion|long-lasting|tenacity/i.test(product.fullDescription)
    ? 'Extended wear profile'
    : 'Longevity tailored to application';
  const intensity = /projection|diffusion|intense|opulent|unrivaled/i.test(product.fullDescription)
    ? 'Expressive'
    : 'Balanced; adjustable to brief';
  return {
    notes,
    ifra: categoryMatch?.[0] || 'Application-specific IFRA status and documentation available on request.',
    longevity,
    intensity,
    applications: application,
  };
}

function getB2BSpecs(product: Product, kind: CategoryKind) {
  return {
    cas: product.casNumber || 'Available on request',
    profile: kind === 'flavours'
      ? product.tasteProfile || product.ingredientsNotes || product.shortDescription
      : product.olfactoryProfile || product.ingredientsNotes || product.shortDescription,
    solubility: product.solubility || 'Oil / water / alcohol compatibility: confirm with technical team',
    heatStability: product.heatStability || 'Confirm against intended process conditions',
    moq: product.minimumOrderQuantity || 'Confirmed with quotation',
  };
}

function SampleRequestModal({
  kind,
  product,
  application,
  intent,
  onClose,
}: {
  kind: CategoryKind;
  product: Product | null;
  application: string;
  intent: InquiryIntent;
  onClose: () => void;
}) {
  const { submitInquiry } = useStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await submitInquiry({
        name: String(form.get('name') || ''),
        company: String(form.get('company') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        country: String(form.get('country') || ''),
        productName: product?.name || String(form.get('profile') || `${kind} sample request`),
        quantity: String(form.get('quantity') || 'Evaluation sample'),
        application: String(form.get('application') || ''),
        message: String(form.get('message') || ''),
        attachmentUrl: '',
        inquiryType: intent,
      });
      setSent(true);
    } catch {
      setError('We could not submit your request. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#09140f]/75 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="sample-modal-title"
        aria-modal="true"
        role="dialog"
        className="my-auto w-full max-w-xl rounded-2xl border border-[#C5A059]/30 bg-[#FAF9F6] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A7738]">B2B {intent.toLowerCase()}</p>
            <h2 id="sample-modal-title" className="mt-2 font-display text-3xl font-semibold text-[#0F2922]">
              {sent ? 'Request received' : intent === 'Bulk Pricing' ? 'Inquire about bulk pricing' : intent === 'IFRA Certificate Request' ? 'Request an IFRA certificate' : intent === 'SDS Request' ? 'Request an SDS' : intent === 'Documentation Request' ? 'Request product documents' : product ? 'Request an industrial sample' : 'Tell us what you are developing'}
            </h2>
            {product && <p className="mt-1 text-sm text-[#0F1E19]/60">{product.name} · {product.sku}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close sample request" className="rounded-full p-2 text-[#0F2922]/60 hover:bg-[#0F2922]/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {product && (
          <div className="mt-5 rounded-xl border border-[#0F2922]/10 bg-white p-4">
            {kind === 'flavours' ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A98441]">Taste profile</p>
                <p className="mt-1 text-sm leading-6 text-[#0F1E19]/75">{getFlavourSpecs(product).taste}</p>
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div><dt className="font-semibold text-[#0F2922]">Heat stability</dt><dd className="mt-1 text-[#0F1E19]/65">{getFlavourSpecs(product).heat}</dd></div>
                  <div><dt className="font-semibold text-[#0F2922]">Solubility</dt><dd className="mt-1 text-[#0F1E19]/65">{getFlavourSpecs(product).solubility}</dd></div>
                </dl>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A98441]">Olfactory pyramid</p>
                <p className="mt-1 text-sm leading-6 text-[#0F1E19]/75">{getFragranceSpecs(product).notes}</p>
                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                  <div><dt className="font-semibold text-[#0F2922]">IFRA compliance</dt><dd className="mt-1 text-[#0F1E19]/65">{getFragranceSpecs(product).ifra}</dd></div>
                  <div><dt className="font-semibold text-[#0F2922]">Longevity & intensity</dt><dd className="mt-1 text-[#0F1E19]/65">{getFragranceSpecs(product).longevity} · {getFragranceSpecs(product).intensity}</dd></div>
                </dl>
              </>
            )}
            <p className="mt-4 border-t border-[#0F2922]/10 pt-3 text-xs leading-5 text-[#0F1E19]/65"><span className="font-semibold text-[#0F2922]">Application range · </span>{product.applications}</p>
          </div>
        )}

        {sent ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <CheckCircle2 className="h-6 w-6" />
            <p className="mt-3 font-semibold">Thank you. Your request is in our inquiry queue.</p>
            <p className="mt-1 text-sm text-emerald-900/75">Our applications team will follow up using the contact details provided.</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-lg bg-[#0F2922] px-5 py-2.5 text-sm font-semibold text-white">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#0F2922]">Your name
              <input name="name" required maxLength={120} className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
            </label>
            <label className="text-xs font-semibold text-[#0F2922]">Company
              <input name="company" required maxLength={160} className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
            </label>
            <label className="text-xs font-semibold text-[#0F2922]">Work email
              <input name="email" type="email" required maxLength={160} className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
            </label>
            <label className="text-xs font-semibold text-[#0F2922]">Phone <span className="font-normal text-[#0F1E19]/45">(optional)</span>
              <input name="phone" type="tel" maxLength={64} className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
            </label>
            {!product && (
              <label className="text-xs font-semibold text-[#0F2922]">Profile or notes
                <input name="profile" required maxLength={160} placeholder="e.g. citrus, floral, dairy cream" className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
              </label>
            )}
            <label className="text-xs font-semibold text-[#0F2922]">Application type
              <select name="application" required defaultValue={application || ''} className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]">
                <option value="" disabled>Select your application</option>
                {(kind === 'flavours'
                  ? ['Beverage', 'Bakery', 'Dairy', 'Confectionery', 'Pharma / Nutraceutical', 'Other']
                  : ['Fine Perfumery', 'Personal Care', 'Home Care & Candles', 'Fabric Care', 'Other']
                ).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#0F2922]">Desired volume
              <input name="quantity" required maxLength={100} placeholder={intent === 'Bulk Pricing' ? 'e.g. 100 kg bulk' : 'e.g. 5 kg sample'} className="mt-1.5 w-full rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
            </label>
            <label className="text-xs font-semibold text-[#0F2922] sm:col-span-2">Project details
              <textarea name="message" rows={3} maxLength={3000} placeholder="Share any sensory, technical, regulatory, or timing requirements." className="mt-1.5 w-full resize-y rounded-lg border border-[#0F2922]/15 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#C5A059]" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
            <button disabled={pending} type="submit" className="rounded-lg bg-[#0F2922] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B4337] disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
              {pending ? 'Submitting…' : 'Submit sample enquiry'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function ShowcaseContent({ kind }: { kind: CategoryKind }) {
  const { products } = useStore();
  const copy = categories[kind];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState('');
  const [intent, setIntent] = useState<InquiryIntent>('Sample Request');

  const openRequest = (product: Product | null, requestIntent: InquiryIntent) => {
    setSelectedProduct(product);
    setSelectedApplication('');
    setIntent(requestIntent);
    setModalOpen(true);
  };

  const filters = kind === 'flavours' ? flavourFilters : fragranceFamilies;
  const items = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products
      .filter((product) => product.status === 'Active')
      .filter((product) => kind === 'flavours'
        ? product.productType !== 'Fragrance'
        : product.productType === 'Fragrance')
      .filter((product) => filter === 'All' || filter === 'All profiles' || filter === 'All notes' || productFilterValue(product, kind) === filter)
      .filter((product) => !search || [
        product.name,
        product.sku,
        product.category,
        product.subcategory,
        product.applications,
        product.ingredientsNotes,
      ].some((value) => value.toLowerCase().includes(search)));
  }, [products, kind, filter, query]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_12%_30%,rgba(16,185,129,0.08),transparent_34%),#FAF9F6]">
      <header className="sticky top-0 z-40 border-b border-white/15 bg-[#0b211b]/80 text-white shadow-[0_8px_32px_rgba(4,24,18,0.18)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl flex-col items-start justify-center gap-3 px-5 py-3 sm:h-[72px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 sm:px-8">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight transition hover:text-emerald-200 sm:text-2xl">SK Group of Company</Link>
          <nav className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold sm:w-auto sm:gap-6 sm:text-sm">
            <Link href="/flavours" className={kind === 'flavours' ? 'text-[#D6B56F]' : 'text-white/75 hover:text-white'}>Flavours</Link>
            <Link href="/fragrances" className={kind === 'fragrances' ? 'text-[#D6B56F]' : 'text-white/75 hover:text-white'}>Fragrances</Link>
            <a href="#catalogue" className="hidden text-white/75 hover:text-white sm:inline">Portfolio</a>
            <Link href="/admin" className="whitespace-nowrap text-white/75 transition hover:text-white">Admin Portal</Link>
            <button onClick={() => openRequest(null, 'Sample Request')} className="animate-glow rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300 px-3 py-2 text-[11px] font-bold text-[#10271F] transition-all duration-300 hover:scale-[1.03] sm:px-4 sm:text-xs">Request a sample</button>
          </nav>
        </div>
      </header>

      <section className="mesh-background relative isolate min-h-[560px] overflow-hidden text-white">
        <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url("${copy.image}")` }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071a15]/95 via-[#0a1b15]/75 to-[#0a1b15]/25" />
        <div aria-hidden="true" className="animate-float absolute -right-16 top-8 -z-10 h-72 w-72 rounded-full bg-emerald-400/25 blur-[100px]" />
        <div aria-hidden="true" className="animate-float absolute bottom-4 right-[28%] -z-10 h-60 w-60 rounded-full bg-violet-500/20 blur-[90px]" style={{ animationDelay: '1.8s' }} />
        <div className="mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-20 sm:px-8">
          <div className="animate-fade-in-up max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200 backdrop-blur-md"><span className="h-2 w-2 rounded-full bg-amber-300" />{copy.eyebrow} · SK Group of Company</div>
            <h1 className="animated-gradient-text mt-6 font-display text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{copy.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#catalogue" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 px-6 py-3 text-xs font-bold text-[#10271F] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]">Explore the portfolio <ArrowDown className="h-4 w-4" /></a>
              <button onClick={() => openRequest(null, 'Bulk Pricing')} className="rounded-full border border-white/35 bg-white/10 px-6 py-3 text-xs font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-violet-300/60 hover:bg-white/20">Inquire bulk pricing</button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-5 text-[10px] uppercase tracking-[0.16em] text-white/60">
              <span>Application-led development</span><span>Technical support</span><span>Global B2B supply</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white bg-white/65 shadow-[0_12px_45px_rgba(15,41,34,0.04)] backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-3 sm:px-8">
          {(kind === 'flavours'
            ? [
                ['01', 'Sensory precision', 'Profile refinement from first tasting through scale-up.'],
                ['02', 'Process fit', 'Practical formulation guidance for your application conditions.'],
                ['03', 'Quality & compliance', 'Documentation and regulatory review aligned to your market.'],
              ]
            : [
                ['01', 'Perfumery craft', 'Balanced fragrance architecture with a distinctive signature.'],
                ['02', 'Application performance', 'Designed around substrate, format, and consumer experience.'],
                ['03', 'Responsible development', 'Regulatory documentation and technical review for your brief.'],
              ]).map(([number, title, text]) => (
                <div key={number} className="flex gap-4 rounded-2xl border border-emerald-900/5 bg-white/60 p-4 transition-colors hover:border-teal-400/30">
                  <span className="font-mono text-xs text-emerald-700">{number}</span>
                  <div><h2 className="font-display text-xl font-semibold text-[#0F2922]">{title}</h2><p className="mt-1 text-xs leading-5 text-[#0F1E19]/60">{text}</p></div>
                </div>
              ))}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98441]">{kind === 'flavours' ? 'Flavour families' : 'Made for every moment'}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#0F2922]">{kind === 'flavours' ? 'Explore by profile' : 'Application showcase'}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(kind === 'flavours'
              ? [
                  ['Sweet Flavours', 'Fruit, confectionery, chocolate and signature sweet profiles.'],
                  ['Savoury Solutions', 'Layered taste directions for culinary and savoury applications.'],
                  ['Beverage Emulsions', 'Flavours and emulsion systems for refreshing drinks.'],
                  ['Dairy & Bakery Essentials', 'Profiles developed for dairy, bakery and dessert matrices.'],
                  ['Pharma & Nutraceutical', 'Taste masking and flavour direction for functional formats.'],
                ]
              : applications.map((applicationName) => [applicationName, `Fragrance directions designed for ${applicationName.toLowerCase()} products.`])
            ).map(([label, body]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (kind === 'flavours') {
                    setFilter(label);
                    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setSelectedApplication(label);
                    setSelectedProduct(null);
                    setIntent('Sample Request');
                    setModalOpen(true);
                  }
                }}
                className="group rounded-2xl border border-emerald-900/10 bg-white/75 p-5 text-left shadow-[0_10px_35px_rgba(15,41,34,0.04)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(217,119,6,0.13)]"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">0{kind === 'flavours' ? flavourFilters.indexOf(label) : applications.indexOf(label) + 1}</span>
                <h3 className="mt-2 font-display text-xl font-semibold text-[#0F2922]">{label}</h3>
                <p className="mt-1 text-xs leading-5 text-[#0F1E19]/60">{body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0F2922]">Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogue" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98441]">Explore the collection</p>
              <h2 className="mt-2 font-display text-4xl font-semibold text-[#0F2922] sm:text-5xl">{kind === 'flavours' ? 'Flavour profiles' : 'An olfactory library'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#0F1E19]/60">{kind === 'flavours' ? 'Filter by application direction, then open a profile to review its sensory cues and technical brief.' : 'Explore top, heart, and base note directions across compositions for multiple product categories.'}</p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F1E19]/40" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search profiles, notes, SKU…" aria-label="Search profiles, notes, or code" className="w-full rounded-full border border-emerald-900/10 bg-white/80 py-3 pl-11 pr-4 text-sm outline-none shadow-sm backdrop-blur-md transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label={kind === 'flavours' ? 'Filter flavour profiles' : 'Filter fragrance note families'}>
            {filters.map((item) => {
              const value = item.startsWith('All') ? 'All' : item;
              return <button key={item} onClick={() => setFilter(value)} aria-pressed={filter === value} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 ${filter === value ? 'border-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-[0_6px_20px_rgba(5,150,105,0.24)]' : 'border-emerald-900/10 bg-white/75 text-[#0F2922]/70 hover:-translate-y-0.5 hover:border-violet-400/60 hover:text-violet-700'}`}>{item}</button>;
            })}
          </div>

          {kind === 'fragrances' && (
            <div className="mt-6 grid gap-3 rounded-3xl border border-white bg-white/70 p-5 shadow-[0_12px_40px_rgba(15,41,34,0.06)] backdrop-blur-md sm:grid-cols-3">
              {[
                ['Top notes', 'The first impression: bright, airy, and immediate.'],
                ['Heart notes', 'The expressive core that gives an accord its character.'],
                ['Base notes', 'The lasting foundation: warmth, depth, and trail.'],
              ].map(([label, body], index) => <div key={label} className={`rounded-xl border-l-4 ${['border-amber-500', 'border-violet-500', 'border-emerald-500'][index]} bg-white/60 py-3 pl-4 pr-3 transition-all duration-300 hover:-translate-y-1 hover:bg-white`}><p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${['text-amber-700', 'text-violet-700', 'text-emerald-700'][index]}`}>{label}</p><p className="mt-1 text-xs leading-5 text-[#0F1E19]/65">{body}</p></div>)}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between text-xs text-[#0F1E19]/55"><span>{items.length} formulation{items.length === 1 ? '' : 's'}</span><span>Technical details confirmed for each project brief</span></div>
          {items.length ? (
            <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => {
                const ifraDocUrl = getSafeDocumentUrl(product.ifraDocUrl);
                const sdsDocUrl = getSafeDocumentUrl(product.sdsDocUrl);
                return (
                  <article key={product.id} className="group flex flex-col overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/80 shadow-[0_12px_40px_rgba(15,41,34,0.05)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/35 hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]">
                  <div className="relative h-44 overflow-hidden bg-[#e9e4d8]">
                    {/* Product images are optional; use the portfolio image only when present. */}
                    {product.imageUrl && <div aria-hidden="true" className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${product.imageUrl}")` }} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2922]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-5 rounded-full border border-white/35 bg-[#0F2922]/50 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur">{productFilterValue(product, kind)}</span>
                    <span className="absolute bottom-4 right-5 font-mono text-[10px] text-white/85">{product.sku}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A98441]">{product.category} · {product.subcategory}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[#0F2922]">{product.name}</h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#0F1E19]/65">{product.shortDescription}</p>
                    <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-emerald-900/10 pt-4 text-xs">
                      {[
                        ['CAS number', getB2BSpecs(product, kind).cas],
                        [kind === 'flavours' ? 'Taste profile' : 'Olfactory profile', getB2BSpecs(product, kind).profile],
                        ['Solubility', getB2BSpecs(product, kind).solubility],
                        ['Heat stability', getB2BSpecs(product, kind).heatStability],
                        ['MOQ', getB2BSpecs(product, kind).moq],
                        ...(kind === 'fragrances' ? [['IFRA', getFragranceSpecs(product).ifra]] : []),
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-emerald-50/60 p-3">
                          <dt className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">{label}</dt>
                          <dd className="mt-1 line-clamp-3 leading-5 text-[#0F1E19]/70">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ifraDocUrl
                        ? <a href={ifraDocUrl} download className="rounded-full border border-violet-700/20 px-3 py-2 text-[10px] font-semibold text-violet-800 hover:bg-violet-50">Download IFRA certificate</a>
                        : <button type="button" onClick={() => openRequest(product, 'IFRA Certificate Request')} className="rounded-full border border-violet-700/20 px-3 py-2 text-[10px] font-semibold text-violet-800 transition hover:bg-violet-50">Request IFRA certificate</button>}
                      {sdsDocUrl
                        ? <a href={sdsDocUrl} download className="rounded-full border border-teal-700/20 px-3 py-2 text-[10px] font-semibold text-teal-800 hover:bg-teal-50">Download SDS</a>
                        : <button type="button" onClick={() => openRequest(product, 'SDS Request')} className="rounded-full border border-teal-700/20 px-3 py-2 text-[10px] font-semibold text-teal-800 transition hover:bg-teal-50">Request SDS</button>}
                    </div>
                    {kind === 'fragrances' && (
                      <p className="mt-3 text-xs leading-5 text-[#0F1E19]/65">
                        <span className="font-semibold text-[#0F2922]">Longevity · intensity · </span>
                        {getFragranceSpecs(product).longevity} · {getFragranceSpecs(product).intensity}
                      </p>
                    )}
                    <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                      <button type="button" onClick={() => openRequest(product, 'Sample Request')} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-3 py-3 text-[11px] font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">Request Industrial Sample <ArrowRight className="h-4 w-4" /></button>
                      <button type="button" onClick={() => openRequest(product, 'Bulk Pricing')} className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-600/30 bg-amber-50 px-3 py-3 text-[11px] font-bold text-amber-900 transition-all duration-300 hover:scale-[1.02] hover:bg-amber-100">Inquire Bulk Pricing</button>
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#0F2922]/20 bg-white p-12 text-center">
              <FlaskConical className="mx-auto h-8 w-8 text-[#A98441]" />
              <p className="mt-4 font-display text-2xl font-semibold text-[#0F2922]">No matching profiles</p>
              <p className="mt-2 text-sm text-[#0F1E19]/60">Try another search or ask our team to develop a custom profile.</p>
              <button onClick={() => openRequest(null, 'Sample Request')} className="mt-5 rounded-full bg-[#0F2922] px-5 py-3 text-xs font-bold text-white">Request a custom sample</button>
            </div>
          )}
        </div>
      </section>

      <section className="mesh-background relative overflow-hidden py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D6B56F]">From brief to benchmark</p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">{kind === 'flavours' ? 'A sensory process built around your product.' : 'From first impression to lasting signature.'}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Work with our applications and R&D team to align sensory direction, technical performance, and regulatory needs. Final parameters and documentation are confirmed for each formulation and intended market.</p>
            <button onClick={() => openRequest(null, 'Bulk Pricing')} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#C5A059] px-6 py-3 text-xs font-bold text-[#10271F] transition hover:bg-[#d7b977]">Start a development brief <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(kind === 'flavours'
              ? ['Sensory panel evaluation', 'Custom flavour blending', 'Process and matrix assessment', 'Market-specific regulatory review']
              : ['Top / heart / base accord review', 'IFRA documentation by application', 'Longevity and intensity tuning', 'Substrate and stability assessment']
            ).map((item, index) => <div key={item} className="flex min-h-28 items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-white/[0.12]"><span className={`font-mono text-xs ${['text-emerald-300', 'text-amber-300', 'text-violet-300', 'text-teal-300'][index]}`}>0{index + 1}</span><p className="font-display text-xl font-semibold">{item}</p></div>)}
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-900/10 bg-white/70 px-5 py-7 text-center text-xs text-[#0F1E19]/60 backdrop-blur-md">
        <p>© {new Date().getFullYear()} SK Group of Company · Formulated for your application.</p>
        <p className="mt-2"><Link href="/flavours" className="hover:text-[#0F2922]">Flavours</Link><span className="mx-3">·</span><Link href="/fragrances" className="hover:text-[#0F2922]">Fragrances</Link></p>
      </footer>

      {(selectedProduct || modalOpen) && (
        <SampleRequestModal
          kind={kind}
          product={selectedProduct}
          application={selectedApplication}
          intent={intent}
          onClose={() => { setSelectedProduct(null); setModalOpen(false); }}
        />
      )}
    </main>
  );
}

export function CategoryShowcase({ kind }: { kind: CategoryKind }) {
  return (
    <StoreProvider>
      <ShowcaseContent kind={kind} />
    </StoreProvider>
  );
}
