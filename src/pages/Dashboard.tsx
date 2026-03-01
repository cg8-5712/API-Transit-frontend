import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Server, Key, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api, { type ApiResponse, type DashboardSummary } from '@/lib/api';

export default function Dashboard() {
  const { data: summary } = useQuery<ApiResponse<DashboardSummary>>({
    queryKey: ['dashboard', '7d'],
    queryFn: () => api.get('/stats/summary?period=7d'),
  });

  const stats = summary?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
          仪表盘
        </h1>
        <p className="text-muted-foreground mt-2">API 网关运行概览</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 gradient-pink">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">总请求数</CardTitle>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.total_requests.toLocaleString() || 0}</div>
            <p className="text-sm text-white/80 mt-1">
              成功率 {stats?.success_rate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 gradient-pink-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">上游服务</CardTitle>
            <div className="h-10 w-10 rounded-full bg-[#F5DBDD]/30 flex items-center justify-center">
              <Server className="h-5 w-5 text-[#EDC3CC]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.healthy_upstreams || 0} / {stats?.total_upstreams || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">健康 / 总数</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃 Token</CardTitle>
            <div className="h-10 w-10 rounded-full bg-[#F5DBDD]/30 flex items-center justify-center">
              <Key className="h-5 w-5 text-[#EDC3CC]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.active_tokens || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">已启用</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 gradient-pink">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">平均延迟</CardTitle>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats?.avg_latency_ms.toFixed(0) || 0} ms
            </div>
            <p className="text-sm text-white/80 mt-1">近 7 天</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">请求趋势</CardTitle>
            <CardDescription>每日请求量统计</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats?.requests_per_day || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5DBDD" opacity={0.3} />
                <XAxis dataKey="date" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #F5DBDD',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="total" fill="#F5DBDD" radius={[8, 8, 0, 0]} />
                <Bar dataKey="success" fill="#EDC3CC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">成功率趋势</CardTitle>
            <CardDescription>每日成功率变化</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={stats?.requests_per_day.map((d) => ({
                  ...d,
                  rate: d.total > 0 ? (d.success / d.total) * 100 : 0,
                })) || []}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5DBDD" opacity={0.3} />
                <XAxis dataKey="date" stroke="#999" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#999" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #F5DBDD',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#EDC3CC"
                  strokeWidth={3}
                  dot={{ fill: '#F5DBDD', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
