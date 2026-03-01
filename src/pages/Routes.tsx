import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
import api, { type ApiResponse, type RouteRule } from '@/lib/api';
import RouteDialog from '@/components/RouteDialog';

export default function Routes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRule | null>(null);
  const queryClient = useQueryClient();

  const { data: routes, isLoading } = useQuery<ApiResponse<RouteRule[]>>({
    queryKey: ['routes'],
    queryFn: () => api.get('/route-rules'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/route-rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  const handleEdit = (route: RouteRule) => {
    setEditingRoute(route);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRoute(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此路由规则吗？')) {
      deleteMutation.mutate(id);
    }
  };

  const matchTypeLabels = {
    exact: '精确匹配',
    prefix: '前缀匹配',
    regex: '正则匹配',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
            路由规则
          </h1>
          <p className="text-muted-foreground mt-2">配置请求路径改写规则</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4" />
          添加规则
        </Button>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#FFF5F6] to-white">
          <CardTitle className="text-xl">规则列表</CardTitle>
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
                  <TableHead className="font-semibold">入站路径</TableHead>
                  <TableHead className="font-semibold">出站路径</TableHead>
                  <TableHead className="font-semibold">匹配类型</TableHead>
                  <TableHead className="font-semibold">优先级</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="text-right font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes?.data?.map((route) => (
                  <TableRow key={route.id} className="hover:bg-[#FFF5F6] transition-colors border-[#F5DBDD]/20">
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-[#FFF5F6] px-3 py-1.5 rounded-lg border border-[#F5DBDD]/30">
                        {route.inbound_path}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-[#FFF5F6] px-3 py-1.5 rounded-lg border border-[#F5DBDD]/30">
                        {route.outbound_path}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#F5DBDD] text-[#EDC3CC]">
                        {matchTypeLabels[route.match_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF5F6] text-sm font-medium">
                        {route.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      {route.enabled ? (
                        <Badge className="gradient-pink text-white border-none">启用</Badge>
                      ) : (
                        <Badge variant="outline">禁用</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(route)}
                          className="hover:bg-[#F5DBDD]/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(route.id)}
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

      <RouteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        route={editingRoute}
      />
    </div>
  );
}
