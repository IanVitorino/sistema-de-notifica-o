import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  desc_reduzida?: string;
  fabricante?: {
    id: number;
    razao_social?: string;
    fantasia?: string;
  };
  grupo?: {
    id: number;
    codigo: string;
    descricao: string;
  };
  linha?: {
    id: number;
    codigo: string;
    descricao: string;
  };
  marca?: {
    id: number;
    marca: string;
    descricao: string;
  };
  unidade?: {
    id: number;
    sigla: string;
    descricao: string;
  };
  codigo_original?: string;
  produto_substituido?: string;
  validade?: string | Date;
  motivo_bloqueio?: number;
  bloqueio?: {
    id: number;
    motivo: string;
    descricao: string;
  };
  inicio_bloq?: string | Date;
  termino_bloq?: string | Date;
  grupo_2?: string;
}

interface FichaProdutoPDFProps {
  produto: Produto;
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
    marginBottom: 4,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
  },
  subHeaderWarning: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#dc2626',
    borderBottomWidth: 1,
    borderBottomColor: '#fca5a5',
    paddingBottom: 2,
  },
  label: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 1,
  },
  value: {
    fontSize: 8.5,
    color: '#111827',
    marginBottom: 4,
  },
  infoItem: {
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: 2,
    borderRadius: 3,
    fontSize: 7,
    textAlign: 'center',
    width: 80,
  },
  statusBadgeWarning: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: 2,
    borderRadius: 3,
    fontSize: 7,
    textAlign: 'center',
    width: 100,
  },
  footer: {
    position: 'absolute',
    fontSize: 7,
    bottom: 20,
    right: 20,
    textAlign: 'right',
    color: '#6b7280',
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
});

const InfoItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}</Text>
    {typeof value === 'string' ? <Text style={styles.value}>{value}</Text> : value}
  </View>
);

const formatarData = (data?: Date | string) => {
  if (!data) return '-';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return String(data);
  }
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

export const FichaProdutoPDF = memo(({ produto }: FichaProdutoPDFProps) => {
  const bloqueioAtivo = produto.motivo_bloqueio && produto.motivo_bloqueio > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={LOGO_URL} style={styles.logo} />
          <Text style={styles.headerTitle}>Ficha Técnica do Produto</Text>
        </View>

        {/* Dados Principais */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Dados Principais</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem label="ID" value={produto.id.toString()} />
              <InfoItem label="Código" value={produto.codigo || '-'} />
              <InfoItem label="Descrição" value={produto.descricao || '-'} />
              <InfoItem label="Descrição Reduzida" value={produto.desc_reduzida || '-'} />
            </View>
            <View style={styles.column}>
              <InfoItem label="NCM (Código Original)" value={produto.codigo_original || '-'} />
              <InfoItem label="Produto Substituído" value={produto.produto_substituido || '-'} />
              <InfoItem label="Validade" value={formatarData(produto.validade)} />
            </View>
          </View>
        </View>

        {/* Classificação */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Classificação</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem
                label="Fabricante"
                value={produto.fabricante?.fantasia || produto.fabricante?.razao_social || '-'}
              />
              <InfoItem label="Grupo" value={produto.grupo?.descricao || '-'} />
              <InfoItem label="Linha" value={produto.linha?.descricao || '-'} />
            </View>
            <View style={styles.column}>
              <InfoItem label="Marca" value={produto.marca?.marca || '-'} />
              <InfoItem
                label="Unidade de Medida"
                value={produto.unidade ? `${produto.unidade.sigla} - ${produto.unidade.descricao}` : '-'}
              />
              {produto.grupo_2 && <InfoItem label="Grupo 2" value={produto.grupo_2} />}
            </View>
          </View>
        </View>

        {/* Bloqueio (se existir) */}
        {bloqueioAtivo && (
          <View style={styles.section}>
            <Text style={styles.subHeaderWarning}>⚠️ Bloqueio</Text>
            <InfoItem
              label="Status"
              value={
                <Text style={styles.statusBadgeWarning}>Produto Bloqueado</Text>
              }
            />
            <InfoItem
              label="Motivo"
              value={produto.bloqueio?.descricao || `Motivo ID: ${produto.motivo_bloqueio}`}
            />
            <InfoItem label="Início do Bloqueio" value={formatarData(produto.inicio_bloq)} />
            <InfoItem label="Término do Bloqueio" value={formatarData(produto.termino_bloq)} />
          </View>
        )}

        {/* Footer */}
        <Rodape />
      </Page>
    </Document>
  );
});

FichaProdutoPDF.displayName = 'FichaProdutoPDF';
