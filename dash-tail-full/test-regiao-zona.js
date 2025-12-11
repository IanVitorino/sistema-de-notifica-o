const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/tremonte'
    }
  }
});

async function testRegiaoZona() {
  try {
    console.log('========================================');
    console.log('TESTE DE REGIÃO E ZONA');
    console.log('========================================\n');

    // 1. Verificar total de registros
    console.log('1. Total de registros em tremonte_regiao_zona:');
    const total = await prisma.tremonte_regiao_zona.count();
    console.log(`   Total: ${total} registros\n`);

    // 2. Listar primeiros 10 registros
    console.log('2. Primeiros 10 registros:');
    const registros = await prisma.tremonte_regiao_zona.findMany({
      take: 10,
      orderBy: { id: 'asc' }
    });

    if (registros.length === 0) {
      console.log('   ⚠️  NENHUM REGISTRO ENCONTRADO!\n');
    } else {
      registros.forEach(r => {
        console.log(`   ID: ${r.id} | Região: ${r.codigo_regiao} - ${r.descricao_regiao} | Zona: ${r.codigo_zona} - ${r.descricao_zona_estatica}`);
      });
      console.log('');
    }

    // 3. Verificar relacionamento com clientes
    console.log('3. Testando relacionamento com clientes:');
    const regiaoComClientes = await prisma.tremonte_regiao_zona.findFirst({
      include: {
        tremonte_cliente: {
          take: 5
        }
      },
      where: {
        tremonte_cliente: {
          some: {}
        }
      }
    });

    if (regiaoComClientes) {
      console.log(`   ✓ Região encontrada: ${regiaoComClientes.descricao_regiao}`);
      console.log(`   ✓ Total de clientes vinculados: ${regiaoComClientes.tremonte_cliente.length}`);
      regiaoComClientes.tremonte_cliente.forEach(c => {
        console.log(`     - Cliente: ${c.razao_social || c.nome_fantasia}`);
      });
    } else {
      console.log('   ⚠️  Nenhum cliente vinculado a regiões/zonas\n');
    }
    console.log('');

    // 4. Verificar relacionamento com vendedores
    console.log('4. Testando relacionamento com vendedores:');
    const regiaoComVendedores = await prisma.tremonte_regiao_zona.findFirst({
      include: {
        tremonte_vendedor_regiao: {
          take: 5,
          include: {
            tremonte_vendedor: true
          }
        }
      },
      where: {
        tremonte_vendedor_regiao: {
          some: {}
        }
      }
    });

    if (regiaoComVendedores) {
      console.log(`   ✓ Região encontrada: ${regiaoComVendedores.descricao_regiao}`);
      console.log(`   ✓ Total de vendedores vinculados: ${regiaoComVendedores.tremonte_vendedor_regiao.length}`);
      regiaoComVendedores.tremonte_vendedor_regiao.forEach(vr => {
        if (vr.tremonte_vendedor) {
          console.log(`     - Vendedor: ${vr.tremonte_vendedor.nome}`);
        }
      });
    } else {
      console.log('   ⚠️  Nenhum vendedor vinculado a regiões/zonas\n');
    }
    console.log('');

    // 5. Testar consulta por código
    console.log('5. Testando busca por código de região:');
    const primeiraRegiao = registros.length > 0 ? registros[0] : null;
    if (primeiraRegiao && primeiraRegiao.codigo_regiao) {
      const buscaPorCodigo = await prisma.tremonte_regiao_zona.findMany({
        where: {
          codigo_regiao: primeiraRegiao.codigo_regiao
        }
      });
      console.log(`   ✓ Buscando por código: ${primeiraRegiao.codigo_regiao}`);
      console.log(`   ✓ Encontrados: ${buscaPorCodigo.length} registros\n`);
    } else {
      console.log('   ⚠️  Não há código de região para testar\n');
    }

    // 6. Estatísticas
    console.log('6. Estatísticas:');
    const regioes = await prisma.tremonte_regiao_zona.groupBy({
      by: ['codigo_regiao', 'descricao_regiao'],
      _count: true
    });
    console.log(`   Total de regiões únicas: ${regioes.length}`);
    regioes.slice(0, 5).forEach(r => {
      console.log(`     - ${r.descricao_regiao || r.codigo_regiao}: ${r._count} registros`);
    });
    console.log('');

    console.log('========================================');
    console.log('TESTE CONCLUÍDO COM SUCESSO! ✓');
    console.log('========================================');

  } catch (error) {
    console.error('❌ ERRO durante o teste:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegiaoZona();
