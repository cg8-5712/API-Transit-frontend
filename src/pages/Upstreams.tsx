import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api, { type ApiResponse, type Upstream } from '@/lib/api';
import UpstreamDialog from '@/components/UpstreamDialog';

export default function Upstreams() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpstream, setEditingUpstream] = useState<Upstream | null>(null);
  const queryClient = useQueryClient();

  const { data: upstreams, isLoading } = useQuery<ApiResponse<Upstream[]>>({
    queryKey: ['upstreams'],
    queryFn: () => api.get('/upstreams'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/upstreams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upstreams'] });
    },
  });

  const handleEdit = (upstream: Upstream) => {
    setEditingUpstream(upstream);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingUpstream(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此上游吗？')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
            上游管理
          </h1>
          <p className="text-muted-foreground mt-2">配置和管理 API 上游服务</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4" />
          添加上游
        </Button>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#FFF5F6] to-white">
          <CardTitle className="text-xl">上游列表</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F5DBDD] border-r-transparent"></div>
              <p className="mt-4">加载中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[#F5DBDD]/30">
                  <TableHead className="font-semibold">名称</TableHead>
                  <TableHead className="font-semibold">Base URL</TableHead>
                  <TableHead className="font-semibold">负载策略</TableHead>
                  <TableHead className="font-semibold">权重</TableHead>
                  <TableHead className="font-semibold">优先级</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="font-semibold">健康</TableHead>
                  <TableHead className="text-right font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upstreams?.data?.map((upstream) => (
                  <TableRow key={upstream.id} className="hover:bg-[#FFF5F6] transition-colors border-[#F5DBDD]/20">
                    <TableCell className="font-medium">{upstream.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{upstream.base_url}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#F5DBDD] text-[#EDC3CC]">
                        {upstream.lb_strategy}
                      </Badge>
                    </TableCell>
                    <TableCell>{upstream.weight}</TableCell>
                    <TableCell>{upstream.priority}</TableCell>
                    <TableCell>
                      {upstream.enabled ? (
                        <Badge className="gradient-pink text-white border-none">启用</Badge>
                      ) : (
                        <Badge variant="outline">禁用</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {upstream.is_healthy ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">健康</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">异常</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(upstream)}
                          className="hover:bg-[#F5DBDD]/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(upstream.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UpstreamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        upstream={editingUpstream}
      />
    </div>
  );
}
