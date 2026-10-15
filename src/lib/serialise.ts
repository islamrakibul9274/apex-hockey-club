/**
 * API response normalisation.
 *
 * Documents read from MongoDB expose `_id` and no `id`, while the seed
 * catalogue uses `id` strings like "prod-1". The client keys carts, likes and
 * checkout payloads on `id`, so without this every database-sourced row arrived
 * with `id: undefined`:
 *
 *  - React saw duplicate keys and warned on every render
 *  - adding two different products merged them into one cart line
 *  - checkout payloads were rejected as empty
 *
 * These helpers guarantee a stable, unique `id` on every item regardless of
 * which source it came from.
 */

/**
 * Anything document-shaped. Deliberately not an index signature, so Mongoose
 * documents (which have no index signature) remain assignable.
 */
type MaybeDocument = object;

function toIdString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "toString" in value) {
    const asString = String(value);
    // Guard against "[object Object]" from a malformed _id.
    if (asString && asString !== "[object Object]") return asString;
  }
  return undefined;
}

/**
 * Converts a Mongoose document to a plain object.
 * Spreading a document directly serialises its internal `$__` state, which
 * would leak implementation detail into every API response.
 */
function toPlain<T>(doc: T): T {
  const maybeDoc = doc as { toObject?: () => unknown };
  if (typeof maybeDoc?.toObject === "function") {
    return maybeDoc.toObject() as T;
  }
  return doc;
}

/**
 * Returns the document with an `id` guaranteed.
 * Falls back to `_id`, then to the title, then to a positional key, so an item
 * can never reach the client without a usable identity.
 */
export function withId<T extends MaybeDocument>(
  doc: T,
  fallback?: string
): T & { id: string } {
  // Spread the PLAIN form. Spreading a Mongoose document would serialise its
  // internal $__ state into the API response.
  const plain = toPlain(doc) as { id?: unknown; _id?: unknown; title?: unknown };

  const existing = toIdString(plain.id) ?? toIdString(plain._id) ?? fallback;

  // Last resort: a title is stable enough to keep the cart consistent.
  const hashed =
    existing ?? toIdString(plain.title) ?? `item-${Math.abs(hashString(String(plain.title ?? "")))}`;

  return { ...(plain as object), id: hashed } as T & { id: string };
}

export function withIdAll<T extends MaybeDocument>(docs: T[]): (T & { id: string })[] {
  return docs.map((doc, index) => withId(doc, `item-${index}`));
}

/** Falls back to the catalogue so a mixed source list still has ids. */
export function normaliseCatalogue<T extends MaybeDocument, S extends MaybeDocument>(
  fromDb: T[],
  seed: S[]
): (T & { id: string })[] {
  if (fromDb.length > 0) return withIdAll(fromDb);
  return seed.map((doc, index) => withId(doc, `item-${index}`)) as unknown as (T & { id: string })[];
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}