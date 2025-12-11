import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface RelatorioItem {
  id: number;
  numero: string;
  data: string;
  fabricante: string;
  cliente: string;
  pedido: number;
  faturamento: number;
  comissao: number;
}

interface Totais {
  pedido: number;
  faturamento: number;
  comissao: number;
}

interface Filtros {
  periodoInicial: string;
  periodoFinal: string;
  fabricante: string | null;
  cliente: string | null;
  vendedor: string | null;
}

interface ComissaoPedidosPDFProps {
  items: RelatorioItem[];
  totais: Totais;
  filtros: Filtros;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingBottom: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    marginRight: 20,
  },
  logo: {
    width: '100%',
    maxHeight: 40,
    objectFit: 'contain',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingTop: 2,
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: '#f0f0f0',
    fontSize: 8,
  },
  cellFabricante: {
    width: '14%',
    paddingHorizontal: 2,
  },
  cellCliente: {
    width: '46%',
    paddingHorizontal: 2,
  },
  cellData: {
    width: '10%',
    paddingHorizontal: 2,
  },
  cellNumero: {
    width: '10%',
    paddingHorizontal: 2,
  },
  cellValor: {
    width: '10%',
    paddingHorizontal: 2,
    textAlign: 'right',
  },
  cellComissao: {
    width: '10%',
    paddingHorizontal: 2,
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    textAlign: 'center',
    color: '#666666',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 7,
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
    fontSize: 8,
  },
});

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const ReportHeader = memo(({ filtros }: { filtros: Filtros }) => {
  const filtroFabricante = filtros.fabricante ? `Fabricante: ${filtros.fabricante}` : 'Fabricante: Todos';
  const filtroCliente = filtros.cliente ? `Cliente: ${filtros.cliente}` : 'Cliente: Todos';
  const filtroVendedor = filtros.vendedor ? `Vendedor: ${filtros.vendedor}` : 'Vendedor: Todos';

  return (
    <View style={styles.headerContainer} fixed>
      <View style={styles.logoContainer}>
        <Image src={LOGO_URL} style={styles.logo} />
      </View>
      <View style={styles.headerTextContainer}>
        <Text style={styles.title}>Relatório De Comissão Por Pedidos</Text>
        <Text style={styles.header}>
          Período: {filtros.periodoInicial} até {filtros.periodoFinal}
        </Text>
        <Text style={styles.header}>
          {filtroCliente} | {filtroFabricante} | {filtroVendedor}
        </Text>
      </View>
    </View>
  );
});

ReportHeader.displayName = 'ReportHeader';

const Rodape = memo(() => {
  const dataHora = useMemo(() => {
    const agora = new Date();
    return {
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR'),
    };
  }, []);

  return (
    <View style={styles.footerContainer} fixed>
      <Text style={styles.footerText}>
        Relatório gerado em {dataHora.data} às {dataHora.hora}
      </Text>
    </View>
  );
});

Rodape.displayName = 'Rodape';

const HeaderRow = memo(() => (
  <View style={styles.headerRow} fixed>
    <Text style={styles.cellFabricante}>Fabricante</Text>
    <Text style={styles.cellCliente}>Cliente</Text>
    <Text style={styles.cellData}>Data</Text>
    <Text style={styles.cellNumero}>Nº Pedido</Text>
    <Text style={styles.cellValor}>Total Pedido</Text>
    <Text style={styles.cellComissao}>Comissão</Text>
  </View>
));

HeaderRow.displayName = 'HeaderRow';

const ItemRow = memo(({ item }: { item: RelatorioItem }) => (
  <View style={styles.row}>
    <Text style={styles.cellFabricante}>{item.fabricante}</Text>
    <Text style={styles.cellCliente}>{item.cliente}</Text>
    <Text style={styles.cellData}>{item.data}</Text>
    <Text style={styles.cellNumero}>{item.id}</Text>
    <Text style={styles.cellValor}>{formatMoney(item.pedido)}</Text>
    <Text style={styles.cellComissao}>{formatMoney(item.comissao)}</Text>
  </View>
));

ItemRow.displayName = 'ItemRow';

const TotalRow = memo(({ totais }: { totais: Totais }) => (
  <View style={[styles.row, styles.bold]}>
    <Text style={styles.cellFabricante}>TOTAL</Text>
    <Text style={styles.cellCliente}></Text>
    <Text style={styles.cellData}></Text>
    <Text style={styles.cellNumero}></Text>
    <Text style={styles.cellValor}>{formatMoney(totais.pedido)}</Text>
    <Text style={styles.cellComissao}>{formatMoney(totais.comissao)}</Text>
  </View>
));

TotalRow.displayName = 'TotalRow';

const EmptyMessage = memo(() => (
  <View style={styles.row}>
    <Text style={styles.emptyMessage}>
      Nenhum registro encontrado para os filtros selecionados
    </Text>
  </View>
));

EmptyMessage.displayName = 'EmptyMessage';

export const ComissaoPedidosPDF = memo(({ items, totais, filtros }: ComissaoPedidosPDFProps) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <ReportHeader filtros={filtros} />

        <HeaderRow />

        {items.length === 0 ? (
          <EmptyMessage />
        ) : (
          items.map((item, idx) => <ItemRow key={idx} item={item} />)
        )}

        <TotalRow totais={totais} />

        <Rodape />

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
});

ComissaoPedidosPDF.displayName = 'ComissaoPedidosPDF';
