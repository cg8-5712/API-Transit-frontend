import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api, { type ApiResponse, type UpstreamStat, type TokenStat } from '@/lib/api';

export default function Statistics() {
  const { data: upstreamStats } = useQuery<ApiResponse<UpstreamStat[]>>({
    queryKey: ['stats', 'upstream', '7d'],
    queryFn: () => api.get('/stats/upstream?period=7d'),
  });

  const { data: tokenStats } = useQuery<ApiResponse<TokenStat[]>>({
    queryKey: ['stats', 'token', '7d'],
    queryFn: () => api.get('/stats/token?period=7d'),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
          统计分析
        </h1>
        <p className="text-muted-foreground mt-2">查看详细的调用统计数据</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#FFF5F6] to-white">
          <CardTitle className="text-xl">上游统计（近 7 天）</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[#F5DBDD]/30">
                  <TableHead className="font-semibold">上游名称</TableHead>
                  <TableHead className="text-right font-semibold">总请求</TableHead>
                  <TableHead className="text-right font-semibold">成功</TableHead>
                  <TableHead className="text-right font-semibold">失败</TableHead>
                  <TableHead className="text-right font-semibold">成功率</TableHead>
                  <TableHead className="text-right font-semibold">平均延迟</TableHead>
                  <TableHead className="text-right font-semibold">P95 延迟</TableHead>
                  <TableHead className="text-right font-semibold">请求流量</TableHead>
                  <TableHead className="text-right font-semibold">响应流量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upstreamStats?.data?.map((stat, idx) => (
                  <TableRow key={idx} className="hover:bg-[#FFF5F6] transition-colors border-[#F5DBDD]/20">
                    <TableCell className="font-medium">
                      {stat.upstream_name || '未知'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {stat.total_requests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-green-600">
                      {stat.success_requests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-red-600">
                      {stat.error_requests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-pink transition-all"
                            style={{ width: `${stat.success_rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stat.success_rate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {stat.avg_latency_ms.toFixed(0)} ms
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {stat.p95_latency_ms.toFixed(0)} ms
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {(stat.total_request_bytes / 1024).toFixed(1)} KB
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {(stat.total_response_bytes / 1024).toFixed(1)} KB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#FFF5F6] to-white">
          <CardTitle className="text-xl">Token 统计（近 7 天）</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#F5DBDD]/30">
                <TableHead className="font-semibold">Token 标签</TableHead>
                <TableHead className="text-right font-semibold">总请求</TableHead>
                <TableHead className="text-right font-semibold">成功</TableHead>
                <TableHead className="text-right font-semibold">失败</TableHead>
                <TableHead className="text-right font-semibold">成功率</TableHead>
                <TableHead className="text-right font-semibold">平均延迟</TableHead>
                <TableHead className="text-right font-semibold">请求流量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokenStats?.data?.map((stat, idx) => (
                <TableRow key={idx} className="hover:bg-[#FFF5F6] transition-colors border-[#F5DBDD]/20">
                  <TableCell className="font-medium">
                    {stat.token_label || '未知'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {stat.total_requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-green-600">
                    {stat.success_requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-red-600">
                    {stat.error_requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-pink transition-all"
                          style={{ width: `${stat.success_rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stat.success_rate.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {stat.avg_latency_ms.toFixed(0)} ms
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {(stat.total_request_bytes / 1024).toFixed(1)} KB
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
