import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import React from "react";
import clsx from "clsx";
import { nonNull } from "@/core/array";

interface IconProps {
  readonly params: { props?: Array<string> };
}

const path = `M262.1 125a1 1-44.5 0 0 1.3 0q16-12 35.9-8.3 10.9 2 20.6 6.7
    1.8.9 1.3 2.8l-4.8 19.8a1 1-83.4 0 1-1 .8q-4.3 0-8.6.7-5.4.8-8.3
    2.4-5.9 3.5-7.5 10.9-1.8 8.3-2.1 16.8l-.4 8.8q-1 17.5-.3 33.3.4
    6.4 5.2 10.9 7.8 7.2 19 6.4a1.4 1.4-2.4 0 1 1.6 1.3v24a.5.5-.6
    0 1-.5.4q-6 .2-11.2 1.9-10 3.3-13 11.9-1 3.2-1.2 16.1-.3
    18.7-.1 31.4.1 6.4-.6 12-.6 5.5-2 12-5.3 22.2-21 38.2-7
    7-15.9 12.2-12.9 7.3-27.8 10.3-11.2 2.2-23.7 2.6a2 1.9-7.9 0
    1-1.9-1.4l-5-19a.5.5-12.5 0 1 .4-.5q23.5-4.4 34.8-24 8.6-15.1
    10.4-32.9 1.3-11.8 1.3-21.5v-29.8q0-8.2-6.4-13.3-7.4-6.1-18-6.1a.6.6.5
    0 1-.6-.7V238a.7.7 1.9 0 1 .8-.7q12.8 1 20.9-8.3 3.4-3.8 3.4-10.2
    0-18.8-.4-37.7-.4-13.3-2.7-21.3-2.7-9.4-12.3-11.6-3.3-.8-6.8-1.2l-3.1.4q-2.5.3-3-2-2.5-10-4.7-19.9a1.7
    1.7-18.9 0 1 1-2q10.7-5 22.7-6.9 19.1-3.1 34.3 8.5Zm0
    3.9q-15-12.8-34.9-9.4-7 1.1-13.5 3.8-1.5.6 0 .5 6.8-.1 13.3 1 7
    1.2 12.6 4 18.3 9 22.4 30.5.3 1.7 1 .1l2.1-6.1q7.4-23.2 31.3-28.2
    7.1-1.5 14.4-1.1 3 .2.2-1-7.6-3.2-16.5-4-18-1.6-31.6 9.9a.6.6 45.4
    0 1-.7 0Zm-45.5-1.4q1.1-1.5-.7-1.5-2.7 0-4.8 2-2 2-2 2.2-1.3 1.6.3
    3.4a.6.6-38.6 0 0 .8.1q3.6-2.6 6.4-6.2Zm6.3-1.2q-2.8-.6-4.7.7-3.1
    3.8-6.9 7-2 1.7-.8 4.9a.4.4 57.2 0 0 .6.1l12-12q.5-.5-.2-.7Zm51
    14.4q-5.9 7.8-8.2 17-1.4 5.3-1.5 18.3-.4 46.9-.2 93.8 0 2.9.8 0
    5-16.9 21.7-25 7.8-3.7 16-5 1.6-.3
    0-.8-5.5-1.8-10.2-5.3-6.5-4.8-6.4-14.3l-.1-31.2q-.2-15.3 1.4-24.2
    1.4-7.7 4.6-12 3.6-4.8 9.4-6.3 5.3-1.3 10.7-1 2 .2 2.4-1.7l3.5-15.1a1
    1-78 0 0-.8-1.2q-16.5-3-31.5 4.6-6.9 3.4-11.5 9.4Zm-64.7-14q-1
    .5-1.1 1.5-.1.6.4.3 1.1-.5 1.4-1.8a.4.3-84.6 0 0-.4-.5q-.3
    0-.3.5Zm19.2.6q-2.5-.8-4 .8-6 6.4-12.4 12.4-1.6 1.5-1 2.8 1 2
    2.6.5l15.2-15.2a.8.8 31.3 0 0-.4-1.3Zm4.8 1q-1.4-.4-2.6.3-1.9
    1-14.5 13.9l-.6.6q-1.9 1.7 1.8 1.6a3.9 3.7-67.5 0 0
    2.6-1.1l13.8-13.9q1-1.1-.5-1.5Zm5.4 2.2q-1.1-.7-2.3-.5-.8.1-1.8 1l-13.2
    13.3a.2.2 40.5 0 0 0 .4q3 2 4.7 0 6.1-6.6 12.8-13a.8.7-52 0 0-.2-1.2Zm-8.2
    11q-2 1.5-4 3.8a.7.7-53.1 0 0 .1 1q1.5 1 3 .4 1-.5 12-11.7
    3.4-3.4-1.2-3a1.5 1.4-67.8 0 0-.9.4q-4.7 4.3-9 9Zm15.4-6.6a1.9 1.8 38.6
    0 0-2.3.2l-12.8 12.8a.8.8-31.6 0 0-.3.9q.7 2 2.8 1 1.7-.9
    12.7-12.3l.6-.5q1-1-.7-2.1Zm-11.6 16.8q-1 2 1 2a1.3 1.1-63.7 0 0
    .8-.4l13.6-13.5a1 1-29.8 0 0 .3-.9q-.6-3-2.7-.5l-11.8 11.9q-.9.8-1.2
    1.4Zm7.5-1.8-4.8 4.8q-.9.9-1 1.7 0 1.3 1 2a.6.6-47.3 0 0 .7 0l15-14.6a1
    1-27.2 0 0 .3-.9q-.2-1.3-1.4-1.9a.8.8-51.2 0 0-.8.1q-4.8 4.1-9
    8.8Zm13.6-1.7-.6-2.9q-.3-1.1-1.1-.3l-15.7 15.6a1.2 1.2-22.4 0 0-.4
    1q0 3.8 2.4.8 2.5-3 13-12a.4.3-31.2 0 1 .7 0q.1.7-.8 1.2-6.8 7.2-14
    14a1.1.7-34.7 0 0-.3 1l.6 2.7q0 .5.5.1 8.7-8 16.7-16.5 1-1
    .9-2-.1-1.3-1.4-2a1.1.8-87.3 0 1-.5-.7Zm2.5 4.9q-7.7 8.7-15.7
    16.5l-2.3 2.2q-1 1.4-.8 3.3.1 1.2 1 .3 8.6-8.8 17.5-17.3 1.2-1.2
    1.4-2.2.4-1.4-.4-2.8a.4.4 50.3 0 0-.7 0Zm-5.1 11.8q-5.2 4.8-10
    10l-1.4 1.2q-2.2 2-1.3 5.3a.4.4-29.9 0 0 .8.2l18.7-18.7a2 2 66.5 0
    0 .6-1.5q-.2-3.6-1.9-1.9-2.8 2.6-5.5 5.4Zm-1 12q4.2-4 8.7-9a2.3 2.3
    70.8 0 0 .5-1.1q.6-3.6-1-2-8.6 8.4-17 17l-1.3 1q-1.9 1.7-1.6 4.5.1
    1 .8.3l11-10.6Zm8.6-1.7q1.7-1.4 1.7-3.6 0-2.8-2-.9-9.4 9.2-18.6
    18.5-1.1 1.1-1.4 2.3-.3 1.3-.2 2.8.1 1 .8.3 9.4-9 18.3-18 0-.2 1.4-1.4Zm.3
    5.7q2-1.7 1.2-4.3a.3.3-30.8 0 0-.6-.2q-9.9 10-20 19.9-1.7 1.7-1.3
    4.3.2.6.6.2 9.6-9.4 19-19l1.1-1Zm-13 15-4.8 5q-3.5 2.4-2.9
    6.7.2.7.7.2l20.4-20.4q.8-.8 1-1.6v-2q-.1-1.7-1.4-.5-6.7 6.1-13
    12.6Zm13.9-6.5q-10.6 9.9-20.3 20-1.7 1.8-1.1 4.1a.3.3-29.7 0 0
    .5.2q10.4-9.8 20.2-20.1.9-1 1.1-1.8.3-1 .1-2.2 0-.6-.5-.2Zm-4
    14.4 4-4q1.2-2 0-3.7a.5.4-38.5 0 0-.6 0q-10 9.1-19.4 19-1.1 1.1-1.4
    2.3-.4 1.4-.3 2.8.1 1.2 1 .4 8.6-8.4 16.8-16.8Zm-7.4 41.8q-2
    .7-.5-.8l9.3-9.3 2.5-2.6q1-1.6.5-3.8-.2-1.5-1.2-.4-6.7 7.5-14.8
    14.3a.8.4-49.8 0 1-.5.2q-.2 0-.3-.2a.8.5-42.3 0 1 .3-.8q7.7-8.3
    16-16 .8-1.4.6-3.1-.3-1.9-1.7-.6-9.5 9-19 18.9-.7.8-1 .4a.8.6-43.2
    0 1 .1-.9q9.4-10 19.5-19.2 2.3-2 2-5.8 0-1.2-.9-.3l-25 24.9-.6.3q-.7
    0-.7-.4 0-.3.4-.6 22.8-24 24.5-25 2.9-1.8 2.4-5.3-.2-1.3-1.2-.4-7
    6.4-13.6 13.3-2.7 2.9-17 16.8l-.6.4q-.7.3-.8-.3a1 .8-29.9 0 1 .4-.8q5.3-4.8
    10.2-9.8 9.4-9.6 19-19l2.8-2.8q1.3-2 .6-4.4a.3.3 59.7 0 0-.6-.1l-18.5
    18.3q-4 3.7-6 8.7-4.4 6-11.4 9-1.8.7 0 1.5 2.2.9 5 1.6 3.5.8 5 1.5 19
    7.7 26 27.8.2.7.6.2v-.5q-.2-8 0-16 0-1-.8-.2l-1.3 1.3a.6.5-44.8 0
    1-.8.1q-.3-.3 0-.7.8-1.4 1.9-2.6 1.8-2 .8-4.2a.4.4-27.9 0 0-.6-.2q-2.7
    1.8-4.1 3.5-.4.4-.6.4a.5.3-57.6 0 1 0-.7q2.2-2.6 4.8-4.8
    1.1-1.3.5-4.8 0-.5-.5-.1-3.8 3.3-6.9 6.8l-.6.4q-1.4.4-.6-.9
    1.3-2 6.2-6.7l1.1-1q2.2-1.8 1.5-4.7a.7.6-27.1 0 0-1-.3q-5
    4.1-9.2 9-1.1 1.3-1.6 1.5Zm-31.5-4.3q-4.2-1.4-4 4 0 1.3.9.4l3.4-3.5a.6.5
    30 0 0-.3-1ZM275 256q-9.4 10.9-10.8 25.3-.4 4.6-.3 23.6 0 10.1-.3 16.2-.7
    8.7-1.9 16.1-1.9 12-7.6 23.7-5.6 11.4-14.7 18.5-14.6 11.6-34.2 13.6-4.8.5-9.3
    1.2a1.1 1.1-11.4 0 0-1 1.4l3 11.3a1.8 1.7-7 0 0 1.7 1.4q23.2-.3 44.3-10.8
    14.9-7.4 24.3-19.8 11.1-14.4 15-33.3 2.9-14.6 2.8-33.4v-32.5q.9-5.7 3-8.2
    8.5-9.7 21.4-10.3a.7.7 88.7 0 0 .6-.7v-17.5a.7.7-1.8 0 0-.8-.8q-8.7.5-17.3
    3.2-10.6 3.4-17.9 11.8Zm-50.5-13.7q-2-.8-3.4.3l-4.8 4.8q-2 2-1.1 4.6a.3.3-29.7
    0 0 .5.1q4.9-4.4 9-9.4a.3.3 30.7 0 0-.2-.4Zm5.4 1.2q-2.5-1-3.9 0-1.1.8-9.4
    9.5-1 1.1-1.5 2.4l-.7 2.8q-.4 2.2 1.2.6l14.5-14.5a.5.5 32.6 0 0-.2-.8Zm3.5.8a1.4
    1.4 32.4 0 0-1.5.3L217.7 259a.5.5-44.6 0 0 0 .7q1.4 1.4 3.4.4 6.2-6.6
    12.7-12.7 1-1 1-1.5.3-1-1.4-1.6Zm6.1 3q-3-2.4-4.4.3-6.4 6.2-12.7
    12.6a.6.5-44.7 0 0 0 .8q.8.8 1.9.9 1 0 2-1 6.8-6.5 13.3-13a.3.3 41.8
    0 0 0-.6Zm4.2 2.3q-1.4-1.5-2.4-1.1-.3 0-1.6 1.5-6 5.8-12.2 12.1a.7.7-50.3
    0 0 .1 1q1.7 1.2 2.7.8.2 0 1.7-1.6l11.7-11.6a.8.8 46.8 0 0 0-1.1Zm3 4a1 1
    0 0 0 0-1.4l-1-1a1 1 0 0 0-1.4 0l-13 13.1a1 1 0 0 0 0 1.4l1 1a1 1 0 0 0
    1.4 0l13-13.2Zm-7 9.3q-2.2 2-4 4.3-.8.7-.7 1.5 0 1.2 1.2 1.4a1.1 1-56.4
    0 0 .9-.2q6.9-6 13-12.8a.8.7-38.4 0 0 .1-.9q-.4-1-1.3-1.6a.6.6-44.8 0
    0-.8 0q-4.5 3.8-8.4 8.3Zm3.2 2.8q-2.5 2.2-4.6 5-.6.7-.6 1.5 0 1 1 1.6a.8.7-53.2
    0 0 .9-.2l13.2-13a.8.8-33.4 0 0 .3-.9q-.5-1.3-1.9-1.6a1 .9-56.5 0 0-.8.2q-4
    3.4-7.5 7.4Zm9.4-2.4-12 12q-1 1-1 1.8-.2 1.3.8 2.3a.5.5-43.4 0 0 .7
    0l14-13.2a2.2 2.2-32 0 0 .6-2.4q-1.2-3-2.6-1l-.5.5Zm2 4q-5.5 6.8-12.5
    12.2-2.4 1.9-1.7 5.8.2.8.8.2l16.2-16a1.5 1.5-34.7 0 0 .3-1.7q-1-2.2-1.9-1.8l-1.1
    1.4Zm-8 14.8-3.9 4q-2.8 2.1-2.4 6 .2 1.1 1 .3l17-17q1.1-1.2
    1.2-2.4 0-1.4-.7-2.9-.4-.8-.9 0-1.9 3-4.6 5.4-3.5 3.2-6.7
    6.6Zm5.9.8q-1.5 1.9-11.6 11.3a1.7 1.5-19.3 0 0-.5.8q-.3 1.8 0 3.5.1.5.5.1 9-8.6
    17.7-17.5l1.2-1q1.4-1 .8-3.3a.6.6 65.3 0 0-.9-.4q-4.4 3-7.2 6.5Zm8.2-1.4q-9
    8.5-17.5 17.2l-1.3 1.1q-2.2 2-1.5 5.6.1.8.7.2l19-18.8q2.2-2.1 1.1-5.2a.3.3
    59.4 0 0-.5-.1Zm-5.8 16.4 6-5.8q2-2.2 1.1-4.8a.6.6 58.2 0 0-.9-.2q-8.8
    9.1-18 18l-1.3 1.1q-2.4 2-1.6 5.3.2.8.8.2 7-6.8 13.9-13.8Zm-5 7q-3.6 3.5-7
    7.2-2.8 1.8-2.5 6.2 0 1 .7.3 10.2-10 19.8-19.7 1.2-1.2 1.4-2
    .3-1.5-.5-2.8a.5.4-36.8 0 0-.6 0q-5.8 5.2-11.2 10.8Zm-3 10q-4.8 4.6-6.2 6.5-.9
    1.3-.3 2.9a.3.3-32.2 0 0 .5.1l20.5-20.1a3.3 3 69.6 0 0 .9-2.3q0-3-1.6-.8-6.8
    6.9-13.8 13.7Zm0 6q-2.8 3.1-6 6-2.2 2.3-1.5 5.4a.3.3-28.7 0 0 .5.1q10-9.4
    19.7-19.3 3-1.8 2.7-5-.1-2-1.6-.6-7.2 6.5-13.7 13.4Zm-1 12q7.9-7.8 15.5-15.8
    1.1-1.2.8-3.6-.1-.7-.6-.2l-21.9 22.1q-1.6 1.6-1.4 3.9 0 1
    .8.3 3.5-3.1 6.8-6.8Zm.6 1.5-8 8q-2 2.6-2.2 5.9 0 .9.6.2 11.8-11.1
    23.1-23 1.2-1.3 1.4-2.4.2-1.2.2-3 0-.7-.6-.2l-14.5 14.5Zm-10.4 17.7q-2.1
    2.1-2.8 5.2-.3 1.2.6.3l26.2-26a4 4-18.9 0 0 1.2-2.3q.4-3.5-1.6-1.1L235.8
    352Zm15.9-10.2-10 10q-8.7 8.7-9.5 9.7-4.4 5.1-7.6 11.4-.5 1 .3.2 15.8-15.3
    31.5-31 3.5-3.5 3.4-7.4 0-.6-.4-.2-4.2 3.3-7.7 7.3Zm-9.6 16.4q-15.3 15.1-30.3
    30.5-1.8 1.9.7 1.1 3.8-1.1 6.5-4.4l33.8-33.6 1.4-1.3q2.8-2.6 3.8-6.4.6-2-1-.5l-15
    14.6Zm-8 14q-7.3 7.3-14 14.5-1 1.1.4.7 5.7-1.6 9.6-6 4-4.6 19.3-19
    4.3-4.1 6.2-10.2.3-.8-.4-.4-1.9 1.1-3.4 3l-17.7 17.5ZM248 366l-15.2 15q-2
    1.8.4.5 9.5-5.6 15.2-15.1 1-1.9-.4-.4Zm-44.5 24.8q4 .6
    6.7-2.2l4.3-4.4q.8-1.4-.3-.6-5.4 3.2-10.8 6.7-.7.4 0 .5Z`;

