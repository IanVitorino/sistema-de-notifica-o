import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface CurvaABCInativoItem {
  ranking: number;
  descricao: string;
  quantidade: number;
  valor: number;
  saldo: number;
  percentual: number;
  acumulado: number;
  classificacao: 'A' | 'B' | 'C';
}

interface Filtros {
  fabricante: string;
  cliente: string;
  grupoProduto: string;
  periodoInicial: string;
  periodoFinal: string;
  tipoDados: 'valor' | 'quantidade';
  curvaRange: [number, number];
}

interface CurvaABCInativosPDFProps {
  data: CurvaABCInativoItem[];
  filtros: Filtros;
  dataHoraRelatorio: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
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
    width: 90,
    fontSize: 7,
    fontWeight: 'bold',
    paddingRight: 5,
  },
  filterValue: {
    flex: 1,
    fontSize: 7,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterColumn: {
    width: '50%',
  },
  curvaInfo: {
    marginBottom: 4,
    fontSize: 7,
    color: '#666',
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
    borderBottomColor: '#ddd',
    padding: 3,
    minHeight: 13,
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f9f9f9',
  },
  colRanking: {
    width: '7%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'center',
  },
  colDescricao: {
    width: '28%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
  },
  colQuantidade: {
    width: '11%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'right',
  },
  colValor: {
    width: '13%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'right',
  },
  colSaldo: {
    width: '11%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'right',
  },
  colPercentual: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'right',
  },
  colAcumulado: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'right',
  },
  colClasse: {
    width: '10%',
    paddingRight: 4,
    paddingLeft: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  classeA: {
    color: '#000',
  },
  classeB: {
    color: '#666',
  },
  classeC: {
    color: '#999',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    right: 20,
    color: '#666',
  },
});

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const ReportHeader = memo(({ dataHoraRelatorio }: { dataHoraRelatorio: string }) => (
  <View style={styles.header}>
    <View style={styles.headerRow}>
      <Image src={LOGO_URL} style={styles.logo} />
      <View style={styles.headerText}>
        <Text style={styles.title}>Curva ABC de Produtos Inativos</Text>
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
        {filtros.grupoProduto && (
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Grupo Produto:</Text>
            <Text style={styles.filterValue}>{filtros.grupoProduto}</Text>
          </View>
        )}
      </View>
      <View style={styles.filterColumn}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Período:</Text>
          <Text style={styles.filterValue}>
            {formatDate(filtros.periodoInicial)} à {formatDate(filtros.periodoFinal)}
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
    <Text style={styles.curvaInfo}>
      Classe A: 0% - {filtros.curvaRange[0]}% | Classe B: {filtros.curvaRange[0]}% -{' '}
      {filtros.curvaRange[1]}% | Classe C: {filtros.curvaRange[1]}% - 100%
    </Text>
  </View>
));

Filtros.displayName = 'Filtros';

const TableHeader = memo(() => (
  <View style={styles.tableHeader}>
    <Text style={styles.colRanking}>Ranking</Text>
    <Text style={styles.colDescricao}>Descrição</Text>
    <Text style={styles.colQuantidade}>Quantidade</Text>
    <Text style={styles.colValor}>Valor R$</Text>
    <Text style={styles.colSaldo}>Saldo</Text>
    <Text style={styles.colPercentual}>Perc. %</Text>
    <Text style={styles.colAcumulado}>Acm. %</Text>
    <Text style={styles.colClasse}>Classe</Text>
  </View>
));

TableHeader.displayName = 'TableHeader';

const TableRow = memo(({ item, index }: { item: CurvaABCInativoItem; index: number }) => {
  const getClasseStyle = (classe: string) => {
    switch (classe) {
      case 'A':
        return styles.classeA;
      case 'B':
        return styles.classeB;
      case 'C':
        return styles.classeC;
      default:
        return styles.classeA;
    }
  };

  return (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
      <Text style={styles.colRanking}>{item.ranking}</Text>
      <Text style={styles.colDescricao}>{item.descricao}</Text>
      <Text style={styles.colQuantidade}>
        {new Intl.NumberFormat('pt-BR').format(item.quantidade)}
      </Text>
      <Text style={styles.colValor}>
        {new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.valor)}
      </Text>
      <Text style={styles.colSaldo}>
        {new Intl.NumberFormat('pt-BR').format(item.saldo)}
      </Text>
      <Text style={styles.colPercentual}>
        {new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.percentual)}
      </Text>
      <Text style={styles.colAcumulado}>
        {new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item.acumulado)}
      </Text>
      <Text style={[styles.colClasse, getClasseStyle(item.classificacao)]}>
        {item.classificacao}
      </Text>
    </View>
  );
});

TableRow.displayName = 'TableRow';

export const CurvaABCInativosPDF = memo(({ data, filtros, dataHoraRelatorio }: CurvaABCInativosPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader dataHoraRelatorio={dataHoraRelatorio} />

        <Filtros filtros={filtros} />

        <View style={styles.table}>
          <TableHeader />

          {data.map((item, index) => (
            <TableRow key={index} item={item} index={index} />
          ))}
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

CurvaABCInativosPDF.displayName = 'CurvaABCInativosPDF';
