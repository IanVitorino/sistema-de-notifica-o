
import {
  Application,
  Chart,
  Components,
  DashBoard,
  Stacks2,
  Map,
  Grid,
  Files,
  Graph,
  ClipBoard,
  Cart,
  Envelope,
  Messages,
  Monitor,
  ListFill,
  Calendar,
  Flag,
  Book,
  Note,
  ClipBoard2,
  Note2,
  Note3,
  BarLeft,
  BarTop,
  ChartBar,
  PretentionChartLine,
  PretentionChartLine2,
  Google,
  Pointer,
  Map2,
  MenuBar,
  Icons,
  ChartArea,
  Building,
  Building2,
  Sheild,
  Error,
  Diamond,
  Heroicon,
  LucideIcon,
  CustomIcon,
  Mail,
  Users,
  Bell,
} from "@/components/svg";


export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu? : MenuItemProps[]
  nested?: MenuItemProps[]
  onClick: () => void;

  
}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      child: [
        {
          title: "Analytics",
          href: "/dashboard",
          icon: Graph,
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        child: [
          {
            title: "Analytics",
            href: "/dashboard",
            icon: Graph,
          },
          {
            title: "Dashboard Geral",
            href: "/paginas/dashboard/geral",
            icon: ChartArea,
          },
          {
            title: "Vendas",
            href: "/paginas/dashboard/vendas",
            icon: ChartBar,
          },
        ],
      },
      {
        title: "Lembretes",
        icon: Bell,
        href: "/lembretes",
      },
      {
        title: "Cadastros",
        icon: Building2,
        child: [
          {
            title: "Clientes",
            icon: Building,
            href: "/paginas/cadastros/cliente",
          },
          {
            title: "Produtos",
            icon: Stacks2,
            href: "/paginas/parametros/produto",
          },
          {
            title: "Lista de Preços",
            icon: ListFill,
            href: "/paginas/parametros/listas",
          },
          {
            title: "Transportadoras",
            icon: Building2,
            href: "/paginas/parametros/transportadora",
          },
          {
            title: "Dados de Base",
            icon: Components,
            nested: [
              {
                title: "Grupos de Clientes",
                href: "/paginas/cadastros/grupo-clientes",
              },
              {
                title: "Grupo de Produtos",
                href: "/paginas/cadastros/grupo-produtos",
              },
              {
                title: "Marcas de Produtos",
                href: "/paginas/cadastros/marca-produto",
              },
              {
                title: "Região & Zona",
                href: "/paginas/cadastros/regiao-zona",
              },
              {
                title: "Estados",
                href: "/paginas/cadastros/estados",
              },
              {
                title: "Critérios de Pagamento",
                href: "/paginas/cadastros/criterio-pagamento",
              },
              {
                title: "Bloqueio de Produto",
                href: "/paginas/cadastros/bloqueio-produto",
              },
              {
                title: "Unidade de Medida",
                href: "/paginas/cadastros/unidade-medida",
              },
            ],
          },
        ],
      },
      {
        title: "Vendedores",
        icon: Users,
        href: "/paginas/cadastros/vendedor",
      },
      {
        title: "Fabricantes",
        icon: Building2,
        href: "/paginas/cadastros/fabricante",
      },
      {
        title: "Condição de Pagamento",
        icon: ClipBoard,
        href: "/paginas/cadastros/condicao-pagamento",
      },
      {
        title: "Relatórios",
        icon: ChartBar,
        child: [
          {
            title: "Ficha do Cliente",
            icon: Building,
            href: "/paginas/relatorios/ficha-cliente",
          },
          {
            title: "Ficha do Fabricante",
            icon: Building2,
            href: "/paginas/relatorios/ficha-fabricante",
          },
          {
            title: "Ficha do Produto",
            icon: ClipBoard,
            href: "/paginas/relatorios/ficha-produto",
          },
          {
            title: "Lista de Preços de Produto",
            icon: ListFill,
            href: "/paginas/relatorios/lista-precos-produto",
          },
          {
            title: "Carteira de Clientes por Fabricante",
            icon: Building,
            href: "/paginas/relatorios/carteira-clientes-fabricante",
          },
          {
            title: "Carteira de Clientes",
            icon: Building,
            href: "/paginas/relatorios/carteira-clientes-vendedor",
          },
          {
            title: "Vendas",
            icon: ChartBar,
            href: "/paginas/relatorios/vendas",
          },
          {
            title: "Curva ABC",
            icon: ChartArea,
            href: "/paginas/relatorios/curva-abc-vendas",
          },
          {
            title: "Curva ABC Inativo",
            icon: ChartArea,
            href: "/paginas/relatorios/curva-abc-inativos",
          },
          {
            title: "Clientes Inativos",
            icon: Building,
            href: "/paginas/relatorios/clientes-inativos",
          },
          {
            title: "Comissão de Pedidos",
            icon: ChartBar,
            href: "/paginas/relatorios/comissao-pedidos-fabricante",
          },
          {
            title: "Produtos Sem Pedido",
            icon: ClipBoard,
            href: "/paginas/relatorios/produtos-sem-pedido",
          },
          {
            title: "Síntese de Pedidos",
            icon: ListFill,
            href: "/paginas/relatorios/sintese-pedidos",
          },
        ],
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",


        child: [
          {
            title: "Analytics",
            href: "/dashboard",
            icon: Graph,
          },
          {
            title: "Dashboard Geral",
            href: "/paginas/dashboard/geral",
            icon: ChartArea,
          },
          {
            title: "Vendas",
            href: "/paginas/dashboard/vendas",
            icon: ChartBar,
          },
        ],
      },
      {
        title: "Lembretes",
        icon: Bell,
        href: "/lembretes",
      },
      {
        title: "Cadastros",
        icon: Building2,
        child: [
          {
            title: "Clientes",
            icon: Building,
            href: "/paginas/cadastros/cliente",
          },
          {
            title: "Produtos",
            icon: Stacks2,
            href: "/paginas/parametros/produto",
          },
          {
            title: "Lista de Preços",
            icon: ListFill,
            href: "/paginas/parametros/listas",
          },
          {
            title: "Transportadoras",
            icon: Building2,
            href: "/paginas/parametros/transportadora",
          },
          {
            title: "Dados de Base",
            icon: Components,
            multi_menu: [
              {
                title: "Grupos de Clientes",
                href: "/paginas/cadastros/grupo-clientes",
              },
              {
                title: "Grupo de Produtos",
                href: "/paginas/cadastros/grupo-produtos",
              },
              {
                title: "Marcas de Produtos",
                href: "/paginas/cadastros/marca-produto",
              },
              {
                title: "Região & Zona",
                href: "/paginas/cadastros/regiao-zona",
              },
              {
                title: "Estados",
                href: "/paginas/cadastros/estados",
              },
              {
                title: "Critérios de Pagamento",
                href: "/paginas/cadastros/criterio-pagamento",
              },
              {
                title: "Bloqueio de Produto",
                href: "/paginas/cadastros/bloqueio-produto",
              },
              {
                title: "Unidade de Medida",
                href: "/paginas/cadastros/unidade-medida",
              },
            ],
          },
        ],
      },
      {
        title: "Vendedores",
        icon: Users,
        href: "/paginas/cadastros/vendedor",
      },
      {
        title: "Fabricantes",
        icon: Building2,
        href: "/paginas/cadastros/fabricante",
      },
      {
        title: "Condição de Pagamento",
        icon: ClipBoard,
        href: "/paginas/cadastros/condicao-pagamento",
      },
      {
        title: "Relatórios",
        icon: ChartBar,
        child: [
          {
            title: "Ficha do Cliente",
            icon: Building,
            href: "/paginas/relatorios/ficha-cliente",
          },
          {
            title: "Ficha do Fabricante",
            icon: Building2,
            href: "/paginas/relatorios/ficha-fabricante",
          },
          {
            title: "Ficha do Produto",
            icon: ClipBoard,
            href: "/paginas/relatorios/ficha-produto",
          },
          {
            title: "Lista de Preços de Produto",
            icon: ListFill,
            href: "/paginas/relatorios/lista-precos-produto",
          },
          {
            title: "Carteira de Clientes por Fabricante",
            icon: Building,
            href: "/paginas/relatorios/carteira-clientes-fabricante",
          },
          {
            title: "Carteira de Clientes",
            icon: Building,
            href: "/paginas/relatorios/carteira-clientes-vendedor",
          },
          {
            title: "Vendas",
            icon: ChartBar,
            href: "/paginas/relatorios/vendas",
          },
          {
            title: "Curva ABC",
            icon: ChartArea,
            href: "/paginas/relatorios/curva-abc-vendas",
          },
          {
            title: "Curva ABC Inativo",
            icon: ChartArea,
            href: "/paginas/relatorios/curva-abc-inativos",
          },
          {
            title: "Clientes Inativos",
            icon: Building,
            href: "/paginas/relatorios/clientes-inativos",
          },
          {
            title: "Comissão de Pedidos",
            icon: ChartBar,
            href: "/paginas/relatorios/comissao-pedidos-fabricante",
          },
          {
            title: "Produtos Sem Pedido",
            icon: ClipBoard,
            href: "/paginas/relatorios/produtos-sem-pedido",
          },
          {
            title: "Síntese de Pedidos",
            icon: ListFill,
            href: "/paginas/relatorios/sintese-pedidos",
          },
        ],
      },
    ],
  },
};


export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number]
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number]
export type MainNavType = (typeof menusConfig.mainNav)[number]