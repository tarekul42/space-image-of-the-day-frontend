/**
 * utils/catalogMatch.ts — Match an APOD entry to known cosmic objects.
 *
 * Pure & testable: given an APOD title/explanation it finds catalog objects
 * whose name or aliases appear in the text, so "This Week in Space" and the
 * detail view can highlight the *actual* objects on the live star map.
 */
import { CosmicObject, COSMIC_CATALOG } from '../data/catalog';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordBoundaryMatcher(word: string): RegExp {
  // \b fails inside "m42" style identifiers if preceded by another letter,
  // so allow the alias to stand alone or start a token.
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(word)}([^a-z0-9]|$)`, 'i');
}

/**
 * Rank catalog objects by how clearly they are mentioned in the APOD text.
 * Title mentions outrank explanation mentions; longer matches rank higher.
 */
export function matchCatalogObjects(
  title: string,
  explanation: string,
  catalog: CosmicObject[] = COSMIC_CATALOG,
  limit = 3,
): CosmicObject[] {
  const titleText = ` ${title.toLowerCase()} `;
  const bodyText = ` ${explanation.toLowerCase()} `;

  const scored = catalog
    .map((obj) => {
      const names = [obj.name, ...(obj.aliases ?? []), obj.id];
      let best = 0;
      let inTitle = false;
      for (const n of names) {
        const lower = n.toLowerCase();
        if (lower.length < 2) continue;
        const re = wordBoundaryMatcher(lower);
        if (re.test(titleText)) {
          best = Math.max(best, lower.length);
          inTitle = true;
        } else if (re.test(bodyText)) {
          best = Math.max(best, lower.length * 0.8);
        }
      }
      return { obj, score: best + (inTitle ? 100 : 0) };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.obj.name.localeCompare(b.obj.name))
    .slice(0, limit)
    .map((s) => s.obj);

  return scored;
}

/** Pick the single best-matching object for an APOD, if any. */
export function findPrimaryObject(
  title: string,
  explanation: string,
  catalog: CosmicObject[] = COSMIC_CATALOG,
): CosmicObject | null {
  const matches = matchCatalogObjects(title, explanation, catalog, 1);
  return matches[0] ?? null;
}
