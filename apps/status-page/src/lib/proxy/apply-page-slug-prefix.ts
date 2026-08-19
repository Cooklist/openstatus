import type { Page } from "@openstatus/db/src/schema";

import type { ResolvedRoute } from "../resolve-route";

/**
 * Swaps the resolved prefix for the page slug. Custom-domain requests resolve
 * `prefix` to the domain itself (`getValidSubdomain` returns the full host), but
 * the `[domain]` segment must be the slug — the login cookie key is derived from
 * it client-side and compared against `secured-${page.slug}` in the middleware.
 *
 * Rebuilds `rewritePath` from `route.locale` rather than string-replacing, so it
 * commutes with `applyPageLocaleOverride`.
 */
export function applyPageSlugPrefix(
  route: ResolvedRoute,
  page: Pick<Page, "slug">,
): ResolvedRoute {
  if (route.prefix === page.slug) return route;

  // resolveRoute always builds rewritePath as ["", prefix, locale, ...rest]
  const [, , , ...rest] = route.rewritePath.split("/");
  const pagePrefix = `/${page.slug}/${route.locale}`;
  const pagePrefixIndex = route.rewritePath.indexOf(pagePrefix);
  return {
    ...route,
    prefix: page.slug,
    rewritePath: pagePrefixIndex >= 0
      ? route.rewritePath.slice(pagePrefixIndex)
      : `${pagePrefix}${rest.length ? `/${rest.join("/")}` : ""}`,
  };
}
