import { Fragment } from "react";
import type { ReactNode } from "react";
import {
  fitLabel,
  labelFontSize,
  labelPath,
  labelRadius,
  type WheelSegment,
} from "./flavor-wheel-geometry";
import type { FlavorWheelNode } from "./FlavorWheel";

export type WheelLabelProps = {
  segment: WheelSegment<FlavorWheelNode>;
  legend: string;
  idPrefix: string;
};

/**
 * A segment's arched label (design.md D5): one `<text>` per line, set on a
 * `<textPath>` along an unfilled arc near the segment's outer edge. Nothing
 * is drawn at rest when not even the name fits.
 */
export function SegmentLabel({
  segment,
  legend,
  idPrefix,
}: WheelLabelProps): ReactNode {
  const fit = fitLabel(segment, segment.node.name, legend);
  if (fit === "active") return null;
  const size = labelFontSize(segment.ring);
  const lines =
    fit === "both" ? [segment.node.name, legend] : [segment.node.name];
  // Nested in its own group so the segment's direct `<path>` stays its arc.
  return (
    <g>
      {lines.map((line, index) => {
        const id = `${idPrefix}-label-${segment.node.id}-${index}`;
        return (
          <Fragment key={index}>
            <path
              id={id}
              d={labelPath(
                labelRadius(segment, index as 0 | 1),
                segment.start,
                segment.end,
              )}
              fill="none"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size}
              fill="currentColor"
              className="pointer-events-none select-none"
            >
              <textPath href={`#${id}`} startOffset="50%">
                {line}
              </textPath>
            </text>
          </Fragment>
        );
      })}
    </g>
  );
}

/**
 * The name of an active note whose label cannot fit even arched (design.md
 * D5): the name alone on a half-circle centred on the segment's mid-angle,
 * in the primary text colour over a halo of the card colour, since it
 * overflows onto the neighbouring segments. Drawn last; nothing for a label
 * that fits.
 */
export function ActiveName({
  segment,
  legend,
  idPrefix,
}: WheelLabelProps): ReactNode {
  if (fitLabel(segment, segment.node.name, legend) !== "active") return null;
  const id = `${idPrefix}-active-name`;
  const mid = (segment.start + segment.end) / 2;
  return (
    <>
      <path
        id={id}
        d={labelPath(labelRadius(segment, 0), mid - 90, mid + 90)}
        fill="none"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={labelFontSize(segment.ring)}
        strokeWidth={4}
        paintOrder="stroke"
        strokeLinejoin="round"
        className="pointer-events-none select-none fill-text-primary stroke-surface-card"
      >
        <textPath href={`#${id}`} startOffset="50%">
          {segment.node.name}
        </textPath>
      </text>
    </>
  );
}
