import apis from "@/data/public-apis.json";

export interface PublicApi {
  category: string;
  name: string;
  description: string;
  url: string;
  auth: string;
  https: string;
  cors: string;
}

export function getPublicApis(): {
  apis: PublicApi[];
  categories: string[];
} {
  const list = apis as PublicApi[];
  const categories = [...new Set(list.map((a) => a.category))].sort();
  return { apis: list, categories };
}
