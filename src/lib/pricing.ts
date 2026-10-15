import { INITIAL_MATCH_TICKETS } from "@/lib/mockData";

/**
 * Server-side pricing.
 *
 * The client must never be trusted to state what something costs. Every amount
 * charged or recorded resolves through this module.
 */

/** Membership tiers, keyed by the slug used on /pricing. */
export const MEMBERSHIP_PLANS: Record<string, { amount: number; blurb: string }> = {
  junior: { amount: 28000, blurb: "Junior Development — annual membership" },
  "teen-academy": { amount: 66000, blurb: "Teen Academy — annual membership" },
  "professional-league-masterclass": {
    amount: 124000,
    blurb: "Professional League Masterclass — annual membership",
  },
};

export function normalisePlan(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface TicketPrice {
  matchTitle: string;
  tierName: string;
  /** Dollars. */
  price: number;
  availableSeats: number;
  date: string;
  time: string;
  venue: string;
  tournament: string;
}

/**
 * Resolves a match ticket tier to its price and remaining seat count.
 * Returns null when the match or tier does not exist.
 */
export function resolveTicketPrice(matchId: string, tierName: string): TicketPrice | null {
  const match = INITIAL_MATCH_TICKETS.find((m) => m.id === matchId);
  if (!match) return null;

  const tier = match.priceTiers.find((t) => t.name === tierName);
  if (!tier) return null;

  return {
    matchTitle: match.matchTitle,
    tierName: tier.name,
    price: tier.price,
    availableSeats: tier.availableSeats,
    date: match.date,
    time: match.time,
    venue: match.venue,
    tournament: match.tournament,
  };
}

export interface CatalogueItem {
  id: string;
  title: string;
  price: number;
  image: string;
  kind: "product" | "program";
}

/**
 * Resolves catalogue ids (products and programmes) to their stored price.
 * Prices come from MongoDB when a document exists, otherwise from the seed
 * catalogue, so a client cannot choose its own amount.
 */
export async function resolveCatalogueItem(id: string): Promise<CatalogueItem | null> {
  const [{ default: Product }, { default: Program }, { INITIAL_PRODUCTS, INITIAL_PROGRAMS }] =
    await Promise.all([
      import("@/models/Product"),
      import("@/models/Program"),
      import("@/lib/mockData"),
    ]);

  const product = await Product.findOne({ _id: id }).catch(() => null);
  if (product) {
    return {
      id,
      title: product.title,
      price: product.price,
      image: product.image ?? "",
      kind: "product",
    };
  }

  const seedProduct = INITIAL_PRODUCTS.find((p) => p.id === id);
  if (seedProduct) {
    return {
      id,
      title: seedProduct.title,
      price: seedProduct.price,
      image: seedProduct.image ?? "",
      kind: "product",
    };
  }

  const program = await Program.findOne({ _id: id }).catch(() => null);
  const programData = program ?? INITIAL_PROGRAMS.find((p) => p.id === id);
  if (programData) {
    return {
      id,
      title: programData.title,
      price: programData.price,
      image: programData.image ?? "",
      kind: "program",
    };
  }

  return null;
}

/** Format helper shared by client and server so money renders identically. */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}