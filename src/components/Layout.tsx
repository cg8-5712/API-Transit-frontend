import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, Key, Route, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/upstreams', icon: Server, label: '上游管理' },
    { path: '/tokens', icon: Key, label: 'Token 管理' },
    { path: '/routes', icon: Route, label: '路由规则' },
    { path: '/statistics', icon: BarChart3, label: '统计分析' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F6] via-white to-[#F5DBDD]/30">
      <nav className="border-b border-[#F5DBDD]/30 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-pink shadow-lg flex items-center justify-center">
                <div className="w-6 h-6 rounded-lg bg-white/40" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
                  API Transit
                </span>
                <p className="text-xs text-muted-foreground">轻量级 API 网关</p>
              </div>
            </div>
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'gradient-pink text-white shadow-md scale-105'
                        : 'hover:bg-[#F5DBDD]/10 text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-10">{children}</main>
      <footer className="border-t border-[#F5DBDD]/30 bg-white/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 API Transit. 专为树莓派优化的 API 网关服务
          </p>
        </div>
      </footer>
    </div>
  );
}
