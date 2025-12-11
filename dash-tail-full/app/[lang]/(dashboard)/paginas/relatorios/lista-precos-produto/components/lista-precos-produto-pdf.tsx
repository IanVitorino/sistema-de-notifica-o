import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface Fabricante {
  id: number;
  razao_social?: string;
  fantasia?: string;
  cnpj?: string;
}

interface ProdutoPreco {
  id: number;
  codigo: string;
  descricao: string;
  desc_reduzida?: string;
  preco: number;
  master: number;
  unidade?: {
    sigla: string;
  };
}

interface ListaPrecosProdutoPDFProps {
  nomeLista: string;
  produtos: ProdutoPreco[];
  fabricante: Fabricante | null;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    padding: 20,
    lineHeight: 1.15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#111827',
  },
  section: {
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#6b7280',
    width: 100,
  },
  value: {
    fontSize: 8.5,
    color: '#111827',
    flex: 1,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 5,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  colCodigo: {
    width: '12%',
    fontSize: 7.5,
  },
  colDescricao: {
    width: '35%',
    fontSize: 7.5,
  },
  colDescReduzida: {
    width: '25%',
    fontSize: 7.5,
  },
  colValor: {
    width: '13%',
    fontSize: 7.5,
    textAlign: 'right',
  },
  colMaster: {
    width: '8%',
    fontSize: 7.5,
    textAlign: 'center',
  },
  colUnidade: {
    width: '7%',
    fontSize: 7.5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    fontSize: 7,
    bottom: 20,
    right: 20,
    textAlign: 'right',
    color: '#6b7280',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: '#374151',
  },
  totalText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
});

const formatarValor = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

const Rodape = memo(() => {
  const dataHora = useMemo(() => {
    const agora = new Date();
    return {
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR'),
    };
  }, []);

  return (
    <Text style={styles.footer}>
      Relatório gerado em {dataHora.data} às {dataHora.hora}
    </Text>
  );
});

Rodape.displayName = 'Rodape';

export const ListaPrecosProdutoPDF = memo(
  ({ nomeLista, produtos, fabricante }: ListaPrecosProdutoPDFProps) => {
    const valorTotal = useMemo(() => {
      return produtos.reduce((acc, produto) => acc + produto.preco * produto.master, 0);
    }, [produtos]);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image src={LOGO_URL} style={styles.logo} />
            <Text style={styles.headerTitle}>Lista de Preços de Produto</Text>
          </View>

          {/* Informações da Lista */}
          <View style={styles.section}>
            <Text style={styles.subHeader}>Informações da Lista</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Lista:</Text>
              <Text style={styles.value}>{nomeLista}</Text>
            </View>
            {fabricante && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Fabricante:</Text>
                  <Text style={styles.value}>
                    {fabricante.fantasia || fabricante.razao_social}
                  </Text>
                </View>
                {fabricante.cnpj && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>CNPJ:</Text>
                    <Text style={styles.value}>{fabricante.cnpj}</Text>
                  </View>
                )}
              </>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total de Produtos:</Text>
              <Text style={styles.value}>{produtos.length}</Text>
            </View>
          </View>

          {/* Tabela de Produtos */}
          <View style={styles.section}>
            <Text style={styles.subHeader}>Produtos</Text>
            <View style={styles.table}>
              {/* Header da Tabela */}
              <View style={styles.tableHeader}>
                <Text style={styles.colCodigo}>Código</Text>
                <Text style={styles.colDescricao}>Descrição</Text>
                <Text style={styles.colDescReduzida}>Desc. Reduzida</Text>
                <Text style={styles.colValor}>Valor</Text>
                <Text style={styles.colMaster}>Master</Text>
                <Text style={styles.colUnidade}>Unid.</Text>
              </View>

              {/* Linhas da Tabela */}
              {produtos.map((produto, index) => (
                <View
                  key={produto.id}
                  style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                >
                  <Text style={styles.colCodigo}>{produto.codigo}</Text>
                  <Text style={styles.colDescricao}>{produto.descricao}</Text>
                  <Text style={styles.colDescReduzida}>{produto.desc_reduzida || '-'}</Text>
                  <Text style={styles.colValor}>{formatarValor(produto.preco)}</Text>
                  <Text style={styles.colMaster}>{produto.master}</Text>
                  <Text style={styles.colUnidade}>{produto.unidade?.sigla || '-'}</Text>
                </View>
              ))}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>
                  Valor Total Estimado (Preço × Master): {formatarValor(valorTotal)}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <Rodape />
        </Page>
      </Document>
    );
  }
);

ListaPrecosProdutoPDF.displayName = 'ListaPrecosProdutoPDF';
