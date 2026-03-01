import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api, { type Upstream } from '@/lib/api';

interface UpstreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upstream: Upstream | null;
}

interface FormData {
  name: string;
  base_url: string;
  api_key?: string;
  timeout_secs: number;
  weight: number;
  priority: number;
  lb_strategy: 'round_robin' | 'weighted' | 'failover';
  enabled: boolean;
}

export default function UpstreamDialog({ open, onOpenChange, upstream }: UpstreamDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    if (upstream) {
      reset(upstream);
    } else {
      reset({
        name: '',
        base_url: '',
        api_key: '',
        timeout_secs: 30,
        weight: 1,
        priority: 0,
        lb_strategy: 'round_robin',
        enabled: true,
      });
    }
  }, [upstream, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (upstream) {
        return api.put(`/upstreams/${upstream.id}`, data);
      }
      return api.post('/upstreams', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upstreams'] });
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
            {upstream ? '编辑上游' : '添加上游'}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">名称</label>
            <Input {...register('name', { required: true })} />
          </div>

          <div>
            <label className="text-sm font-medium">Base URL</label>
            <Input {...register('base_url', { required: true })} placeholder="https://api.example.com" />
          </div>

          <div>
            <label className="text-sm font-medium">API Key（可选）</label>
            <Input {...register('api_key')} type="password" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">超时（秒）</label>
              <Input {...register('timeout_secs', { valueAsNumber: true })} type="number" />
            </div>
            <div>
              <label className="text-sm font-medium">权重</label>
              <Input {...register('weight', { valueAsNumber: true })} type="number" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">优先级</label>
              <Input {...register('priority', { valueAsNumber: true })} type="number" />
            </div>
            <div>
              <label className="text-sm font-medium">负载策略</label>
              <select {...register('lb_strategy')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="round_robin">轮询</option>
                <option value="weighted">权重</option>
                <option value="failover">故障转移</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('enabled')} id="enabled" />
            <label htmlFor="enabled" className="text-sm font-medium">启用</label>
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
