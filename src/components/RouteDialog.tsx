import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api, { type RouteRule } from '@/lib/api';

interface RouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: RouteRule | null;
}

interface FormData {
  name: string;
  inbound_path: string;
  outbound_path: string;
  match_type: 'exact' | 'prefix' | 'regex';
  upstream_id?: number;
  priority: number;
  enabled: boolean;
}

export default function RouteDialog({ open, onOpenChange, route }: RouteDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (route) {
      reset(route);
    } else {
      reset({
        name: '',
        inbound_path: '',
        outbound_path: '',
        match_type: 'prefix',
        upstream_id: undefined,
        priority: 0,
        enabled: true,
      });
    }
  }, [route, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (route) {
        return api.put(`/route-rules/${route.id}`, data);
      }
      return api.post('/route-rules', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {route ? '编辑路由规则' : '添加路由规则'}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">规则名称</label>
            <Input {...register('name', { required: true })} />
          </div>

          <div>
            <label className="text-sm font-medium">入站路径</label>
            <Input {...register('inbound_path', { required: true })} placeholder="/api/v1/chat" />
          </div>

          <div>
            <label className="text-sm font-medium">出站路径</label>
            <Input {...register('outbound_path', { required: true })} placeholder="/v1/chat/completions" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">匹配类型</label>
              <select {...register('match_type')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="exact">精确匹配</option>
                <option value="prefix">前缀匹配</option>
                <option value="regex">正则匹配</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">优先级</label>
              <Input {...register('priority', { valueAsNumber: true })} type="number" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">上游 ID（可选）</label>
            <Input {...register('upstream_id', { valueAsNumber: true })} type="number" placeholder="留空则使用负载均衡" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('enabled')} id="route-enabled" />
            <label htmlFor="route-enabled" className="text-sm font-medium">启用</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
