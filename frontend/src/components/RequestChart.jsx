import { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export default function RequestChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      }),
    );

    // dummy analytics data
    const data = [
      { category: "Pop", value: 12 },
      { category: "Rock", value: 8 },
      { category: "Indie", value: 6 },
      { category: "R&B", value: 4 },
      { category: "Other", value: 3 },
    ];

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
      }),
    );

    series.data.setAll(data);

    // purple dashboard palette
    series.set(
      "colors",
      am5.ColorSet.new(root, {
        colors: [
          am5.color(0xc084fc),
          am5.color(0xa855f7),
          am5.color(0x9333ea),
          am5.color(0x7e22ce),
          am5.color(0x6b21a8),
        ],
      }),
    );

    series.slices.template.setAll({
      stroke: am5.color(0x231338),
      strokeWidth: 2,
      tooltipText: "{category}: {value}",
    });

    series.labels.template.setAll({
      fill: am5.color(0xffffff),
      fontSize: 12,
    });

    series.ticks.template.setAll({
      stroke: am5.color(0xffffff),
    });

    series.appear(1000, 100);

    return () => root.dispose();
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}
