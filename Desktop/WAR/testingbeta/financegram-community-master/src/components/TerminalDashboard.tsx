import type { CommunityMembership, Session } from '../context/session';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  LineChart,
  Newspaper,
  Radio,
  RefreshCcw,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import { useSessionContext } from '../context/session';
import {
  cn,
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime,
} from '@/lib/utils';
import { useMarketData } from '@/hooks/useMarketData';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { useJobListings } from '@/hooks/useJobListings';
import { useCommunities } from '@/hooks/useCommunities';
import { useCertificates } from '@/hooks/useCertificates';
import type { MarketSeriesPoint } from '@/lib/api';

const tabs = [
  { id: 'markets', label: 'Markets', icon: LineChart },
  { id: 'news', label: 'Newswire', icon: Newspaper },
  { id: 'jobsea', label: 'JobSea', icon: Briefcase },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'certificates', label: 'Certificates', icon: BadgeCheck },
  { id: 'tv', label: 'Live Feeds', icon: Radio },
] as const;

type TabId = (typeof tabs)[number]['id'];

type MarketHook = ReturnType<typeof useMarketData>;
type NewsHook = ReturnType<typeof useNewsFeed>;
type JobHook = ReturnType<typeof useJobListings>;
type CommunitiesHook = ReturnType<typeof useCommunities>;
type CertificatesHook = ReturnType<typeof useCertificates>;

function TerminalDashboard() {
  const { session, logout, showLogin, loginWithLinkedInDemo, isAuthenticating } = useSessionContext();
  const [activeTab, setActiveTab] = useState<TabId>('markets');

  const market = useMarketData();
  const news = useNewsFeed();
  const jobs = useJobListings();
  const communities = useCommunities();
  const certificates = useCertificates();

  const welcome = useMemo(() => {
    if (!session) {
      return 'Markets overview';
    }
    const first = session.name.trim().split(' ')[0] || session.name;
    return `${first}, your console is live`;
  }, [session]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.45em] text-terminal-green/70">
          Financegram Terminal - Connected
        </span>
        <h2 className="text-3xl text-terminal-green">{welcome}</h2>
        <p className="text-sm text-terminal-green/60">
          Financegram pipes first-party data, market trades, newsroom copy, hiring flow, and credential pathways into a Bloomberg-inspired surface tuned for fast decision making.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-terminal-green/45">
          <span>
            Market feed: {market.lastUpdated ? `synced ${formatRelativeTime(market.lastUpdated)}` : 'warming up'}
          </span>
          <span>
            Newswire: {news.sourceLabel}
          </span>
          <span>
            JobSea: {jobs.lastUpdated ? `refreshed ${formatRelativeTime(jobs.lastUpdated)}` : 'initializing'}
          </span>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2 text-xs uppercase tracking-[0.25em] transition',
                isActive
                  ? 'border-terminal-green/80 bg-terminal-green/10 text-terminal-green'
                  : 'border-terminal-green/25 bg-black/60 text-terminal-green/60 hover:border-terminal-green/60 hover:text-terminal-green',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {activeTab === 'markets' && <MarketsPanel data={market} />}
          {activeTab === 'news' && <NewsPanel news={news} />}
          {activeTab === 'jobsea' && <JobSeaPanel jobs={jobs} />}
          {activeTab === 'communities' && (
            <CommunitiesPanel communities={communities} memberships={session?.communities ?? []} />
          )}
          {activeTab === 'certificates' && <CertificatesPanel certificates={certificates} />}
          {activeTab === 'tv' && <TvPanel />}
        </div>

        <aside className="space-y-6">
          <MarketPulseCard data={market} />
          <HeadlineTicker news={news} />
          <SessionCard
            session={session}
            onLogout={logout}
            onLogin={showLogin}
            onDemo={loginWithLinkedInDemo}
            isAuthenticating={isAuthenticating}
          />
        </aside>
      </div>
    </section>
  );
}

