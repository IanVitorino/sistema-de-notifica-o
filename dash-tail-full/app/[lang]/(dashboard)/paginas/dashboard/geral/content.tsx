'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useDashboardMetrics, useProdutosPorGrupo, useProdutosPorMarca } from '@/app/hooks/useDashboardMetrics';
import { Loader2, Package, Users, Building2, ShoppingCart, UserCheck, Layers, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import { TopSelector } from './components/TopSelector';

export function DashGeralContent() {
    const [topGrupos, setTopGrupos] = useState(5);
    const [topMarcas, setTopMarcas] = useState(5);

    const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
    const { data: grupoData, isLoading: grupoLoading, error: grupoError } = useProdutosPorGrupo();
    const { data: marcaData, isLoading: marcaLoading, error: marcaError } = useProdutosPorMarca();

    // Filtrar dados com base no top selecionado
    const filteredGrupoData = useMemo(() => {
        if (!grupoData) return [];
        return topGrupos === 999 ? grupoData : grupoData.slice(0, topGrupos);
    }, [grupoData, topGrupos]);

    const filteredMarcaData = useMemo(() => {
        if (!marcaData) return [];
        return topMarcas === 999 ? marcaData : marcaData.slice(0, topMarcas);
    }, [marcaData, topMarcas]);

    // Calcular percentuais para o gráfico de grupos
    const totalProdutosGrupo = filteredGrupoData.reduce((total, item) => total + item.quantidade, 0);
    const chartDataGrupo = filteredGrupoData.map(item => ({
        name: item.grupo.length > 20 ? item.grupo.substring(0, 17) + '...' : item.grupo,
        fullName: item.grupo,
        valor: item.quantidade,
        percentual: totalProdutosGrupo > 0 ? ((item.quantidade / totalProdutosGrupo) * 100).toFixed(1) : '0'
    }));

    // Preparar dados do gráfico de marcas
    const chartDataMarca = filteredMarcaData.map(item => ({
        name: item.marca.length > 20 ? item.marca.substring(0, 17) + '...' : item.marca,
        fullName: item.marca,
        valor: item.quantidade
    }));

    // Cores para os gráficos
    const coresGrupo = [
        '#3B82F6', '#059669', '#EA580C', '#7C3AED', '#DC2626',
        '#2563EB', '#16A34A', '#D97706', '#9333EA', '#EF4444',
        '#1D4ED8', '#15803D', '#C2410C', '#7E22CE', '#B91C1C',
        '#1E40AF', '#166534', '#92400E', '#6B21A8', '#991B1B'
    ];

    const coresMarca = [
        '#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899',
        '#0891B2', '#7C3AED', '#D97706', '#059669', '#DB2777',
        '#0E7490', '#6D28D9', '#B45309', '#047857', '#BE185D',
        '#155E75', '#5B21B6', '#92400E', '#065F46', '#9F1239'
    ];

    if (metricsLoading || grupoLoading || marcaLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-default-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando métricas...</span>
                </div>
            </div>
        );
    }

    if (metricsError || grupoError || marcaError) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="font-semibold text-red-600 dark:text-red-400">Erro ao carregar métricas</p>
                    <p className="text-sm text-default-600 mt-1">Tente recarregar a página</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header com logo */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-40 h-10">
                        <Image
                            src="/media/images/logo.png"
                            alt="Logo"
                            width={160}
                            height={40}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>
                    <div className="h-8 w-px bg-default-300 dark:bg-default-700" />
                    <div>
                        <h1 className="text-2xl font-semibold text-default-900 dark:text-default-200">
                            Dashboard Geral
                        </h1>
                        <p className="text-sm text-default-600 dark:text-default-400">
                            Visão geral do sistema Tremonte
                        </p>
                    </div>
                </div>
            </div>

            {/* KPIs Principais - Grid 4 colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total de Clientes"
                    value={metrics?.totalClientes ?? 0}
                    subtitle={`${metrics?.clientesAtivos ?? 0} ativos`}
                    icon={Users}
                    variant="green"
                />
                <KpiCard
                    title="Total de Produtos"
                    value={metrics?.totalProdutos ?? 0}
                    subtitle={`${metrics?.produtosAtivos ?? 0} disponíveis`}
                    icon={Package}
                    variant="orange"
                />
                <KpiCard
                    title="Fabricantes"
                    value={metrics?.totalFabricantes ?? 0}
                    subtitle={`${metrics?.fabricantesAtivos ?? 0} ativos`}
                    icon={Building2}
                    variant="blue"
                />
                <KpiCard
                    title="Pedidos"
                    value={metrics?.totalPedidos ?? 0}
                    subtitle={`${metrics?.pedidosAtivos ?? 0} em andamento`}
                    icon={ShoppingCart}
                    variant="purple"
                />
            </div>

            {/* KPIs Secundários - Grid 3 colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                    title="Vendedores"
                    value={metrics?.totalVendedores ?? 0}
                    subtitle={`${metrics?.vendedoresAtivos ?? 0} ativos`}
                    icon={UserCheck}
                    variant="indigo"
                />
                <KpiCard
                    title="Grupos de Produtos"
                    value={metrics?.totalGruposProdutos ?? 0}
                    icon={Layers}
                    variant="cyan"
                />
                <KpiCard
                    title="Marcas de Produtos"
                    value={metrics?.totalMarcasProdutos ?? 0}
                    icon={Tag}
                    variant="teal"
                />
            </div>

            {/* Gráficos - Grid 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Produtos por Grupo */}
                <ChartCard
                    title="Produtos por Grupo"
                    description={`Distribuição dos ${filteredGrupoData.length} principais grupos de produtos`}
                    actions={
                        <TopSelector value={topGrupos} onChange={setTopGrupos} />
                    }
                >
                    {chartDataGrupo.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartDataGrupo}
                                    margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        interval={0}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                    />
                                    <Tooltip
                                        formatter={(value: any, name: any, props: any) => [value, 'Quantidade']}
                                        labelFormatter={(label: any, payload: any) => {
                                            if (payload && payload[0]) {
                                                return `Grupo: ${payload[0].payload.fullName}`;
                                            }
                                            return `Grupo: ${label}`;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                        {chartDataGrupo.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={coresGrupo[index % coresGrupo.length]} />
                                        ))}
                                        <LabelList
                                            dataKey="percentual"
                                            position="top"
                                            formatter={(value: any) => `${value}%`}
                                            style={{ fill: 'currentColor', fontSize: '11px', fontWeight: 'bold' }}
                                            className="text-default-700 dark:text-default-300"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum dado de grupo encontrado</p>
                        </div>
                    )}
                </ChartCard>

                {/* Gráfico de Produtos por Marca */}
                <ChartCard
                    title="Produtos por Marca"
                    description={`Distribuição das ${filteredMarcaData.length} principais marcas de produtos`}
                    actions={
                        <TopSelector value={topMarcas} onChange={setTopMarcas} />
                    }
                >
                    {chartDataMarca.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartDataMarca}
                                    margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        interval={0}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                    />
                                    <Tooltip
                                        formatter={(value: any, name: any, props: any) => [value, 'Quantidade']}
                                        labelFormatter={(label: any, payload: any) => {
                                            if (payload && payload[0]) {
                                                return `Marca: ${payload[0].payload.fullName}`;
                                            }
                                            return `Marca: ${label}`;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                        {chartDataMarca.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={coresMarca[index % coresMarca.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum dado de marca encontrado</p>
                        </div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}
