'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Loader2, DollarSign, ShoppingCart, TrendingUp, Users, BarChart3, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, LineChart, Line, AreaChart, Area, PieChart, Pie, Legend } from 'recharts';
import {
    useVendasMetrics,
    useVendasMensais,
    useVendasPorVendedor,
    useTopClientes,
    useVendasPorFabricante,
    useVendasPorRegiao,
    useProdutosMaisVendidos,
    useEvolucaoDiariaVendas
} from '@/app/hooks/useDashboardVendas';
import { KpiCard } from '../geral/components/KpiCard';
import { ChartCard } from '../geral/components/ChartCard';
import { TopSelector } from '../geral/components/TopSelector';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Meses em português
const mesesPtBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Cores para gráficos
const coresVendedor = ['#3B82F6', '#059669', '#EA580C', '#7C3AED', '#DC2626', '#2563EB', '#16A34A', '#D97706', '#9333EA', '#EF4444', '#1D4ED8', '#15803D', '#C2410C', '#7E22CE', '#B91C1C', '#1E40AF', '#166534', '#92400E', '#6B21A8', '#991B1B'];

const coresCliente = ['#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#0891B2', '#7C3AED', '#D97706', '#059669', '#DB2777', '#0E7490', '#6D28D9', '#B45309', '#047857', '#BE185D', '#155E75', '#5B21B6', '#92400E', '#065F46', '#9F1239'];

