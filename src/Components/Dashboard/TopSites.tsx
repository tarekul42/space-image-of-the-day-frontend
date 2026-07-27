import React from 'react';
import { motion } from 'framer-motion';
import browser from '../../browser';

interface TopSite {
  title: string;
  url: string;
  favicon?: string;
}

export const TopSites: React.FC = () => {
  const [sites, setSites] = React.useState<TopSite[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSites = async () => {
      try {
        if (browser.runtime?.id) {
          const res = (await browser.runtime.sendMessage({ type: 'FETCH_TOP_SITES' })) as {
            data?: TopSite[];
            error?: string;
          };
          if (res.data) setSites(res.data);
        } else {
          const perms = await chrome.permissions.contains({ permissions: ['topSites'] });
          if (perms) {
            const topSites = await chrome.topSites.get();
            setSites(
              topSites.map((s: { title: string; url: string }) => ({
                title: s.title || s.url,
                url: s.url,
              })),
            );
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  if (loading) return null;

  if (sites.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {sites.slice(0, 8).map((site, i) => (
        <motion.a
          key={site.url}
          href={site.url}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden text-lg font-bold text-white/80 group-hover:scale-110 transition-transform">
            {site.favicon ? (
              <img src={site.favicon} alt="" className="w-6 h-6" />
            ) : (
              site.title.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-xs text-white/60 text-center truncate w-full group-hover:text-white/90 transition-colors">
            {site.title}
          </span>
        </motion.a>
      ))}
    </div>
  );
};