function MarketsPanel({ data }: { data: MarketHook }) {
  const { quotes, series, isLoading, error, lastUpdated } = data;
  const currentSeriesValue = series.at(-1)?.value;

  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-6 shadow-[inset_0_0_35px_rgba(74,255,128,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm uppercase tracking-[0.35em] text-terminal-green">Market grid</h3>
          <p className="text-xs text-terminal-green/50">
            Live index composite sourced from Financegram’s market core.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-terminal-green/50">
          <RefreshCcw className={cn('h-4 w-4', isLoading ? 'animate-spin' : 'opacity-50')} />
          {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : 'Awaiting first tick'}
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-terminal-green/40 bg-terminal-green/10 p-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && quotes.length === 0 ? (
          <div className="col-span-full grid h-32 place-items-center text-xs uppercase tracking-[0.3em] text-terminal-green/50">
            Streaming...
          </div>
        ) : null}
        {quotes.map((quote) => {
          const changeClass = quote.change >= 0 ? 'text-terminal-green' : 'text-rose-400';
          const delta = formatPercent(quote.changePercent);
          return (
            <div
              key={quote.symbol}
              className="rounded-xl border border-terminal-green/40 bg-black/70 p-4 shadow-[0_0_25px_rgba(74,255,128,0.08)]"
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-terminal-green/60">
                <span>{quote.symbol}</span>
                <span>{quote.label}</span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-3xl text-terminal-green">{formatCurrency(quote.price)}</p>
                  <p className="text-xs text-terminal-green/40">Prev {formatCurrency(quote.previousClose)}</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-lg font-medium', changeClass)}>{delta}</span>
                  <p className="text-xs text-terminal-green/40">? {formatCurrency(quote.change)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-terminal-green/30 bg-black/60 p-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-terminal-green/50">
          <span>Intraday trace</span>
          <span>{currentSeriesValue ? formatCurrency(currentSeriesValue) : 'no feed'}</span>
        </div>
        <MarketSparkline data={series} />
      </div>
    </div>
  );
}

function MarketSparkline({ data }: { data: MarketSeriesPoint[] }) {
  if (!data.length) {
    return (
      <div className="grid h-40 place-items-center text-xs uppercase tracking-[0.3em] text-terminal-green/40">
        Feed inactive
      </div>
    );
  }

  const width = 720;
  const height = 200;
  const values = data.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="mt-4 h-48 w-full rounded-lg border border-terminal-green/20 bg-[rgba(16,40,22,0.35)]"
    >
      <defs>
        <linearGradient id="sparklineStroke" x1="0" x2="0" y1="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8dff9f" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#4bff77" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="sparklineFill" x1="0" x2="0" y1="0" y2={height} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(77,255,131,0.35)" />
          <stop offset="100%" stopColor="rgba(77,255,131,0.02)" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill="url(#sparklineFill)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke="url(#sparklineStroke)"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NewsPanel({ news }: { news: NewsHook }) {
  const { items, isLoading, error, sourceLabel, lastUpdated } = news;

  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm uppercase tracking-[0.35em] text-terminal-green">Newswire</h3>
          <p className="text-xs text-terminal-green/50">{sourceLabel}</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/40">
          {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : isLoading ? 'Refreshing feed…' : `${items.length} headlines`}
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-terminal-green/40 bg-terminal-green/10 p-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {isLoading && items.length === 0 ? (
          <div className="col-span-full grid h-40 place-items-center text-xs uppercase tracking-[0.3em] text-terminal-green/50">
            Loading headlines…
          </div>
        ) : null}
        {items.slice(0, 8).map((story) => (
          <article
            key={story.id}
            className="group flex gap-4 rounded-xl border border-terminal-green/30 bg-black/60 p-4 transition hover:border-terminal-green/60 hover:bg-black/70"
          >
            <div className="h-16 w-16 overflow-hidden rounded border border-terminal-green/30 bg-terminal-green/10">
              {story.imageUrl ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[10px] uppercase tracking-[0.3em] text-terminal-green/40">
                  no art
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <a
                href={story.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-terminal-green hover:text-terminal-green/80"
              >
                {story.title}
              </a>
              <p className="text-xs text-terminal-green/50">
                {story.source} · {story.publishedAt ? formatRelativeTime(story.publishedAt) : 'just in'}
              </p>
              {story.description ? (
                <p className="text-xs text-terminal-green/40 line-clamp-2">{story.description}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function JobSeaPanel({ jobs }: { jobs: JobHook }) {
  const { listings, isLoading, error, lastUpdated } = jobs;

  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm uppercase tracking-[0.35em] text-terminal-green">JobSea — buy-side & fintech</h3>
          <p className="text-xs text-terminal-green/50">Real-time requisitions piped from Financegram Talent Cloud.</p>
        </div>
        <div className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/40">
          {lastUpdated ? `Synced ${formatRelativeTime(lastUpdated)}` : isLoading ? 'Syncing...' : `${listings.length} roles`}
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-terminal-green/40 bg-terminal-green/10 p-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-terminal-green/30">
        <table className="min-w-full divide-y divide-terminal-green/20 text-sm">
          <thead className="bg-terminal-green/10 text-[11px] uppercase tracking-[0.3em] text-terminal-green/70">
            <tr>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Posted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-green/15 text-terminal-green/80">
            {isLoading && listings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-terminal-green/50">
                  Scanning boards…
                </td>
              </tr>
            ) : null}
            {listings.map((job) => (
              <tr key={job.id} className="hover:bg-terminal-green/10">
                <td className="px-4 py-3">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-terminal-green hover:text-terminal-green/80"
                  >
                    {job.title}
                  </a>
                </td>
                <td className="px-4 py-3 text-terminal-green/60">{job.company}</td>
                <td className="px-4 py-3 text-terminal-green/60">
                  {job.remote ? `${job.location} · remote` : job.location}
                </td>
                <td className="px-4 py-3 text-terminal-green/50">
                  {job.postedAt ? formatRelativeTime(job.postedAt) : 'recent'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommunitiesPanel({
  communities,
  memberships,
}: {
  communities: CommunitiesHook;
  memberships: CommunityMembership[];
}) {
  const { posts, isLoading, error, lastUpdated } = communities;
  const membershipIds = new Set(memberships.map((membership) => membership.id));
  const filtered = membershipIds.size ? posts.filter((post) => membershipIds.has(post.forum)) : posts;
  const visiblePosts = filtered.length ? filtered : posts;

  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm uppercase tracking-[0.35em] text-terminal-green">Community radar</h3>
          {memberships.length ? (
            <p className="text-xs text-terminal-green/45">
              Forums: {memberships.map((membership) => membership.label).join(' · ')}
            </p>
          ) : (
            <p className="text-xs text-terminal-green/50">Join a session to unlock personalized forums.</p>
          )}
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/40">
          {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated)}` : `${visiblePosts.length} threads`}
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-terminal-green/40 bg-terminal-green/10 p-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {isLoading && visiblePosts.length === 0 ? (
          <div className="col-span-full grid h-32 place-items-center text-xs uppercase tracking-[0.3em] text-terminal-green/50">
            Listening…
          </div>
        ) : null}
        {visiblePosts.map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-3 rounded-xl border border-terminal-green/30 bg-black/60 p-4 transition hover:border-terminal-green/60 hover:bg-black/70"
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-terminal-green/45">
              <span>{post.forumLabel}</span>
              <span>{post.createdAt ? formatRelativeTime(post.createdAt) : 'today'}</span>
            </div>
            <h4 className="text-sm text-terminal-green group-hover:text-terminal-green/80">{post.title}</h4>
            <div className="flex items-center gap-4 text-xs text-terminal-green/50">
              <span>? {formatCompactNumber(post.score)}</span>
              <span>?? {formatCompactNumber(post.comments)}</span>
              <span>by {post.author}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function CertificatesPanel({ certificates }: { certificates: CertificatesHook }) {
  const { programs, isLoading, error, lastUpdated } = certificates;

  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm uppercase tracking-[0.35em] text-terminal-green">Certificate deck</h3>
          <p className="text-xs text-terminal-green/50">Financegram-curated upskilling for coverage teams.</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/40">
          {lastUpdated ? `Validated ${formatRelativeTime(lastUpdated)}` : `${programs.length} programs`}
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-terminal-green/40 bg-terminal-green/10 p-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {isLoading && programs.length === 0 ? (
          <div className="col-span-full grid h-32 place-items-center text-xs uppercase tracking-[0.3em] text-terminal-green/50">
            Loading catalogue…
          </div>
        ) : null}
        {programs.map((program) => (
          <div key={program.id} className="flex flex-col gap-4 rounded-xl border border-terminal-green/30 bg-black/60 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded border border-terminal-green/30 bg-terminal-green/10">
                {program.imageUrl ? (
                  <img src={program.imageUrl} alt={program.provider} className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[10px] uppercase tracking-[0.3em] text-terminal-green/40">
                    no art
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm text-terminal-green">{program.title}</h4>
                <p className="text-xs uppercase tracking-[0.3em] text-terminal-green/50">{program.provider}</p>
              </div>
            </div>
            <p className="text-xs text-terminal-green/60">{program.description}</p>
            <ul className="space-y-1 text-xs text-terminal-green/45">
              <li>Duration · {program.duration}</li>
              <li>Format · {program.format}</li>
              <li>Cost · {program.costRange}</li>
            </ul>
            <div>
              <a
                href={program.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-terminal-green hover:text-terminal-green/80"
              >
                Explore
                <BadgeCheck className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TvPanel() {
  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm uppercase tracking-[0.35em] text-terminal-green">Live feeds</h3>
          <p className="text-xs text-terminal-green/50">Financegram rotations plus Bloomberg’s public desk coverage.</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/40">External streams</span>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <iframe
          className="aspect-video w-full rounded-xl border border-terminal-green/30"
          src="https://www.youtube.com/embed/dp8PhLsUcFE?rel=0&showinfo=0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Bloomberg Global News"
        />
        <iframe
          className="aspect-video w-full rounded-xl border border-terminal-green/30"
          src="https://www.youtube.com/embed/EzQ57sVQ9xw?rel=0&showinfo=0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Bloomberg Quicktake"
        />
      </div>
      <p className="mt-3 text-xs text-terminal-green/45">
        Streams open in-place. Audio defaults muted—enable sound per panel to comply with workspace policy.
      </p>
    </div>
  );
}

function MarketPulseCard({ data }: { data: MarketHook }) {
  const top = data.performanceSummary?.leaders ?? [];
  const bottom = data.performanceSummary?.laggards ?? [];

  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-[0.35em] text-terminal-green">Market pulse</h4>
        <span className="text-[11px] uppercase tracking-[0.3em] text-terminal-green/40">
          {data.lastUpdated ? formatRelativeTime(data.lastUpdated) : 'awaiting data'}
        </span>
      </div>
      <div className="mt-4 space-y-4 text-xs">
        <div>
          <p className="uppercase tracking-[0.3em] text-terminal-green/50">Leaders</p>
          <div className="mt-2 space-y-2">
            {top.length === 0 ? (
              <p className="text-terminal-green/40">Waiting for market data.</p>
            ) : (
              top.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between text-terminal-green">
                  <span>
                    {item.symbol}
                    <span className="text-terminal-green/40"> - {item.label}</span>
                  </span>
                  <span className="text-terminal-green">{formatPercent(item.changePercent)}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-terminal-green/50">Laggards</p>
          <div className="mt-2 space-y-2">
            {bottom.length === 0 ? (
              <p className="text-terminal-green/40">No decliners yet.</p>
            ) : (
              bottom.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between text-terminal-green">
                  <span>
                    {item.symbol}
                    <span className="text-terminal-green/40"> - {item.label}</span>
                  </span>
                  <span className="text-rose-400">{formatPercent(item.changePercent)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadlineTicker({ news }: { news: NewsHook }) {
  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-5">
      <h4 className="text-xs uppercase tracking-[0.35em] text-terminal-green">Headline ticker</h4>
      <div className="mt-3 space-y-3 text-xs text-terminal-green/60">
        {news.items.slice(0, 5).map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 border-b border-terminal-green/20 pb-2 last:border-b-0 hover:text-terminal-green"
          >
            <span className="line-clamp-2">{item.title}</span>
            <span className="text-terminal-green/40">{item.publishedAt ? formatRelativeTime(item.publishedAt) : 'now'}</span>
          </a>
        ))}
        {news.items.length === 0 ? (
          <p className="text-terminal-green/40">No headlines loaded yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onLogout,
  onLogin,
  onDemo,
  isAuthenticating,
}: {
  session: Session | null;
  onLogout: () => Promise<void> | void;
  onLogin: () => void;
  onDemo: () => Promise<void> | void;
  isAuthenticating: boolean;
}) {
  return (
    <div className="rounded-2xl border border-terminal-green/30 bg-black/70 p-5">
      <h4 className="text-xs uppercase tracking-[0.35em] text-terminal-green">Account</h4>
      {session ? (
        <div className="mt-3 space-y-3 text-sm text-terminal-green">
          <div className="space-y-1">
            <p className="text-terminal-green/70">Logged in as</p>
            <p className="text-lg text-terminal-green">{session.name}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-terminal-green/40">{session.email}</p>
          </div>
          {session.communities.length ? (
            <div className="space-y-1 text-xs text-terminal-green/55">
              <p className="uppercase tracking-[0.3em] text-terminal-green/50">Forums</p>
              <ul className="space-y-1">
                {session.communities.map((membership) => (
                  <li key={membership.id}>{membership.label}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button
            variant="ghost"
            className="w-full border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20"
            onClick={() => {
              void onLogout();
            }}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3 text-sm text-terminal-green/70">
          <p>Authenticate to personalize the terminal and unlock watchlists.</p>
          <Button
            className="w-full bg-terminal-green text-black hover:bg-terminal-green/80"
            onClick={onLogin}
            disabled={isAuthenticating}
          >
            Email login
          </Button>
          <Button
            variant="ghost"
            className="w-full border border-terminal-green/30 bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20"
            onClick={() => {
              void onDemo();
            }}
            disabled={isAuthenticating}
          >
            Launch LinkedIn demo session
          </Button>
        </div>
      )}
    </div>
  );
}

export default TerminalDashboard;