const coresFabricante = ['#22C55E', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export function DashVendasContent() {
    const [periodo, setPeriodo] = useState(30);
    const [topVendedores, setTopVendedores] = useState(5);
    const [topClientes, setTopClientes] = useState(5);
    const [topFabricantes, setTopFabricantes] = useState(5);
    const [topProdutos, setTopProdutos] = useState(10);

    // Buscar dados
    const { data: metrics, isLoading: metricsLoading, error: metricsError } = useVendasMetrics(periodo);
    const { data: vendasMensais, isLoading: mensaisLoading } = useVendasMensais();
    const { data: vendasVendedor, isLoading: vendedorLoading } = useVendasPorVendedor(periodo, topVendedores);
    const { data: clientes, isLoading: clientesLoading } = useTopClientes(periodo, topClientes);
    const { data: fabricantes, isLoading: fabricantesLoading } = useVendasPorFabricante(periodo, topFabricantes);
    const { data: regioes, isLoading: regioesLoading } = useVendasPorRegiao(periodo);
    const { data: produtos, isLoading: produtosLoading } = useProdutosMaisVendidos(periodo, topProdutos);
    const { data: evolucaoDiaria, isLoading: evolucaoLoading } = useEvolucaoDiariaVendas(periodo);

    // Processar dados de vendas mensais
    const chartDataMensais = useMemo(() => {
        if (!vendasMensais) return [];
        return vendasMensais.map(v => ({
            mesAno: `${mesesPtBR[v.mes - 1]}/${v.ano.toString().slice(2)}`,
            valor: v.totalVendas,
            pedidos: v.quantidadePedidos
        }));
    }, [vendasMensais]);

    // Processar dados de vendedores
    const chartDataVendedores = useMemo(() => {
        if (!vendasVendedor) return [];
        return vendasVendedor.map(v => ({
            nome: v.vendedor.length > 20 ? v.vendedor.substring(0, 17) + '...' : v.vendedor,
            nomeCompleto: v.vendedor,
            valor: v.totalVendas
        }));
    }, [vendasVendedor]);

    // Processar dados de clientes
    const chartDataClientes = useMemo(() => {
        if (!clientes) return [];
        return clientes.map(c => ({
            nome: c.cliente.length > 20 ? c.cliente.substring(0, 17) + '...' : c.cliente,
            nomeCompleto: c.cliente,
            valor: c.totalCompras
        }));
    }, [clientes]);

    // Processar dados de fabricantes
    const chartDataFabricantes = useMemo(() => {
        if (!fabricantes) return [];
        const total = fabricantes.reduce((sum, f) => sum + f.totalVendas, 0);
        return fabricantes.map((f, index) => ({
            name: f.fabricante,
            value: f.totalVendas,
            percentual: total > 0 ? ((f.totalVendas / total) * 100).toFixed(1) : '0',
            fill: coresFabricante[index % coresFabricante.length]
        }));
    }, [fabricantes]);

    // Processar dados de regiões
    const chartDataRegioes = useMemo(() => {
        if (!regioes) return [];
        return regioes.map(r => ({
            nome: r.regiao && r.regiao.length > 25 ? r.regiao.substring(0, 22) + '...' : r.regiao || 'Sem região',
            nomeCompleto: r.regiao || 'Sem região',
            valor: r.totalVendas
        }));
    }, [regioes]);

    // Processar dados de produtos
    const chartDataProdutos = useMemo(() => {
        if (!produtos) return [];
        return produtos.map(p => ({
            nome: p.descricao && p.descricao.length > 20 ? p.descricao.substring(0, 17) + '...' : p.descricao || p.codigo || 'Sem nome',
            nomeCompleto: p.descricao || p.codigo || 'Sem nome',
            quantidade: p.totalQuantidade
        }));
    }, [produtos]);

    // Processar evolução diária
    const chartDataEvolucao = useMemo(() => {
        if (!evolucaoDiaria) return [];
        return evolucaoDiaria.map(e => ({
            data: new Date(e.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            valor: e.totalVendas
        }));
    }, [evolucaoDiaria]);

    if (metricsLoading || mensaisLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-default-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando dashboard de vendas...</span>
                </div>
            </div>
        );
    }

    if (metricsError) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="font-semibold text-red-600 dark:text-red-400">Erro ao carregar vendas</p>
                    <p className="text-sm text-default-600 mt-1">Tente recarregar a página</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header com logo e filtro */}
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
                            Dashboard de Vendas
                        </h1>
                        <p className="text-sm text-default-600 dark:text-default-400">
                            Análise completa de vendas da plataforma
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-default-600 dark:text-default-400">Período:</span>
                    <Select value={periodo.toString()} onValueChange={(val) => setPeriodo(Number(val))}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Últimos 7 dias</SelectItem>
                            <SelectItem value="30">Últimos 30 dias</SelectItem>
                            <SelectItem value="90">Últimos 3 meses</SelectItem>
                            <SelectItem value="180">Últimos 6 meses</SelectItem>
                            <SelectItem value="365">Último ano</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total de Vendas"
                    value={`R$ ${(metrics?.totalVendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    variant="green"
                />
                <KpiCard
                    title="Quantidade de Pedidos"
                    value={metrics?.totalPedidos || 0}
                    icon={ShoppingCart}
                    variant="blue"
                />
                <KpiCard
                    title="Ticket Médio"
                    value={`R$ ${(metrics?.ticketMedio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    variant="purple"
                />
                <KpiCard
                    title="Clientes Ativos"
                    value={metrics?.clientesAtivos || 0}
                    icon={Users}
                    variant="orange"
                />
            </div>

            {/* Vendas Mensais */}
            <ChartCard
                title="Vendas Mensais"
                description="Evolução das vendas nos últimos 12 meses"
            >
                {chartDataMensais.length > 0 ? (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartDataMensais} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                <XAxis
                                    dataKey="mesAno"
                                    tick={{ fontSize: 12, fill: 'currentColor' }}
                                    className="text-default-600 dark:text-default-400"
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: 'currentColor' }}
                                    className="text-default-600 dark:text-default-400"
                                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px'
                                    }}
                                />
                                <Area type="monotone" dataKey="valor" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValor)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-80 text-default-500">
                        <p>Nenhuma venda encontrada</p>
                    </div>
                )}
            </ChartCard>

            {/* Vendas por Vendedor e Top Clientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Vendas por Vendedor"
                    description={`Top ${topVendedores === 999 ? 'todos' : topVendedores} vendedores`}
                    actions={<TopSelector value={topVendedores} onChange={setTopVendedores} />}
                >
                    {chartDataVendedores.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartDataVendedores} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="nome"
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value: any, name: any, props: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                                        labelFormatter={(label: any, payload: any) => {
                                            if (payload && payload[0]) {
                                                return payload[0].payload.nomeCompleto;
                                            }
                                            return label;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                                        {chartDataVendedores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={coresVendedor[index % coresVendedor.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum vendedor encontrado</p>
                        </div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Clientes que Mais Compram"
                    description={`Top ${topClientes === 999 ? 'todos' : topClientes} clientes`}
                    actions={<TopSelector value={topClientes} onChange={setTopClientes} />}
                >
                    {chartDataClientes.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartDataClientes} layout="vertical" margin={{ top: 10, right: 10, left: 80, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="nome"
                                        tick={{ fontSize: 11, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Compras']}
                                        labelFormatter={(label: any, payload: any) => {
                                            if (payload && payload[0]) {
                                                return payload[0].payload.nomeCompleto;
                                            }
                                            return label;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                                        {chartDataClientes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={coresCliente[index % coresCliente.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum cliente encontrado</p>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Vendas por Fabricante e Região */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Vendas por Fabricante"
                    description={`Top ${topFabricantes === 999 ? 'todos' : topFabricantes} fabricantes`}
                    actions={<TopSelector value={topFabricantes} onChange={setTopFabricantes} />}
                >
                    {chartDataFabricantes.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartDataFabricantes}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.percentual}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartDataFabricantes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '11px' }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum fabricante encontrado</p>
                        </div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Vendas por Região"
                    description="Distribuição de vendas por região"
                >
                    {chartDataRegioes.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartDataRegioes} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        dataKey="nome"
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
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                                        labelFormatter={(label: any, payload: any) => {
                                            if (payload && payload[0]) {
                                                return payload[0].payload.nomeCompleto;
                                            }
                                            return label;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Bar dataKey="valor" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhuma região encontrada</p>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Produtos Mais Vendidos e Evolução Diária */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Produtos Mais Vendidos"
                    description={`Top ${topProdutos === 999 ? 'todos' : topProdutos} produtos por quantidade`}
                    actions={<TopSelector value={topProdutos} onChange={setTopProdutos} options={[10, 20, 50]} />}
                >
                    {chartDataProdutos.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartDataProdutos} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        dataKey="nome"
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
                                        formatter={(value: any) => [value, 'Quantidade']}
                                        labelFormatter={(label: any, payload: any) => {
                                            if (payload && payload[0]) {
                                                return payload[0].payload.nomeCompleto;
                                            }
                                            return label;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Bar dataKey="quantidade" fill="#059669" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum produto encontrado</p>
                        </div>
                    )}
                </ChartCard>

                <ChartCard
                    title="Evolução Diária de Vendas"
                    description={`Últimos ${periodo} dias`}
                >
                    {chartDataEvolucao.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartDataEvolucao} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-default-200 dark:stroke-default-700" />
                                    <XAxis
                                        dataKey="data"
                                        tick={{ fontSize: 10, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        interval={Math.floor(chartDataEvolucao.length / 10)}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: 'currentColor' }}
                                        className="text-default-600 dark:text-default-400"
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']}
                                        contentStyle={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="valor" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-80 text-default-500">
                            <p>Nenhum dado encontrado</p>
                        </div>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}
