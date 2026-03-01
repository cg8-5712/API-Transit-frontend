import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upstreams from './pages/Upstreams';
import Tokens from './pages/Tokens';
import RoutesPage from './pages/Routes';
import Statistics from './pages/Statistics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upstreams" element={<Upstreams />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
