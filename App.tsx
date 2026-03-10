import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/AdminLogin';
import DashboardPage from './pages/Dashboard';
import FeedbacksPage from './pages/Feedbacks';
import FuncionariosPage from './pages/Funcionarios';
import CatalogoPage from './pages/Catalogo';
import EscalaPage from './pages/Escala';
import FichaTecnicaPage from './pages/FichaTecnica';
import CurriculosPage from './pages/Curriculos';
import TrabalheConoscoPage from './pages/TrabalheConosco';
import PublicFormFuncionario from './pages/PublicFormFuncionario';
import AdminLayout from './components/AdminLayout';
import PublicLayout from './components/PublicLayout';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CartSidebar from './components/CartSidebar';
import ScrollToTop from './components/ScrollToTop';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/produtos" element={<ProductsPage />} />
                <Route path="/quemsomos" element={<AboutPage />} />
                <Route path="/curriculo" element={<TrabalheConoscoPage />} />
              </Route>

              {/* Standalone routes - sem Header/Footer */}
              <Route path="/form-funcionario" element={<PublicFormFuncionario />} />

              {/* Login Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="produtos" element={<CatalogoPage />} />
                <Route path="feedbacks" element={<FeedbacksPage />} />
                <Route path="funcionarios" element={<FuncionariosPage />} />
                <Route path="escala" element={<EscalaPage />} />
                <Route path="fichatecnica" element={<FichaTecnicaPage />} />
                <Route path="curriculos" element={<CurriculosPage />} />
              </Route>
            </Routes>
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

