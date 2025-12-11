import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Criar role Admin
    const adminRole = await prisma.userRole.upsert({
      where: { slug: 'admin' },
      update: {},
      create: {
        id: 'admin-role-id-001',
        slug: 'admin',
        name: 'Administrador',
        description: 'Acesso total ao sistema',
        isProtected: true,
        isDefault: false,
      },
    });
    console.log('✅ Role Admin criada');

    // Criar role User
    const userRole = await prisma.userRole.upsert({
      where: { slug: 'user' },
      update: {},
      create: {
        id: 'user-role-id-001',
        slug: 'user',
        name: 'Usuário',
        description: 'Acesso básico ao sistema',
        isProtected: false,
        isDefault: true,
      },
    });
    console.log('✅ Role User criada');

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@tremonte.com' },
      update: {},
      create: {
        id: 'admin-user-id-001',
        email: 'admin@tremonte.com',
        password: hashedPassword,
        name: 'Administrador',
        roleId: adminRole.id,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('✅ Usuário admin criado: admin@tremonte.com / admin123');

    // Criar permissões básicas
    const permissions = [
      { slug: 'users.view', name: 'Visualizar Usuários', description: 'Permite visualizar lista de usuários' },
      { slug: 'users.create', name: 'Criar Usuários', description: 'Permite criar novos usuários' },
      { slug: 'users.edit', name: 'Editar Usuários', description: 'Permite editar usuários existentes' },
      { slug: 'users.delete', name: 'Excluir Usuários', description: 'Permite excluir usuários' },
      { slug: 'roles.view', name: 'Visualizar Perfis', description: 'Permite visualizar perfis' },
      { slug: 'roles.create', name: 'Criar Perfis', description: 'Permite criar perfis' },
      { slug: 'roles.edit', name: 'Editar Perfis', description: 'Permite editar perfis' },
      { slug: 'roles.delete', name: 'Excluir Perfis', description: 'Permite excluir perfis' },
      { slug: 'permissions.view', name: 'Visualizar Permissões', description: 'Permite visualizar permissões' },
      { slug: 'permissions.create', name: 'Criar Permissões', description: 'Permite criar permissões' },
      { slug: 'permissions.edit', name: 'Editar Permissões', description: 'Permite editar permissões' },
      { slug: 'permissions.delete', name: 'Excluir Permissões', description: 'Permite excluir permissões' },
      { slug: 'clients.view', name: 'Visualizar Clientes', description: 'Permite visualizar clientes' },
      { slug: 'clients.create', name: 'Criar Clientes', description: 'Permite criar clientes' },
      { slug: 'clients.edit', name: 'Editar Clientes', description: 'Permite editar clientes' },
      { slug: 'clients.delete', name: 'Excluir Clientes', description: 'Permite excluir clientes' },
      { slug: 'vendors.view', name: 'Visualizar Vendedores', description: 'Permite visualizar vendedores' },
      { slug: 'vendors.create', name: 'Criar Vendedores', description: 'Permite criar vendedores' },
      { slug: 'vendors.edit', name: 'Editar Vendedores', description: 'Permite editar vendedores' },
      { slug: 'vendors.delete', name: 'Excluir Vendedores', description: 'Permite excluir vendedores' },
      { slug: 'manufacturers.view', name: 'Visualizar Fabricantes', description: 'Permite visualizar fabricantes' },
      { slug: 'manufacturers.create', name: 'Criar Fabricantes', description: 'Permite criar fabricantes' },
      { slug: 'manufacturers.edit', name: 'Editar Fabricantes', description: 'Permite editar fabricantes' },
      { slug: 'manufacturers.delete', name: 'Excluir Fabricantes', description: 'Permite excluir fabricantes' },
      { slug: 'products.view', name: 'Visualizar Produtos', description: 'Permite visualizar produtos' },
      { slug: 'products.create', name: 'Criar Produtos', description: 'Permite criar produtos' },
      { slug: 'products.edit', name: 'Editar Produtos', description: 'Permite editar produtos' },
      { slug: 'products.delete', name: 'Excluir Produtos', description: 'Permite excluir produtos' },
      { slug: 'reports.view', name: 'Visualizar Relatórios', description: 'Permite visualizar relatórios' },
      { slug: 'reports.export', name: 'Exportar Relatórios', description: 'Permite exportar relatórios' },
      { slug: 'dashboard.view', name: 'Visualizar Dashboard', description: 'Permite visualizar dashboard' },
    ];

    for (const perm of permissions) {
      const permission = await prisma.userPermission.upsert({
        where: { slug: perm.slug },
        update: {},
        create: {
          id: `perm-${perm.slug}-001`,
          slug: perm.slug,
          name: perm.name,
          description: perm.description,
        },
      });

      // Associar todas as permissões ao role admin
      await prisma.userRolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          id: `role-perm-${perm.slug}-001`,
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`✅ ${permissions.length} permissões criadas e associadas ao admin`);

    // Criar configurações do sistema
    await prisma.systemSetting.upsert({
      where: { id: 'system-settings-001' },
      update: {},
      create: {
        id: 'system-settings-001',
        name: 'Tremonte',
        active: true,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        currencyFormat: 'R$ {value}',
      },
    });
    console.log('✅ Configurações do sistema criadas');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📧 Credenciais de acesso:');
    console.log('   Email: admin@tremonte.com');
    console.log('   Senha: admin123');
    console.log('\n🌐 Acesse: http://localhost:3000\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
