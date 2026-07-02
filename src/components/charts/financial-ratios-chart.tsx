"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialRatiosChartProps {
  data: {
    metric: string;
    company: number;
    industry: number;
  }[];
}

export function FinancialRatiosChart({ data }: FinancialRatiosChartProps) {
  return (
    <Card className="rounded-xl h-full">
      <CardHeader>
        <CardTitle className="text-lg">Company vs Industry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="hsl(var(--muted-foreground)/0.3)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
              />
              <Radar name="Company" dataKey="company" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.45} />
              <Radar name="Industry" dataKey="industry" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
