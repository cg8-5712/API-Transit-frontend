import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api, { type RouteRule, type ApiResponse, type Upstream } from '@/lib/api';

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
  upstream_ids: string;
  priority: number;
  enabled: boolean;
}

export default function RouteDialog({ open, onOpenChange, route }: RouteDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();
  const [selectedUpstreams, setSelectedUpstreams] = useState<number[]>([]);

  // Fetch upstreams for the dropdown
  const { data: upstreams } = useQuery<ApiResponse<Upstream[]>>({
    queryKey: ['upstreams'],
    queryFn: () => api.get('/upstreams'),
    enabled: open,
  });

  useEffect(() => {
    if (route) {
      reset({
        name: route.name,
        inbound_path: route.inbound_path,
        outbound_path: route.outbound_path,
        match_type: route.match_type,
        upstream_ids: route.upstream_ids || '',
        priority: route.priority,
        enabled: route.enabled,
      });
      // Parse selected upstreams
      if (route.upstream_ids) {
        const ids = route.upstream_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        setSelectedUpstreams(ids);
      } else {
        setSelectedUpstreams([]);
      }
    } else {
      reset({
        name: '',
        inbound_path: '',
        outbound_path: '',
        match_type: 'prefix',
        upstream_ids: '',
        priority: 0,
        enabled: true,
      });
      setSelectedUpstreams([]);
    }
  }, [route, reset, open]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        upstream_ids: data.upstream_ids || undefined,
      };
      if (route) {
        return api.put(`/route-rules/${route.id}`, payload);
      }
      return api.post('/route-rules', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      onOpenChange(false);
    },
  });

  const handleUpstreamToggle = (upstreamId: number) => {
    const newSelected = selectedUpstreams.includes(upstreamId)
      ? selectedUpstreams.filter(id => id !== upstreamId)
      : [...selectedUpstreams, upstreamId];

    setSelectedUpstreams(newSelected);
    setValue('upstream_ids', newSelected.join(','));
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 border border-[#F5DBDD]/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
            {route ? '编辑路由规则' : '添加路由规则'}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-[#F5DBDD]/20 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium block mb-2">规则名称</label>
            <Input
              {...register('name', { required: true })}
              className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">入站路径</label>
            <Input
              {...register('inbound_path', { required: true })}
              placeholder="/api/v1/whisper/infer"
              className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">出站路径</label>
            <Input
              {...register('outbound_path', { required: true })}
              placeholder="/api/inference"
              className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">匹配类型</label>
              <select
                {...register('match_type')}
                className="flex h-9 w-full rounded-md border border-[#F5DBDD]/50 bg-transparent px-3 py-1 text-sm focus:border-[#EDC3CC] focus:ring-1 focus:ring-[#EDC3CC]/20 focus:outline-none"
              >
                <option value="exact">精确匹配</option>
                <option value="prefix">前缀匹配</option>
                <option value="regex">正则匹配</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">优先级</label>
              <Input
                {...register('priority', { valueAsNumber: true })}
                type="number"
                className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">指定上游（可多选）</label>
            <input type="hidden" {...register('upstream_ids')} />
            <div className="border border-[#F5DBDD]/50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-[#FFF5F6]/30">
              <label className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedUpstreams.length === 0}
                  onChange={() => {
                    setSelectedUpstreams([]);
                    setValue('upstream_ids', '');
                  }}
                  className="w-4 h-4 rounded border-[#F5DBDD] text-[#EDC3CC] focus:ring-[#EDC3CC]/20"
                />
                <span className="text-sm font-medium">使用所有可用上游（负载均衡）</span>
              </label>
              <div className="border-t border-[#F5DBDD]/30 my-2"></div>
              {upstreams?.data?.map((upstream) => (
                <label
                  key={upstream.id}
                  className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUpstreams.includes(upstream.id)}
                    onChange={() => handleUpstreamToggle(upstream.id)}
                    className="w-4 h-4 rounded border-[#F5DBDD] text-[#EDC3CC] focus:ring-[#EDC3CC]/20"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{upstream.name}</div>
                    <div className="text-xs text-muted-foreground">{upstream.base_url}</div>
                  </div>
                  {!upstream.is_healthy && (
                    <span className="text-xs text-red-600">不健康</span>
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedUpstreams.length === 0
                ? '将在所有启用且健康的上游之间负载均衡'
                : `已选择 ${selectedUpstreams.length} 个上游进行负载均衡`}
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FFF5F6] rounded-lg">
            <input
              type="checkbox"
              {...register('enabled')}
              id="route-enabled"
              className="w-4 h-4 rounded border-[#F5DBDD] text-[#EDC3CC] focus:ring-[#EDC3CC]/20"
            />
            <label htmlFor="route-enabled" className="text-sm font-medium">启用此规则</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#F5DBDD]/50 hover:bg-[#FFF5F6]"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="shadow-lg"
            >
              {mutation.isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
