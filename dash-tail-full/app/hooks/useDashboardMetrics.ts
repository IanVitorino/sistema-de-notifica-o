'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardMetrics {
  totalClientes: number;
  clientesAtivos: number;
  totalProdutos: number;
  produtosAtivos: number;
  totalFabricantes: number;
  fabricantesAtivos: number;
  totalPedidos: number;
  pedidosAtivos: number;
  totalVendedores: number;
  vendedoresAtivos: number;
  totalGruposProdutos: number;
  totalMarcasProdutos: number;
}

interface ProdutoGrupo {
  grupo: string;
  quantidade: number;
}

interface ProdutoMarca {
  marca: string;
  quantidade: number;
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch('/api/dashboard/metrics');

  if (!response.ok) {
    throw new Error('Erro ao buscar métricas do dashboard');
  }

  return response.json();
}

async function fetchProdutosPorGrupo(): Promise<ProdutoGrupo[]> {
  const response = await fetch('/api/dashboard/produtos-grupo');

  if (!response.ok) {
    throw new Error('Erro ao buscar produtos por grupo');
  }

  return response.json();
}

async function fetchProdutosPorMarca(): Promise<ProdutoMarca[]> {
  const response = await fetch('/api/dashboard/produtos-marca');

  if (!response.ok) {
    throw new Error('Erro ao buscar produtos por marca');
  }

  return response.json();
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000, // Revalida a cada 30 segundos
    staleTime: 15000, // Considera os dados válidos por 15 segundos
    retry: 3,
    retryDelay: 1000,
  });
}

export function useProdutosPorGrupo() {
  return useQuery({
    queryKey: ['produtos-grupo'],
    queryFn: fetchProdutosPorGrupo,
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useProdutosPorMarca() {
  return useQuery({
    queryKey: ['produtos-marca'],
    queryFn: fetchProdutosPorMarca,
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}