function getImageSize(params: Array<string> = []): [number, number] {
  const sizes = params
    .map(x => parseInt(x, 10))
    .filter(x => Number.isInteger(x))
    .filter(x => x > 0);
  const width = sizes.length > 0 ? sizes[0] : 512;
  const height = sizes.length > 1 ? sizes[1] : width;
  return [width, height];
}

function getColors(attributes: Set<string>): string {
  if (attributes.has("light")) {
    return "bg-transparent text-slate-800";
  }
  if (attributes.has("dark")) {
    return "bg-transparent text-slate-200";
  }
  return "bg-emerald-900 text-slate-200";
}

const prerenderedAttributes = {
  size: [
    null, "16", "24", "32", "48",
    "64", "72", "96", "128", "144",
    "152", "192", "256", "384", "512",
  ],
  color: [null, "light", "dark"],
  corner: [null, "circle"],
};

export function generateStaticParams(): Array<IconProps["params"]> {
  return prerenderedAttributes.size.flatMap(size => {
    return prerenderedAttributes.color.flatMap(color => {
      return prerenderedAttributes.corner.map(corner => {
        return { props: [size, color, corner].filter(nonNull) };
      });
    });
  });
}

export function GET(_request: NextRequest, props: IconProps): ImageResponse {
  const [width, height] = getImageSize(props.params.props);
  const attributes = new Set(props.params.props);
  const corners = attributes.has("circle") ? "rounded-full" : "rounded-md";
  const colors = getColors(attributes);

  const element = (
    <div tw={clsx("w-full h-full flex justify-center content-center", colors, corners)}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 512 512">
        <path fill="currentColor" d={path} />
      </svg>
    </div>
  );
  return new ImageResponse(element, { width, height });
}
