import type { ReactElement } from "react";
import { useMemo } from "react";

interface DonutChartProps {
  data: Array<[string, number]>;
  maxItems?: number;
}

const _lightColors = [

];

const _darkColors = [

];

export function DonutChart(props: DonutChartProps): ReactElement {
  const maxItems = props.maxItems ?? 5;

  const data = useMemo(() => {
    const items = props.data
      .sort((a, b) => b[1] - a[1]);
    if (props.data.length <= maxItems) {
      return items;
    }

    const otherAmount = items
      .slice(maxItems - 1)
      .reduce((acc, [_, value]) => acc + value, 0);

    return [
      ...items.slice(0, maxItems - 1),
      ["Other", otherAmount],
    ] as const;
  }, [props.data, props.maxItems]);

  const total = useMemo(() => {
    return data.reduce((acc, [_, value]) => acc + value, Number.EPSILON);
  }, [data]);

  const _percentages = useMemo(() => {
    return data.map(([_, value]) => (value + Number.EPSILON) / total);
  }, [data, total]);

  // Donut chart
  // Legend underneath

  return (
    <div>
      Donut Chart
    </div>
  );
}
