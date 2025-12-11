import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface ClienteCarteira {
  cliente_nome: string;
  endereco: string;
  cep: string;
  contato_telefone: string;
  cidade: string;
  fabricante_nome: string;
  codigo_regiao: string;
}

interface FiltrosAplicados {
  vendedor: string;
  fabricante?: string;
  estado?: string;
  cidade?: string;
  regiao?: string;
}

interface CarteiraClientesVendedorPDFProps {
  data: Date;
  clientes: ClienteCarteira[];
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
  colCliente: {
    width: '30%',
    paddingHorizontal: 4,
  },
  colEndereco: {
    width: '30%',
    paddingHorizontal: 4,
  },
  colCep: {
    width: '6%',
    paddingHorizontal: 4,
  },
  colTelefone: {
    width: '10%',
    paddingHorizontal: 4,
  },
  colCidade: {
    width: '14%',
    paddingHorizontal: 4,
  },
  colRegiao: {
    width: '4%',
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  colFabricante: {
    width: '6%',
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

const Rodape = memo(({ data }: { data: Date }) => {
  const dataStr = useMemo(() => data.toLocaleDateString('pt-BR'), [data]);
  const horaStr = useMemo(() => data.toLocaleTimeString('pt-BR'), [data]);

  return (
    <View style={styles.footer} fixed>
      <Text>Relatório gerado em {dataStr} às {horaStr}</Text>
    </View>
  );
});

Rodape.displayName = 'Rodape';

const HeaderRow = memo(() => (
  <View style={styles.rowHeader} fixed>
    <Text style={styles.colCliente}>Cliente</Text>
    <Text style={styles.colEndereco}>Endereço</Text>
    <Text style={styles.colCep}>CEP</Text>
    <Text style={styles.colTelefone}>Telefone</Text>
    <Text style={styles.colCidade}>Cidade</Text>
    <Text style={styles.colRegiao}>Região</Text>
    <Text style={styles.colFabricante}>Fabricante</Text>
  </View>
));

HeaderRow.displayName = 'HeaderRow';

const ItemRow = memo(({ item, index }: { item: ClienteCarteira; index: number }) => (
  <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
    <Text style={styles.colCliente}>{item.cliente_nome}</Text>
    <Text style={styles.colEndereco}>{item.endereco}</Text>
    <Text style={styles.colCep}>{item.cep}</Text>
    <Text style={styles.colTelefone}>{item.contato_telefone}</Text>
    <Text style={styles.colCidade}>{item.cidade}</Text>
    <Text style={styles.colRegiao}>{item.codigo_regiao}</Text>
    <Text style={styles.colFabricante}>{item.fabricante_nome}</Text>
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
    <Text style={styles.filtro}>Vendedor: {filtros.vendedor}</Text>
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
      <Text style={styles.title}>Relatório Carteira de Clientes</Text>
    </View>
  </View>
));

ReportHeader.displayName = 'ReportHeader';

export const CarteiraClientesVendedorPDF = memo(
  ({ data, clientes, filtros }: CarteiraClientesVendedorPDFProps) => {
    const clientesArray = Array.isArray(clientes) ? clientes : [];

    return (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader />

          <FiltrosAtivos filtros={filtros} />

          <Text style={styles.totalText}>
            Total de clientes: {clientesArray.length}
          </Text>

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

CarteiraClientesVendedorPDF.displayName = 'CarteiraClientesVendedorPDF';
