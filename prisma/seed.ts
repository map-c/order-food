import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充数据库...')

  // 清空现有数据（开发环境）
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.dish.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.user.deleteMany()

  // 创建用户（使用加密密码）
  const hashedAdminPassword = await hashPassword('admin123')
  const hashedOwnerPassword = await hashPassword('owner123')
  const hashedStaffPassword = await hashPassword('staff123')

  const admin = await prisma.user.create({
    data: {
      name: '管理员',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'owner',
    },
  })

  const owner = await prisma.user.create({
    data: {
      name: '张老板',
      email: 'owner@example.com',
      password: hashedOwnerPassword,
      role: 'owner',
    },
  })

  const staff = await prisma.user.create({
    data: {
      name: '李员工',
      email: 'staff@example.com',
      password: hashedStaffPassword,
      role: 'staff',
    },
  })

  console.log('✅ 用户创建完成')

  // 创建菜品分类
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: '热菜', icon: '🍲', sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: '凉菜', icon: '🥗', sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: '主食', icon: '🍚', sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: '汤品', icon: '🍜', sortOrder: 4 },
    }),
    prisma.category.create({
      data: { name: '饮品', icon: '🥤', sortOrder: 5 },
    }),
  ])

  console.log('✅ 分类创建完成')

  // 创建菜品
  const dishes = await Promise.all([
    // 热菜
    prisma.dish.create({
      data: {
        name: '宫保鸡丁',
        categoryId: categories[0].id,
        price: 38,
        image: 'https://images.unsplash.com/photo-1603073163308-9c61992e3e1c?w=400',
        description: '经典川菜，麻辣鲜香',
        isAvailable: true,
      },
    }),
    prisma.dish.create({
      data: {
        name: '鱼香肉丝',
        categoryId: categories[0].id,
        price: 35,
        image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400',
        description: '酸甜适口',
        isAvailable: true,
      },
    }),
    prisma.dish.create({
      data: {
        name: '红烧肉',
        categoryId: categories[0].id,
        price: 48,
        image: 'https://images.unsplash.com/photo-1626804475292-c0bb51b0e849?w=400',
        description: '肥而不腻，入口即化',
        isAvailable: true,
        isSoldOut: true,
      },
    }),
    // 凉菜
    prisma.dish.create({
      data: {
        name: '夫妻肺片',
        categoryId: categories[1].id,
        price: 28,
        image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400',
        description: '麻辣鲜香',
        isAvailable: true,
      },
    }),
    prisma.dish.create({
      data: {
        name: '拍黄瓜',
        categoryId: categories[1].id,
        price: 12,
        image: 'https://images.unsplash.com/photo-1604908815879-6cc44b5d6e5e?w=400',
        description: '清爽开胃',
        isAvailable: true,
      },
    }),
    // 主食
    prisma.dish.create({
      data: {
        name: '米饭',
        categoryId: categories[2].id,
        price: 3,
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
        description: '优质东北大米',
        isAvailable: true,
      },
    }),
    prisma.dish.create({
      data: {
        name: '蛋炒饭',
        categoryId: categories[2].id,
        price: 18,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        description: '粒粒分明',
        isAvailable: true,
      },
    }),
    // 汤品
    prisma.dish.create({
      data: {
        name: '西红柿蛋汤',
        categoryId: categories[3].id,
        price: 15,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        description: '酸甜开胃',
        isAvailable: true,
      },
    }),
    // 饮品
    prisma.dish.create({
      data: {
        name: '可乐',
        categoryId: categories[4].id,
        price: 8,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
        description: '冰镇可乐',
        isAvailable: true,
      },
    }),
    prisma.dish.create({
      data: {
        name: '酸梅汤',
        categoryId: categories[4].id,
        price: 10,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
        description: '自制酸梅汤',
        isAvailable: true,
      },
    }),
  ])

  console.log('✅ 菜品创建完成')

  // 创建桌台
  const tables = await Promise.all([
    prisma.table.create({
      data: { number: 'A1', capacity: 2, status: 'available' },
    }),
    prisma.table.create({
      data: { number: 'A2', capacity: 2, status: 'available' },
    }),
    prisma.table.create({
      data: { number: 'A3', capacity: 4, status: 'occupied' },
    }),
    prisma.table.create({
      data: { number: 'A4', capacity: 4, status: 'available' },
    }),
    prisma.table.create({
      data: { number: 'B1', capacity: 6, status: 'available' },
    }),
    prisma.table.create({
      data: { number: 'B2', capacity: 6, status: 'reserved' },
    }),
    prisma.table.create({
      data: { number: 'B3', capacity: 8, status: 'available' },
    }),
    prisma.table.create({
      data: { number: 'C1', capacity: 10, status: 'available' },
    }),
  ])

  console.log('✅ 桌台创建完成')

  // 创建示例订单
  const order1 = await prisma.order.create({
    data: {
      orderNo: `ORD${Date.now()}`,
      tableId: tables[2].id, // A3 桌
      status: 'preparing',
      totalPrice: 129,
      isPaid: false,
      userId: staff.id,
      items: {
        create: [
          {
            dishId: dishes[0].id, // 宫保鸡丁
            quantity: 1,
            unitPrice: 38,
            subtotal: 38,
          },
          {
            dishId: dishes[1].id, // 鱼香肉丝
            quantity: 1,
            unitPrice: 35,
            subtotal: 35,
          },
          {
            dishId: dishes[3].id, // 夫妻肺片
            quantity: 1,
            unitPrice: 28,
            subtotal: 28,
          },
          {
            dishId: dishes[5].id, // 米饭
            quantity: 2,
            unitPrice: 3,
            subtotal: 6,
          },
          {
            dishId: dishes[7].id, // 西红柿蛋汤
            quantity: 1,
            unitPrice: 15,
            subtotal: 15,
          },
          {
            dishId: dishes[8].id, // 可乐
            quantity: 1,
            unitPrice: 8,
            subtotal: 8,
          },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNo: `ORD${Date.now() + 1}`,
      tableId: tables[5].id, // B2 桌
      status: 'completed',
      totalPrice: 96,
      paidAmount: 96,
      isPaid: true,
      payMethod: 'wechat',
      userId: staff.id,
      items: {
        create: [
          {
            dishId: dishes[1].id, // 鱼香肉丝
            quantity: 1,
            unitPrice: 35,
            subtotal: 35,
          },
          {
            dishId: dishes[4].id, // 拍黄瓜
            quantity: 1,
            unitPrice: 12,
            subtotal: 12,
          },
          {
            dishId: dishes[6].id, // 蛋炒饭
            quantity: 2,
            unitPrice: 18,
            subtotal: 36,
          },
          {
            dishId: dishes[9].id, // 酸梅汤
            quantity: 1,
            unitPrice: 10,
            subtotal: 10,
          },
        ],
      },
    },
  })

  console.log('✅ 订单创建完成')

  console.log('\n🎉 数据库填充完成！')
  console.log(`   - 用户: ${3} 个`)
  console.log(`   - 分类: ${categories.length} 个`)
  console.log(`   - 菜品: ${dishes.length} 个`)
  console.log(`   - 桌台: ${tables.length} 个`)
  console.log(`   - 订单: ${2} 个`)
  console.log('\n📝 测试账号信息：')
  console.log('   管理员: admin@example.com / admin123')
  console.log('   店主: owner@example.com / owner123')
  console.log('   员工: staff@example.com / staff123')
}

main()
  .catch((e) => {
    console.error('❌ 数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
