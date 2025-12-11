import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo, useMemo } from 'react';

const LOGO_URL = '../../../media/images/logo_fundo.png';

interface Cliente {
  id: number;
  razao_social?: string;
  fantasia?: string;
  cnpj?: string;
  grupo_clientes?: number;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: number;
  cep?: string;
  inscricao_estadual?: string;
  contato_email?: string;
  contato_nome?: string;
  contato_telefone?: string;
  contato_telefone_ramal?: string;
  contato_celular?: string;
  contato_radio?: string;
  contato_fax?: string;
  contato_regiao?: number;
  fk_vendedor?: number;
  entrega_endereco?: string;
  entrega_bairro?: string;
  entrega_cidade?: string;
  entrega_estado?: number;
  entrega_cep?: string;
  entrega_nfexml?: string;
  cobranca_endereco?: string;
  cobranca_bairro?: string;
  cobranca_cidade?: string;
  cobranca_estado?: number;
  cobranca_cep?: string;
  transportadora?: number;
  situacao?: boolean;
  situacao_desde?: string;
  situacao_ate?: string;
  receber_email_servico?: boolean;
  habilitado?: boolean;
  criterio_pagamento?: number;
  motivo_bloqueio?: number;
  status?: boolean;
  observacao?: string;
}

interface FichaClientePDFProps {
  cliente: Cliente;
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

const formatarData = (data?: string) =>
  data ? new Date(data).toLocaleDateString('pt-BR') : '-';

const formatarTelefone = (telefone?: string, ramal?: string): string => {
  if (!telefone) return '-';
  return ramal ? `${telefone} (${ramal})` : telefone;
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

export const FichaClientePDF = memo(({ cliente }: FichaClientePDFProps) => {
  const clienteStatus = cliente.status === undefined ? true : cliente.status;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={LOGO_URL} style={styles.logo} />
          <Text style={styles.headerTitle}>Ficha do Cliente</Text>
        </View>

        {/* Dados Principais */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Dados Principais</Text>
          <InfoItem label="ID" value={cliente.id.toString()} />
          <InfoItem
            label="Status"
            value={
              <Text style={clienteStatus ? styles.statusBadge : styles.statusBadgeInactive}>
                {clienteStatus ? 'Ativo' : 'Inativo'}
              </Text>
            }
          />
          <InfoItem label="Razão Social" value={cliente.razao_social || '-'} />
          <InfoItem label="Nome Fantasia" value={cliente.fantasia || '-'} />
          <InfoItem label="CNPJ" value={cliente.cnpj || '-'} />
          <InfoItem label="Inscrição Estadual" value={cliente.inscricao_estadual || '-'} />
        </View>

        {/* Contato */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Contato</Text>
          <InfoItem label="Nome" value={cliente.contato_nome || '-'} />
          <InfoItem label="Telefone" value={formatarTelefone(cliente.contato_telefone, cliente.contato_telefone_ramal)} />
          <InfoItem label="Celular" value={cliente.contato_celular || '-'} />
          <InfoItem label="E-mail" value={cliente.contato_email || '-'} />
        </View>

        {/* Endereço Principal */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Endereço Principal</Text>
          <InfoItem label="Endereço" value={cliente.endereco || '-'} />
          <InfoItem label="Bairro" value={cliente.bairro || '-'} />
          <InfoItem label="Cidade" value={cliente.cidade || '-'} />
          <InfoItem label="CEP" value={cliente.cep || '-'} />
        </View>

        {/* Endereço de Entrega */}
        {(cliente.entrega_endereco || cliente.entrega_cidade) && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Endereço de Entrega</Text>
            <InfoItem label="Endereço" value={cliente.entrega_endereco || '-'} />
            <InfoItem label="Bairro" value={cliente.entrega_bairro || '-'} />
            <InfoItem label="Cidade" value={cliente.entrega_cidade || '-'} />
            <InfoItem label="CEP" value={cliente.entrega_cep || '-'} />
          </View>
        )}

        {/* Endereço de Cobrança */}
        {(cliente.cobranca_endereco || cliente.cobranca_cidade) && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Endereço de Cobrança</Text>
            <InfoItem label="Endereço" value={cliente.cobranca_endereco || '-'} />
            <InfoItem label="Bairro" value={cliente.cobranca_bairro || '-'} />
            <InfoItem label="Cidade" value={cliente.cobranca_cidade || '-'} />
            <InfoItem label="CEP" value={cliente.cobranca_cep || '-'} />
          </View>
        )}

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Configurações</Text>
          <InfoItem label="Situação" value={cliente.situacao ? 'Ativa' : 'Inativa'} />
          <InfoItem label="Situação Desde" value={formatarData(cliente.situacao_desde)} />
          <InfoItem label="Situação Até" value={formatarData(cliente.situacao_ate)} />
          <InfoItem label="Habilitado" value={cliente.habilitado ? 'Sim' : 'Não'} />
          <InfoItem label="Receber E-mail de Serviço" value={cliente.receber_email_servico ? 'Sim' : 'Não'} />
        </View>

        {/* Observações */}
        {cliente.observacao && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Observações</Text>
            <Text style={styles.value}>{cliente.observacao}</Text>
          </View>
        )}

        {/* Footer */}
        <Rodape />
      </Page>
    </Document>
  );
});

FichaClientePDF.displayName = 'FichaClientePDF';
