import Component from "@/components/ui/area-chart";

export default function DemoThree() {
  return (
    <Component
      className="max-w-4xl"
      dark
      stacked
      index="Month"
      categories={["Sales", "Returns", "Profit"]}
      data={[
        { Month: "Jan", Sales: 120, Returns: 10,  Profit: 60 },
        { Month: "Feb", Sales: 140, Returns: 12,  Profit: 72 },
        { Month: "Mar", Sales: 160, Returns: 11,  Profit: 78 },
        { Month: "Apr", Sales: 180, Returns: 15,  Profit: 90 },
        { Month: "May", Sales: 210, Returns: 13,  Profit: 110 },
        { Month: "Jun", Sales: 230, Returns: 17,  Profit: 118 },
        { Month: "Jul", Sales: 240, Returns: 16,  Profit: 122 },
        { Month: "Aug", Sales: 250, Returns: 18,  Profit: 128 },
        { Month: "Sep", Sales: 220, Returns: 14,  Profit: 112 },
        { Month: "Oct", Sales: 200, Returns: 12,  Profit: 100 },
        { Month: "Nov", Sales: 260, Returns: 19,  Profit: 132 },
        { Month: "Dec", Sales: 300, Returns: 20,  Profit: 150 },
      ]}
      colors={["#0c6d62", "#12a594", "#10b3a3"]}
    />
  );
}