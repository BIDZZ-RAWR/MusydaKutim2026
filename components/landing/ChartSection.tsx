import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ChartSectionProps {
  chartData: { name: string; fullName: string; votes: number }[]
  landingContent: any
  sizeByDevice: (desktopKey: string, mobileKey: string) => number
  colors: string[]
}

export default function ChartSection({ chartData, landingContent, sizeByDevice, colors }: ChartSectionProps) {
  return (
    <section className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border border-green-100">
      <h2
        className="text-center font-bold mb-8"
        style={{
          color: landingContent.chartTitleColor,
          fontSize: `${sizeByDevice("chartTitleSize", "chartTitleSizeMobile") || 0}rem`,
        }}
      >
        {landingContent.chartTitle}
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 30, bottom: 40 }}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: "#374151", fontWeight: 500 }}
            />
            <YAxis
              tick={{ fill: "#374151", fontWeight: 500 }}
              label={{ value: landingContent.chartYAxisLabel, angle: -90, position: "insideLeft", fill: "#374151" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #16a34a",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              labelStyle={{ fontWeight: "bold", color: "#111827" }}
              cursor={{ fill: "rgba(22, 163, 74, 0.1)" }}
              content={(props: any) => {
                if (props.active && props.payload && props.payload.length) {
                  const data = props.payload[0].payload
                  return (
                    <div className="bg-white p-4 rounded-lg border-2 border-green-500 shadow-xl">
                      <p className="font-bold text-gray-800">{data.fullName}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Nomor Urut: <span className="font-semibold">{data.name.replace("Calon ", "")}</span>
                      </p>
                      <p className="text-lg font-bold text-green-600 mt-2">{data.votes} Suara</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="votes" name="Jumlah Suara" radius={[8, 8, 0, 0]} animationDuration={1000}>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#colorGradient${index % colors.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
