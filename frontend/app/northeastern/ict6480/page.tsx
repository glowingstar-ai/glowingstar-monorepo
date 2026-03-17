import type { Metadata } from "next";
import ICT6480Portal from "@/components/ICT6480Portal";

export const metadata: Metadata = {
  title: "Northeastern ICT6480",
};

export default function NortheasternICT6480Page(): JSX.Element {
  return <ICT6480Portal />;
}
