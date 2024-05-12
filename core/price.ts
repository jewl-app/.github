
interface JupiterPrice {
  id: string;
  price: number;
}

interface JupiterPriceResponse {
  data: Record<string, JupiterPrice>;
  timeTaken: number;
}

const baseUrl = "https://price.jup.ag/v4/price";

export async function getTokenPrices(mints: Array<string>): Promise<Map<string, number>> {
  if (mints.length === 0) {
    return new Map();
  }
  const ids = mints.join(",");
  const response = await fetch(`${baseUrl}?ids=${ids}`);
  const data = await response.json() as JupiterPriceResponse;
  const prices = new Map<string, number>();
  for (const mint of mints) {
    const price = data.data[mint];
    prices.set(mint, price?.price ?? null);
  }
  return prices;
}
