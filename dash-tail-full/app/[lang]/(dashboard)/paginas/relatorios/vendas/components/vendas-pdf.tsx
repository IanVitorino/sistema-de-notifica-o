import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface ResumoGrupo {
  codigo: string;
  valores: (number | '')[];
  total: number;
  media: number;
}

interface Filtros {
  fabricante: string;
  cliente: string;
  vendedor: string;
  regiao: string;
  produto: string;
  grupoProduto: string;
  mesInicial: string;
  mesFinal: string;
  ano: string;
  tipoPesquisa: string;
  tipoDados: string;
}

interface VendasPDFProps {
  data: ResumoGrupo[];
  filtros: Filtros;
  dataHoraRelatorio: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    orientation: 'landscape',
  },
  header: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    marginRight: 15,
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  filters: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  filterLabel: {
    width: 70,
    fontSize: 6,
    fontWeight: 'bold',
    paddingRight: 5,
  },
  filterValue: {
    flex: 1,
    fontSize: 6,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterColumn: {
    width: '25%',
  },
  table: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 4,
    fontSize: 7,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    fontSize: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 3,
    minHeight: 13,
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f9f9f9',
  },
  colCodigo: {
    width: '16%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingRight: 4,
    paddingLeft: 4,
  },
  colMes: {
    width: '5.5%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    paddingRight: 2,
    paddingLeft: 2,
    textAlign: 'right',
  },
  colMedia: {
    width: '8%',
    textAlign: 'right',
    paddingRight: 4,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#000',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  colTotal: {
    width: '8%',
    textAlign: 'right',
    paddingRight: 4,
    paddingLeft: 4,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    right: 20,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    padding: 4,
    fontSize: 7,
    fontWeight: 'bold',
    backgroundColor: '#f8f8f8',
    minHeight: 18,
  },
});

const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const formatValue = (value: number, tipoDados: string) => {
  return tipoDados === 'valor'
    ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        value
      )
    : new Intl.NumberFormat('pt-BR').format(value);
};

const ReportHeader = memo(({ dataHoraRelatorio }: { dataHoraRelatorio: string }) => (
  <View style={styles.header}>
    <View style={styles.headerRow}>
      <Image src={LOGO_URL} style={styles.logo} />
      <View style={styles.headerText}>
        <Text style={styles.title}>Relatório de Vendas</Text>
        <Text style={styles.subtitle}>Data/Hora: {dataHoraRelatorio}</Text>
      </View>
    </View>
  </View>
));

ReportHeader.displayName = 'ReportHeader';

const Filtros = memo(({ filtros }: { filtros: Filtros }) => (
  <View style={styles.filters}>
    <View style={styles.filterGrid}>
      <View style={styles.filterColumn}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Fabricante:</Text>
          <Text style={styles.filterValue}>{filtros.fabricante}</Text>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Cliente:</Text>
          <Text style={styles.filterValue}>{filtros.cliente}</Text>
        </View>
      </View>
      <View style={styles.filterColumn}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Vendedor:</Text>
          <Text style={styles.filterValue}>{filtros.vendedor}</Text>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Região:</Text>
          <Text style={styles.filterValue}>{filtros.regiao}</Text>
        </View>
      </View>
      <View style={styles.filterColumn}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Produto:</Text>
          <Text style={styles.filterValue}>{filtros.produto}</Text>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Grupo Produto:</Text>
          <Text style={styles.filterValue}>{filtros.grupoProduto}</Text>
        </View>
      </View>
      <View style={styles.filterColumn}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Período:</Text>
          <Text style={styles.filterValue}>
            {meses[Number(filtros.mesInicial) - 1]} à {meses[Number(filtros.mesFinal) - 1]} de{' '}
            {filtros.ano}
          </Text>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tipo Dados:</Text>
          <Text style={styles.filterValue}>
            {filtros.tipoDados === 'valor' ? 'Valor (R$)' : 'Quantidade'}
          </Text>
        </View>
      </View>
    </View>
  </View>
));

Filtros.displayName = 'Filtros';

const TableHeader = memo(() => (
  <View style={styles.tableHeader}>
    <Text style={styles.colCodigo}>Código</Text>
    {mesesAbrev.map((mes, index) => (
      <Text key={index} style={styles.colMes}>
        {mes}
      </Text>
    ))}
    <Text style={styles.colMedia}>Média</Text>
    <Text style={styles.colTotal}>Total</Text>
  </View>
));

TableHeader.displayName = 'TableHeader';

const TableRow = memo(
  ({
    item,
    index,
    tipoDados,
  }: {
    item: ResumoGrupo;
    index: number;
    tipoDados: string;
  }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
      <Text style={styles.colCodigo}>{item.codigo}</Text>
      {item.valores.map((valor, mesIndex) => (
        <Text key={mesIndex} style={styles.colMes}>
          {typeof valor === 'number' ? formatValue(valor, tipoDados) : '-'}
        </Text>
      ))}
      <Text style={styles.colMedia}>{formatValue(item.media, tipoDados)}</Text>
      <Text style={styles.colTotal}>{formatValue(item.total, tipoDados)}</Text>
    </View>
  )
);

TableRow.displayName = 'TableRow';

const TotalRow = memo(
  ({ data, tipoDados }: { data: ResumoGrupo[]; tipoDados: string }) => {
    const totaisPorMes = Array(12).fill(0);
    let totalGeral = 0;

    data.forEach((item) => {
      item.valores.forEach((valor, index) => {
        if (typeof valor === 'number') {
          totaisPorMes[index] += valor;
          totalGeral += valor;
        }
      });
    });

    return (
      <View style={styles.totalRow}>
        <Text style={styles.colCodigo}>Total Geral</Text>
        {totaisPorMes.map((total, index) => (
          <Text key={index} style={styles.colMes}>
            {total > 0 ? formatValue(total, tipoDados) : '-'}
          </Text>
        ))}
        <Text style={styles.colMedia}>-</Text>
        <Text style={styles.colTotal}>{formatValue(totalGeral, tipoDados)}</Text>
      </View>
    );
  }
);

TotalRow.displayName = 'TotalRow';

export const VendasPDF = memo(({ data, filtros, dataHoraRelatorio }: VendasPDFProps) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <ReportHeader dataHoraRelatorio={dataHoraRelatorio} />

        <Filtros filtros={filtros} />

        <View style={styles.table}>
          <TableHeader />

          {data.map((item, index) => (
            <TableRow key={index} item={item} index={index} tipoDados={filtros.tipoDados} />
          ))}

          <TotalRow data={data} tipoDados={filtros.tipoDados} />
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
});

VendasPDF.displayName = 'VendasPDF';
