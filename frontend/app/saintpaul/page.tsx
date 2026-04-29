import { redirect } from "next/navigation";
import {
  buildSaintPaulQueryString,
  normalizeSaintPaulSearchParams,
} from "@/lib/saint-paul";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SaintPaulIndexPage({
  searchParams,
}: Readonly<PageProps>): never {
  const normalizedParams = normalizeSaintPaulSearchParams(searchParams);
  const queryString = buildSaintPaulQueryString(normalizedParams);
  const destination = queryString
    ? `/saintpaul/teacher?${queryString}`
    : "/saintpaul/teacher";

  redirect(destination);
}
