import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface ClienteInativo {
  fantasia: string;
  cidade: string;
  uf: string;
  contato_telefone: string;
  contato_nome: string;
  ultimopedido: string;
  totped: number;
}

interface FiltrosAplicados {
  vendedor?: string;
  fabricante?: string;
  estado?: string;
  cidade?: string;
  regiao?: string;
  dataFinal?: string;
}

interface ClientesInativosPDFProps {
  data: Date;
  clientes: ClienteInativo[];
  filtros: FiltrosAplicados;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
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
  colFantasia: {
    width: '30%',
    paddingHorizontal: 4,
  },
  colEndereco: {
    width: '20%',
    paddingHorizontal: 4,
  },
  colTotped: {
    width: '10%',
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  colTelefone: {
    width: '10%',
    paddingHorizontal: 4,
  },
  colContato: {
    width: '20%',
    paddingHorizontal: 4,
  },
  colUltimoPedido: {
    width: '10%',
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

const formatarData = (dataString: string) => {
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
    <Text style={styles.colFantasia}>Cliente</Text>
    <Text style={styles.colEndereco}>Localização</Text>
    <Text style={styles.colTotped}>Total Pedidos</Text>
    <Text style={styles.colTelefone}>Telefone</Text>
    <Text style={styles.colContato}>Contato</Text>
    <Text style={styles.colUltimoPedido}>Último Pedido</Text>
  </View>
));

HeaderRow.displayName = 'HeaderRow';

const ItemRow = memo(({ item, index }: { item: ClienteInativo; index: number }) => (
  <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
    <Text style={styles.colFantasia}>{item.fantasia}</Text>
    <Text style={styles.colEndereco}>
      {item.cidade} - {item.uf}
    </Text>
    <Text style={styles.colTotped}>{item.totped}</Text>
    <Text style={styles.colTelefone}>{item.contato_telefone}</Text>
    <Text style={styles.colContato}>{item.contato_nome}</Text>
    <Text style={styles.colUltimoPedido}>{formatarData(item.ultimopedido)}</Text>
  </View>
));

ItemRow.displayName = 'ItemRow';

const EmptyMessage = memo(() => (
  <View style={styles.row}>
    <Text style={styles.emptyMessage}>Nenhum cliente encontrado</Text>
  </View>
));

EmptyMessage.displayName = 'EmptyMessage';

const FiltrosAtivos = memo(({ filtros }: { filtros: FiltrosAplicados }) => (
  <View style={styles.filtroBlock}>
    <Text style={styles.filtro}>Data Final: {filtros.dataFinal || 'Não informada'}</Text>
    {filtros.vendedor && <Text style={styles.filtro}>Vendedor: {filtros.vendedor}</Text>}
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
      <Text style={styles.title}>Relatório Clientes Inativos</Text>
    </View>
  </View>
));

ReportHeader.displayName = 'ReportHeader';

export const ClientesInativosPDF = memo(
  ({ data, clientes, filtros }: ClientesInativosPDFProps) => {
    const clientesArray = Array.isArray(clientes) ? clientes : [];

    return (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />

          <FiltrosAtivos filtros={filtros} />

          <Text style={styles.totalText}>Total de clientes: {clientesArray.length}</Text>

          <View style={styles.table}>
            <HeaderRow />

            {clientesArray.length === 0 ? (
              <EmptyMessage />
            ) : (
              clientesArray.map((cliente, index) => (
                <ItemRow key={`cliente-${index}`} item={cliente} index={index} />
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

ClientesInativosPDF.displayName = 'ClientesInativosPDF';
