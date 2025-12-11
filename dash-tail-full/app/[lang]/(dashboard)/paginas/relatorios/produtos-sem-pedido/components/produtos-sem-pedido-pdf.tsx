import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface ProdutoSemPedido {
  fabricante: string;
  subgrupo_cliente: string;
  codigo: string;
  quantidade_ultima: number | null;
  data_ultima_compra: string | null;
}

interface FiltrosAplicados {
  cliente?: string;
  fabricante?: string;
  estado?: string;
  cidade?: string;
  regiao?: string;
  dataInicial?: string;
  dataFinal?: string;
}

interface ProdutosSemPedidoPDFProps {
  data: Date;
  produtos: ProdutoSemPedido[];
  filtros: FiltrosAplicados;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 7,
    paddingBottom: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  filtroBlock: {
    marginBottom: 10,
  },
  filtro: {
    fontSize: 7.5,
    marginBottom: 2,
  },
  totalText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  table: {
    marginTop: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingVertical: 4,
    fontWeight: 'bold',
    fontSize: 7.5,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingVertical: 3,
    fontSize: 7,
  },
  rowEven: {
    backgroundColor: '#f9fafb',
  },
  colFabricante: {
    width: '20%',
    paddingHorizontal: 4,
  },
  colSubgrupoCliente: {
    width: '30%',
    paddingHorizontal: 4,
  },
  colCodigo: {
    width: '15%',
    paddingHorizontal: 4,
  },
  colQuantidadeUltima: {
    width: '15%',
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  colDataUltimaCompra: {
    width: '20%',
    paddingHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    fontSize: 7,
    bottom: 20,
    left: 20,
    right: 20,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    textAlign: 'center',
    color: '#6b7280',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 7,
    bottom: 20,
    right: 20,
    color: '#6b7280',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 20,
    color: '#6b7280',
    fontSize: 8,
  },
});

const formatarData = (dataString: string | null) => {
  if (!dataString) return '';

  try {
    const date = new Date(dataString);
    if (isNaN(date.getTime())) return dataString;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dataString;
  }
};

const Rodape = memo(({ data }: { data: Date }) => {
  const dataStr = data.toLocaleDateString('pt-BR');
  const horaStr = data.toLocaleTimeString('pt-BR');

  return (
    <View style={styles.footer} fixed>
      <Text>
        Relatório gerado em {dataStr} às {horaStr}
      </Text>
    </View>
  );
});

Rodape.displayName = 'Rodape';

const HeaderRow = memo(() => (
  <View style={styles.rowHeader} fixed>
    <Text style={styles.colFabricante}>Fabricante</Text>
    <Text style={styles.colSubgrupoCliente}>Cliente</Text>
    <Text style={styles.colCodigo}>Código</Text>
    <Text style={styles.colQuantidadeUltima}>Quantidade Última</Text>
    <Text style={styles.colDataUltimaCompra}>Data Última Compra</Text>
  </View>
));

HeaderRow.displayName = 'HeaderRow';

const ItemRow = memo(({ item, index }: { item: ProdutoSemPedido; index: number }) => (
  <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
    <Text style={styles.colFabricante}>{item.fabricante}</Text>
    <Text style={styles.colSubgrupoCliente}>{item.subgrupo_cliente}</Text>
    <Text style={styles.colCodigo}>{item.codigo}</Text>
    <Text style={styles.colQuantidadeUltima}>
      {item.quantidade_ultima !== null ? item.quantidade_ultima : '-'}
    </Text>
    <Text style={styles.colDataUltimaCompra}>{formatarData(item.data_ultima_compra)}</Text>
  </View>
));

ItemRow.displayName = 'ItemRow';

const EmptyMessage = memo(() => (
  <View style={styles.row}>
    <Text style={styles.emptyMessage}>Nenhum produto encontrado</Text>
  </View>
));

EmptyMessage.displayName = 'EmptyMessage';

const FiltrosAtivos = memo(({ filtros }: { filtros: FiltrosAplicados }) => (
  <View style={styles.filtroBlock}>
    <Text style={styles.filtro}>
      Período: {filtros.dataInicial || 'N/A'} até {filtros.dataFinal || 'N/A'}
    </Text>
    {filtros.cliente && <Text style={styles.filtro}>Cliente: {filtros.cliente}</Text>}
    {filtros.fabricante && <Text style={styles.filtro}>Fabricante: {filtros.fabricante}</Text>}
    {filtros.estado && <Text style={styles.filtro}>Estado: {filtros.estado}</Text>}
    {filtros.cidade && <Text style={styles.filtro}>Cidade: {filtros.cidade}</Text>}
    {filtros.regiao && <Text style={styles.filtro}>Região: {filtros.regiao}</Text>}
  </View>
));

FiltrosAtivos.displayName = 'FiltrosAtivos';

const ReportHeader = memo(() => (
  <View style={styles.headerContainer} fixed>
    <View style={styles.logoContainer}>
      <Image src={LOGO_URL} style={styles.logo} />
    </View>
    <View style={styles.headerTextContainer}>
      <Text style={styles.title}>Relatório Produtos Sem Pedido</Text>
    </View>
  </View>
));

ReportHeader.displayName = 'ReportHeader';

export const ProdutosSemPedidoPDF = memo(
  ({ data, produtos, filtros }: ProdutosSemPedidoPDFProps) => {
    const produtosArray = Array.isArray(produtos) ? produtos : [];

    return (
      <Document>
        <Page size="A4" orientation="portrait" style={styles.page}>
          <ReportHeader />

          <FiltrosAtivos filtros={filtros} />

          <Text style={styles.totalText}>Total de produtos: {produtosArray.length}</Text>

          <View style={styles.table}>
            <HeaderRow />

            {produtosArray.length === 0 ? (
              <EmptyMessage />
            ) : (
              produtosArray.map((produto, index) => (
                <ItemRow key={`produto-${index}`} item={produto} index={index} />
              ))
            )}
          </View>

          <Rodape data={data} />

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </Page>
      </Document>
    );
  }
);

ProdutosSemPedidoPDF.displayName = 'ProdutosSemPedidoPDF';
