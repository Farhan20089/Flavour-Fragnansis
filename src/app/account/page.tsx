import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { prisma } from '@/src/lib/prisma';
import { ProfileForm } from '../ui/ProfileForm';
import {
  Package,
  Heart,
  Shield,
  ExternalLink,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';

export const metadata = {
  title: 'Client Atelier | Flavour & Fragrances',
  description: 'Manage your profile, view bespoke orders, and review saved wishlist items at Flavour & Fragrances.',
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect('/login');

  // Fetch recent customer orders
  const recentOrders = await prisma.order.findMany({
    where: {
      OR: [{ userId: user.id }, { customerEmail: user.email.toLowerCase() }],
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      items: true,
      payment: true,
    },
  });

  const wishlistCount = await prisma.wishlistItem.count({
    where: { userId: user.id },
  });

  const isAdminUser = ['Super Admin', 'Admin', 'Staff'].includes(user.role);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#171717] selection:bg-[#B89555]/30 selection:text-[#171717]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Atelier Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171717]/10 pb-6">
          <div className="space-y-1">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#B89555]">
              Client Identity &amp; Telemetry
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#171717] tracking-tight">
              {user.name ? `Welcome, ${user.name}` : 'Client Atelier'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdminUser && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-[#171717] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FAF8F3] transition-colors hover:bg-[#B89555]"
              >
                <Shield className="w-3.5 h-3.5 text-[#B89555]" />
                <span>Admin Suite ({user.role})</span>
              </Link>
            )}

            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="border border-[#171717]/20 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#171717] transition-colors hover:border-[#171717] cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Quick Portal Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/orders"
            className="group border border-[#171717]/10 bg-white p-6 transition-all hover:border-[#B89555]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#8A857D]">
                Acquisitions
              </span>
              <Package className="w-5 h-5 text-[#B89555] transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-3 font-serif text-2xl font-light text-[#171717]">
              {recentOrders.length} Order{recentOrders.length === 1 ? '' : 's'}
            </div>
            <div className="mt-1 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#B89555] group-hover:underline">
              <span>View all orders &amp; tracking</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          <Link
            href="/wishlist"
            className="group border border-[#171717]/10 bg-white p-6 transition-all hover:border-[#B89555]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#8A857D]">
                Reserved Formulations
              </span>
              <Heart className="w-5 h-5 text-[#B89555] transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-3 font-serif text-2xl font-light text-[#171717]">
              {wishlistCount} Saved
            </div>
            <div className="mt-1 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#B89555] group-hover:underline">
              <span>View saved wishlist</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>

          <Link
            href="/shop"
            className="group border border-[#171717]/10 bg-white p-6 transition-all hover:border-[#B89555]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#8A857D]">
                Atelier Collection
              </span>
              <ExternalLink className="w-5 h-5 text-[#B89555] transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-3 font-serif text-2xl font-light text-[#171717]">
              Archive Formulary
            </div>
            <div className="mt-1 flex items-center font-mono text-[10px] uppercase tracking-wider text-[#B89555] group-hover:underline">
              <span>Discover perfumes &amp; flavours</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </Link>
        </div>

        {/* Main Content Grid: Recent Orders & Profile */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
              <h2 className="font-serif text-2xl font-light text-[#171717]">
                Recent Order History
              </h2>
              <Link
                href="/orders"
                className="font-mono text-[10px] uppercase tracking-wider text-[#B89555] hover:underline"
              >
                View Full Archive →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="border border-[#171717]/10 bg-white p-10 text-center space-y-3">
                <Package className="w-8 h-8 mx-auto text-[#171717]/30" />
                <h3 className="font-serif text-xl font-light text-[#171717]">No acquisitions logged yet</h3>
                <p className="text-xs text-[#8A857D] max-w-sm mx-auto font-light leading-relaxed">
                  When you order fine fragrances or artisanal extracts, dispatch telemetry will appear here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-block bg-[#171717] px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#FAF8F3] hover:bg-[#B89555] transition-colors"
                  >
                    Explore Formulary
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="border border-[#171717]/10 bg-white p-5 transition-shadow hover:shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#171717]/8 pb-3">
                      <div>
                        <span className="font-mono text-xs font-semibold text-[#171717]">
                          #{ord.orderNumber}
                        </span>
                        <span className="ml-3 font-mono text-[11px] text-[#8A857D]">
                          {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(ord.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : ord.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {ord.orderStatus === 'Delivered' && <CheckCircle className="w-3 h-3" />}
                          {ord.orderStatus === 'Shipped' && <Truck className="w-3 h-3" />}
                          {ord.orderStatus === 'Processing' && <Clock className="w-3 h-3" />}
                          <span>{ord.orderStatus}</span>
                        </span>
                        <span className="font-mono text-sm font-medium text-[#171717]">
                          ${ord.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-[#171717]/70 font-light truncate max-w-md">
                        {ord.items.length} item{ord.items.length === 1 ? '' : 's'}:{' '}
                        <span className="italic text-[#171717]">
                          {ord.items.map((i) => `${i.productName} (×${i.quantity})`).join(', ')}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${ord.orderNumber}`}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#B89555] hover:underline"
                      >
                        Track Dossier →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            <section className="border border-[#171717]/10 bg-white p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#171717]/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center bg-[#FAF8F3] border border-[#171717]/10 text-[#B89555]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-light text-[#171717]">Client Dossier</h2>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#8A857D]">Flavour &amp; Fragrances Geneva</p>
                </div>
              </div>

              <div className="space-y-3 font-light text-xs">
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-[#8A857D]">
                    Email Address
                  </p>
                  <p className="font-medium text-[#171717] break-all mt-0.5">{user.email}</p>
                </div>
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-[#8A857D]">
                    Account Clearance
                  </p>
                  <p className="font-medium text-[#B89555] font-mono uppercase text-xs mt-0.5">{user.role}</p>
                </div>
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-[#8A857D]">
                    Registered Client Since
                  </p>
                  <p className="text-[#171717] mt-0.5">
                    {new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-[#171717]/10 pt-4">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-[#171717] mb-2">Edit Display Name</h3>
                <ProfileForm initialName={user.name || ''} />
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
