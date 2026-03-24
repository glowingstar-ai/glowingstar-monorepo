import ManifestoLandingPage, {
  manifestoMetadata,
} from "@/components/ManifestoLandingPage";

export const metadata = manifestoMetadata;

export default function Home(): JSX.Element {
  return <ManifestoLandingPage />;
}
