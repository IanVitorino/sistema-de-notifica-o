import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface Fabricante {
  id: number;
  razao_social?: string;
  fantasia?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: number;
  cep?: string;
  cnpj?: string;
  inscricao?: string;
  contato_email_pedidos?: string;
  contato_email_contato?: string;
  contato_nfe_xml?: string;
  contato_nome_contato?: string;
  contato_telefone1?: string;
  contato_telefone1_ramal?: string;
  contato_telefone2?: string;
  contato_telefone2_ramal?: string;
  contato_fax?: string;
  codigo_representada?: string;
  inicio_representada?: Date | string;
  criterio_pagamento?: number;
  base_do_dia?: string;
  base_ate?: string;
  anexo_txt?: boolean;
  anexo_xls?: boolean;
  dia_vencimento?: string;
  porcent_comissao?: number;
  fechamento_periodo?: string;
  emite_nota?: boolean;
  habilitado?: boolean;
  status?: boolean;
  anexo_xml?: boolean;
  anexo_json?: boolean;
  num_ped_cli?: boolean;
}

interface FichaFabricantePDFProps {
  fabricante: Fabricante;
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
  statusBadgeInactive: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: 2,
    borderRadius: 3,
    fontSize: 7,
    textAlign: 'center',
    width: 80,
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

const formatarData = (data?: Date | string) =>
  data ? new Date(data).toLocaleDateString('pt-BR') : '-';

const formatarTelefone = (telefone?: string, ramal?: string): string => {
  if (!telefone) return '-';
  return ramal ? `${telefone} (${ramal})` : telefone;
};

const formatarBoolean = (valor?: boolean): string => {
  if (valor === undefined || valor === null) return '-';
  return valor ? 'Sim' : 'Não';
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

export const FichaFabricantePDF = memo(({ fabricante }: FichaFabricantePDFProps) => {
  const fabricanteStatus = fabricante.status === undefined ? true : fabricante.status;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={LOGO_URL} style={styles.logo} />
          <Text style={styles.headerTitle}>Ficha do Fabricante</Text>
        </View>

        {/* Dados Principais */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Dados Principais</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem label="ID" value={fabricante.id.toString()} />
              <InfoItem
                label="Status"
                value={
                  <Text style={fabricanteStatus ? styles.statusBadge : styles.statusBadgeInactive}>
                    {fabricanteStatus ? 'Ativo' : 'Inativo'}
                  </Text>
                }
              />
              <InfoItem label="Razão Social" value={fabricante.razao_social || '-'} />
              <InfoItem label="Nome Fantasia" value={fabricante.fantasia || '-'} />
              <InfoItem label="CNPJ" value={fabricante.cnpj || '-'} />
            </View>
            <View style={styles.column}>
              <InfoItem label="Inscrição" value={fabricante.inscricao || '-'} />
              <InfoItem label="Habilitado" value={formatarBoolean(fabricante.habilitado)} />
              <InfoItem label="Código Representada" value={fabricante.codigo_representada || '-'} />
              <InfoItem label="Início Representada" value={formatarData(fabricante.inicio_representada)} />
              <InfoItem label="% Comissão" value={fabricante.porcent_comissao?.toString() || '-'} />
            </View>
          </View>
        </View>

        {/* Endereço */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Endereço</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem label="Endereço" value={fabricante.endereco || '-'} />
              <InfoItem label="Bairro" value={fabricante.bairro || '-'} />
            </View>
            <View style={styles.column}>
              <InfoItem label="Cidade" value={fabricante.cidade || '-'} />
              <InfoItem label="CEP" value={fabricante.cep || '-'} />
            </View>
          </View>
        </View>

        {/* Contatos */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Contatos</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem label="Contato" value={fabricante.contato_nome_contato || '-'} />
              <InfoItem label="Telefone Principal" value={formatarTelefone(fabricante.contato_telefone1, fabricante.contato_telefone1_ramal)} />
              <InfoItem label="Telefone Secundário" value={formatarTelefone(fabricante.contato_telefone2, fabricante.contato_telefone2_ramal)} />
              <InfoItem label="Fax" value={fabricante.contato_fax || '-'} />
            </View>
            <View style={styles.column}>
              <InfoItem label="E-mail (Pedidos)" value={fabricante.contato_email_pedidos || '-'} />
              <InfoItem label="E-mail (Contato)" value={fabricante.contato_email_contato || '-'} />
              <InfoItem label="E-mail (NFe XML)" value={fabricante.contato_nfe_xml || '-'} />
            </View>
          </View>
        </View>

        {/* Condições de Pagamento */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Condições de Pagamento</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem label="Critério Pagamento" value={fabricante.criterio_pagamento?.toString() || '-'} />
              <InfoItem label="Base do Dia" value={fabricante.base_do_dia || '-'} />
              <InfoItem label="Base Até" value={fabricante.base_ate || '-'} />
              <InfoItem label="Dia Vencimento" value={fabricante.dia_vencimento || '-'} />
            </View>
            <View style={styles.column}>
              <InfoItem label="Fechamento Período" value={fabricante.fechamento_periodo || '-'} />
              <InfoItem label="Emite Nota" value={formatarBoolean(fabricante.emite_nota)} />
              <InfoItem label="Número Pedido Cliente" value={formatarBoolean(fabricante.num_ped_cli)} />
            </View>
          </View>
        </View>

        {/* Anexos */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Anexos</Text>
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <InfoItem label="Anexo TXT" value={formatarBoolean(fabricante.anexo_txt)} />
              <InfoItem label="Anexo XLS" value={formatarBoolean(fabricante.anexo_xls)} />
            </View>
            <View style={styles.column}>
              <InfoItem label="Anexo XML" value={formatarBoolean(fabricante.anexo_xml)} />
              <InfoItem label="Anexo JSON" value={formatarBoolean(fabricante.anexo_json)} />
            </View>
          </View>
        </View>

        {/* Footer */}
        <Rodape />
      </Page>
    </Document>
  );
});

FichaFabricantePDF.displayName = 'FichaFabricantePDF';
