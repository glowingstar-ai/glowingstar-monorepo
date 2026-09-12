import { useId } from "react";
import styles from "./sculpted-icon.module.css";

export type SculptedIconKind =
  | "star"
  | "understanding"
  | "metacognition"
  | "agency"
  | "curiosity"
  | "connection";

type SculptedIconProps = {
  kind: SculptedIconKind;
  size?: number;
  tone?: "light" | "dark";
  className?: string;
};

const starPoints = [
  [40, 7],
  [47, 28],
  [64, 15],
  [51, 33],
  [73, 39],
  [51, 46],
  [64, 63],
  [47, 51],
  [40, 72],
  [34, 51],
  [16, 63],
  [29, 46],
  [7, 39],
  [29, 33],
  [16, 15],
  [34, 28],
];

/** Small, server-rendered sculptures share the hero's gold and pearl materials. */
export default function SculptedIcon({
  kind,
  size = 44,
  tone = "light",
  className,
}: SculptedIconProps): JSX.Element {
  const id = useId().replace(/:/g, "");
  const paint = (name: string): string => `url(#sculpture-${id}-${name})`;
  const starOutline = starPoints.map((point) => point.join(",")).join(" ");

  return (
    <span
      aria-hidden="true"
      className={[styles.sculpture, styles[tone], styles[kind], className]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        fill="none"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={`sculpture-${id}-gold`}
            x1="17"
            y1="12"
            x2="62"
            y2="68"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff7ce" />
            <stop offset=".23" stopColor="#e4c675" />
            <stop offset=".45" stopColor="#b58c36" />
            <stop offset=".58" stopColor="#fae9af" />
            <stop offset=".76" stopColor="#d2ab55" />
            <stop offset="1" stopColor="#8e6828" />
          </linearGradient>
          <linearGradient
            id={`sculpture-${id}-edge`}
            x1="16"
            y1="20"
            x2="62"
            y2="67"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#b4924d" />
            <stop offset=".55" stopColor="#816026" />
            <stop offset="1" stopColor="#c4a35e" />
          </linearGradient>
          <linearGradient
            id={`sculpture-${id}-light`}
            x1="25"
            y1="16"
            x2="51"
            y2="54"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fffdf1" />
            <stop offset=".5" stopColor="#f6e5ad" />
            <stop offset="1" stopColor="#c7a052" />
          </linearGradient>
          <radialGradient id={`sculpture-${id}-pearl`} cx=".3" cy=".23" r=".8">
            <stop stopColor="#ffffff" />
            <stop offset=".43" stopColor="#f4f2e7" />
            <stop offset=".76" stopColor="#d9d5c4" />
            <stop offset="1" stopColor="#b6af98" />
          </radialGradient>
          <radialGradient id={`sculpture-${id}-shadow`}>
            <stop
              stopColor={tone === "dark" ? "#000000" : "#71613c"}
              stopOpacity=".23"
            />
            <stop
              offset="1"
              stopColor={tone === "dark" ? "#000000" : "#71613c"}
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        <ellipse
          className={styles.shadow}
          cx="41"
          cy={kind === "star" ? 72 : 71}
          rx={kind === "star" ? 21 : 29}
          ry="6"
          fill={paint("shadow")}
        />

        <g className={styles.object} strokeLinejoin="round">
          {kind === "star" && (
            <>
              <polygon
                points={starOutline}
                transform="translate(0 2.3)"
                fill={paint("edge")}
              />
              <polygon points={starOutline} fill={paint("gold")} />
              {starPoints.map((point, index) => (
                <path
                  key={index}
                  d={`M40 39L${point.join(" ")}L${starPoints[(index + 1) % starPoints.length].join(" ")}Z`}
                  fill={paint(index % 2 === 0 ? "light" : "edge")}
                  opacity={index % 2 === 0 ? 0.93 : 0.32}
                />
              ))}
              <polygon
                points={starOutline}
                stroke="#f9e9b4"
                strokeWidth=".55"
              />
              <path d="M40 7V39L7 39" stroke="#fff9df" strokeWidth=".7" />
            </>
          )}

          {kind === "understanding" && (
            <>
              <path d="M28 18 45 28 28 38 11 28Z" fill={paint("light")} />
              <path d="M11 28 28 38V59L11 49Z" fill={paint("gold")} />
              <path d="M28 38 45 28V49L28 59Z" fill={paint("edge")} />
              <path
                d="M11 28 28 38 45 28M28 38V59"
                stroke="#fff4ca"
                strokeWidth=".7"
              />
              <path d="M49 31 67 41 49 52 31 41Z" fill={paint("pearl")} />
              <path d="M31 41 49 52V71L31 60Z" fill={paint("light")} />
              <path d="M49 52 67 41V60L49 71Z" fill={paint("gold")} />
              <path
                d="M31 41 49 52 67 41M49 52V71"
                stroke="#fffcdf"
                strokeWidth=".8"
              />
              <path d="M49 31 67 41" stroke="#ffffff" strokeWidth=".9" />
            </>
          )}

          {kind === "metacognition" && (
            <g transform="rotate(-27 40 40)">
              <ellipse cx="40" cy="43" rx="28" ry="23" fill={paint("edge")} />
              <ellipse cx="40" cy="38" rx="28" ry="23" fill={paint("gold")} />
              <ellipse cx="40" cy="38" rx="22" ry="18" fill={paint("edge")} />
              <ellipse
                cx="40"
                cy="37"
                rx="20.5"
                ry="16.5"
                fill={paint("pearl")}
              />
              <path
                d="M15 32C19 15 42 10 58 21"
                stroke="#fff7dc"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M27 34C29 26 36 23 43 25"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity=".8"
              />
              <ellipse
                cx="40"
                cy="38"
                rx="28"
                ry="23"
                stroke="#e9d397"
                strokeWidth=".6"
              />
              <circle
                cx="45"
                cy="40"
                r="5"
                fill={paint("gold")}
                opacity=".75"
              />
            </g>
          )}

          {kind === "agency" && (
            <>
              <ellipse cx="40" cy="48" rx="28" ry="19" fill={paint("edge")} />
              <ellipse cx="40" cy="44" rx="28" ry="19" fill={paint("gold")} />
              <ellipse
                cx="40"
                cy="44"
                rx="24"
                ry="15.5"
                fill={paint("pearl")}
              />
              <path
                d="M15 42C18 29 42 23 61 33"
                stroke="#fff5d5"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path d="M29 58 37 37 54 16 47 45Z" fill={paint("edge")} />
              <path d="M27 54 36 32 53 11 45 41Z" fill={paint("gold")} />
              <path d="M27 54 39 36 53 11 36 32Z" fill={paint("light")} />
              <path d="M53 11 39 36 45 41Z" fill={paint("edge")} opacity=".7" />
              <path d="M27 54 39 36 53 11" stroke="#fff6d7" strokeWidth=".8" />
              <circle cx="40" cy="43" r="3" fill={paint("gold")} />
            </>
          )}

          {kind === "curiosity" && (
            <>
              <ellipse
                cx="40"
                cy="42"
                rx="28"
                ry="14"
                transform="rotate(-35 40 42)"
                stroke={paint("edge")}
                strokeWidth="4"
              />
              <ellipse
                cx="40"
                cy="39"
                rx="28"
                ry="14"
                transform="rotate(-35 40 39)"
                stroke={paint("gold")}
                strokeWidth="3.5"
              />
              <circle cx="39" cy="40" r="13" fill={paint("pearl")} />
              <path
                d="M15 53C19 59 31 56 43 49"
                stroke={paint("gold")}
                strokeWidth="3.8"
                strokeLinecap="round"
              />
              <path
                d="M15 52C19 57 29 55 36 52"
                stroke="#fff6d4"
                strokeWidth=".8"
                strokeLinecap="round"
              />
              <path
                d="M57 8 61 18 71 22 61 26 57 36 53 26 43 22 53 18Z"
                fill={paint("gold")}
              />
              <path d="M57 8V22H43L53 18Z" fill={paint("light")} />
              <path
                d="M57 22V36L61 26 71 22Z"
                fill={paint("edge")}
                opacity=".6"
              />
              <circle cx="18" cy="52" r="4" fill={paint("pearl")} />
            </>
          )}

          {kind === "connection" && (
            <>
              <path
                d="M21 48 41 23 62 48 39 60Z"
                stroke={paint("edge")}
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M21 46 41 21 62 46 39 58Z"
                stroke={paint("gold")}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M21 45 41 20 62 45"
                stroke="#fff0bc"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <circle cx="41" cy="21" r="10" fill={paint("pearl")} />
              <circle cx="62" cy="46" r="10" fill={paint("gold")} />
              <circle cx="39" cy="58" r="10" fill={paint("pearl")} />
              <circle cx="21" cy="46" r="12" fill={paint("gold")} />
              <path
                d="M14 44C14 40 17 37 21 37M57 44C57 41 59 39 62 39"
                stroke="#fff5d3"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      </svg>
    </span>
  );
}
