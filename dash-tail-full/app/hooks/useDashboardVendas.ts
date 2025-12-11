'use client';

import { useQuery } from '@tanstack/react-query';

export interface DashboardVendasMetrics {
  totalVendas: number;
  totalPedidos: number;
  ticketMedio: number;
  clientesAtivos: number;
}

export interface VendaMensal {
  ano: number;
  mes: number;
  totalVendas: number;
  quantidadePedidos: number;
}

export interface VendaPorVendedor {
  id: number;
  vendedor: string;
  totalPedidos: number;
  totalVendas: number;
}

export interface TopCliente {
  id: number;
  cliente: string;
  cidade: string | null;
  totalPedidos: number;
  totalCompras: number;
}

export interface VendaPorFabricante {
  id: number;
  fabricante: string;
  totalPedidos: number;
  totalVendas: number;
}

export interface VendaPorRegiao {
  id: number;
  regiao: string;
  codigoRegiao: string | null;
  totalPedidos: number;
  totalVendas: number;
}

export interface ProdutoMaisVendido {
  id: number;
  codigo: string | null;
  descricao: string | null;
  totalQuantidade: number;
  totalValor: number;
}

export interface EvolucaoDiaria {
  data: string;
  totalPedidos: number;
  totalVendas: number;
}

// Funções de fetch
async function fetchVendasMetrics(dias: number): Promise<DashboardVendasMetrics> {
  const response = await fetch(`/api/dashboard/vendas/metrics?dias=${dias}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar métricas de vendas');
  }

  return response.json();
}

async function fetchVendasMensais(): Promise<VendaMensal[]> {
  const response = await fetch('/api/dashboard/vendas/mensais');

  if (!response.ok) {
    throw new Error('Erro ao buscar vendas mensais');
  }

  return response.json();
}

async function fetchVendasPorVendedor(dias: number, top: number): Promise<VendaPorVendedor[]> {
  const response = await fetch(`/api/dashboard/vendas/por-vendedor?dias=${dias}&top=${top}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vendas por vendedor');
  }

  return response.json();
}

async function fetchTopClientes(dias: number, top: number): Promise<TopCliente[]> {
  const response = await fetch(`/api/dashboard/vendas/top-clientes?dias=${dias}&top=${top}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar top clientes');
  }

  return response.json();
}

async function fetchVendasPorFabricante(dias: number, top: number): Promise<VendaPorFabricante[]> {
  const response = await fetch(`/api/dashboard/vendas/por-fabricante?dias=${dias}&top=${top}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vendas por fabricante');
  }

  return response.json();
}

async function fetchVendasPorRegiao(dias: number): Promise<VendaPorRegiao[]> {
  const response = await fetch(`/api/dashboard/vendas/por-regiao?dias=${dias}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar vendas por região');
  }

  return response.json();
}

async function fetchProdutosMaisVendidos(dias: number, top: number): Promise<ProdutoMaisVendido[]> {
  const response = await fetch(`/api/dashboard/vendas/produtos?dias=${dias}&top=${top}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar produtos mais vendidos');
  }

  return response.json();
}

async function fetchEvolucaoDiariaVendas(dias: number): Promise<EvolucaoDiaria[]> {
  const response = await fetch(`/api/dashboard/vendas/evolucao-diaria?dias=${dias}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar evolução diária');
  }

  return response.json();
}

// Hooks
export function useVendasMetrics(dias: number = 30) {
  return useQuery({
    queryKey: ['vendas-metrics', dias],
    queryFn: () => fetchVendasMetrics(dias),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useVendasMensais() {
  return useQuery({
    queryKey: ['vendas-mensais'],
    queryFn: fetchVendasMensais,
    refetchInterval: 60000, // 1 minuto
    staleTime: 30000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useVendasPorVendedor(dias: number = 30, top: number = 10) {
  return useQuery({
    queryKey: ['vendas-por-vendedor', dias, top],
    queryFn: () => fetchVendasPorVendedor(dias, top),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useTopClientes(dias: number = 30, top: number = 10) {
  return useQuery({
    queryKey: ['top-clientes', dias, top],
    queryFn: () => fetchTopClientes(dias, top),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useVendasPorFabricante(dias: number = 30, top: number = 10) {
  return useQuery({
    queryKey: ['vendas-por-fabricante', dias, top],
    queryFn: () => fetchVendasPorFabricante(dias, top),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useVendasPorRegiao(dias: number = 30) {
  return useQuery({
    queryKey: ['vendas-por-regiao', dias],
    queryFn: () => fetchVendasPorRegiao(dias),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useProdutosMaisVendidos(dias: number = 30, top: number = 20) {
  return useQuery({
    queryKey: ['produtos-mais-vendidos', dias, top],
    queryFn: () => fetchProdutosMaisVendidos(dias, top),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useEvolucaoDiariaVendas(dias: number = 30) {
  return useQuery({
    queryKey: ['evolucao-diaria-vendas', dias],
    queryFn: () => fetchEvolucaoDiariaVendas(dias),
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    retryDelay: 1000,
  });
}
