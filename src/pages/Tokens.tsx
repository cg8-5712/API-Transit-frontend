import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';
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
import api, { type ApiResponse, type ApiToken } from '@/lib/api';
import TokenDialog from '@/components/TokenDialog';

export default function Tokens() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<ApiToken | null>(null);
  const queryClient = useQueryClient();

  const { data: tokens, isLoading } = useQuery<ApiResponse<ApiToken[]>>({
    queryKey: ['tokens'],
    queryFn: () => api.get('/api-tokens'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api-tokens/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });

  const handleEdit = (token: ApiToken) => {
    setEditingToken(token);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingToken(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除此 Token 吗？')) {
      deleteMutation.mutate(id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
            Token 管理
          </h1>
          <p className="text-muted-foreground mt-2">管理 API 访问令牌</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
          <Plus className="h-4 w-4" />
          创建 Token
        </Button>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#FFF5F6] to-white">
          <CardTitle className="text-xl">Token 列表</CardTitle>
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
                  <TableHead className="font-semibold">标签</TableHead>
                  <TableHead className="font-semibold">Token Hash</TableHead>
                  <TableHead className="font-semibold">RPM 限制</TableHead>
                  <TableHead className="font-semibold">TPM 限制</TableHead>
                  <TableHead className="font-semibold">过期时间</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="text-right font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens?.data?.map((token) => (
                  <TableRow key={token.id} className="hover:bg-[#FFF5F6] transition-colors border-[#F5DBDD]/20">
                    <TableCell className="font-medium">{token.label}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-[#FFF5F6] px-2 py-1 rounded">
                          {token.token_hash ? token.token_hash.slice(0, 16) + '...' : 'N/A'}
                        </code>
                        {token.token_hash && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-[#F5DBDD]/20"
                            onClick={() => copyToClipboard(token.token_hash)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{token.rpm_limit || '无限制'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{token.tpm_limit || '无限制'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {token.expires_at
                          ? format(new Date(token.expires_at), 'yyyy-MM-dd HH:mm')
                          : '永不过期'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {token.enabled ? (
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
                          onClick={() => handleEdit(token)}
                          className="hover:bg-[#F5DBDD]/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(token.id)}
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

      <TokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        token={editingToken}
      />
    </div>
  );
}
