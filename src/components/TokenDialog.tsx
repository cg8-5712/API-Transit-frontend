import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api, { type ApiToken } from '@/lib/api';

interface TokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: ApiToken | null;
}

interface FormData {
  label: string;
  expires_at?: string;
  rpm_limit?: number;
  tpm_limit?: number;
  enabled: boolean;
}

export default function TokenDialog({ open, onOpenChange, token }: TokenDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (token) {
      reset({
        label: token.label,
        expires_at: token.expires_at,
        rpm_limit: token.rpm_limit,
        tpm_limit: token.tpm_limit,
        enabled: token.enabled,
      });
    } else {
      reset({
        label: '',
        expires_at: undefined,
        rpm_limit: undefined,
        tpm_limit: undefined,
        enabled: true,
      });
    }
    setNewToken(null);
    setCopied(false);
  }, [token, reset, open]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (token) {
        return api.put(`/api-tokens/${token.id}`, data);
      }
      return api.post('/api-tokens', data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      if (!token && response.data?.raw_token) {
        setNewToken(response.data.raw_token);
      } else {
        onOpenChange(false);
      }
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const copyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-[#F5DBDD]/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
            {token ? '编辑 Token' : '创建 Token'}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-[#F5DBDD]/20 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {newToken ? (
          <div className="space-y-6">
            <div className="p-6 gradient-pink rounded-xl">
              <p className="text-sm font-medium mb-3 text-white/90">Token 已创建（仅显示一次）：</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white/90 p-3 rounded-lg break-all font-mono">
                  {newToken}
                </code>
                <Button
                  size="icon"
                  onClick={copyToken}
                  className="bg-white/20 hover:bg-white/30 text-white border-none shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && <p className="text-xs text-white/80 mt-2">已复制到剪贴板！</p>}
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full shadow-lg">
              关闭
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-2">标签</label>
              <Input
                {...register('label', { required: true })}
                placeholder="例如：生产环境 Bot"
                className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">过期时间（可选）</label>
              <Input
                {...register('expires_at')}
                type="datetime-local"
                className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">RPM 限制</label>
                <Input
                  {...register('rpm_limit', { valueAsNumber: true })}
                  type="number"
                  placeholder="无限制"
                  className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">TPM 限制</label>
                <Input
                  {...register('tpm_limit', { valueAsNumber: true })}
                  type="number"
                  placeholder="无限制"
                  className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#FFF5F6] rounded-lg">
              <input
                type="checkbox"
                {...register('enabled')}
                id="token-enabled"
                className="w-4 h-4 rounded border-[#F5DBDD] text-[#EDC3CC] focus:ring-[#EDC3CC]/20"
              />
              <label htmlFor="token-enabled" className="text-sm font-medium">启用此 Token</label>
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
        )}
      </div>
    </div>
  );
}
