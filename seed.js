const PrismaClient = require("@prisma/client").PrismaClient;
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
  // Permission list
  const permissionData = [
    { name: "USER_VIEW", description: "Can view user profiles" },
    { name: "USER_CREATE", description: "Can create users" },
    { name: "USER_UPDATE", description: "Can update users" },
    { name: "USER_DELETE", description: "Can delete users" },
    { name: "USER_VERIFY", description: "Can verify/unverify users" },
    { name: "ROLE_VIEW", description: "Can view roles" },
    { name: "ROLE_CREATE", description: "Can create roles" },
    { name: "ROLE_UPDATE", description: "Can update roles" },
    { name: "ROLE_DELETE", description: "Can delete roles" },
    { name: "PERMISSION_VIEW", description: "Can view permissions" },
    {
      name: "PERMISSION_ASSIGN",
      description: "Can assign permissions to roles",
    },
    { name: "ITEM_LOST_CREATE", description: "Can create lost item reports" },
    { name: "ITEM_LOST_UPDATE", description: "Can update lost item reports" },
    { name: "ITEM_LOST_DELETE", description: "Can delete lost item reports" },
    { name: "ITEM_FOUND_CREATE", description: "Can create found item reports" },
    { name: "ITEM_FOUND_UPDATE", description: "Can update found item reports" },
    { name: "ITEM_FOUND_DELETE", description: "Can delete found item reports" },
    { name: "CLAIM_CREATE", description: "Can create claims" },
    { name: "CLAIM_VIEW", description: "Can view claims" },
    { name: "CLAIM_UPDATE", description: "Can update claims" },
    { name: "CLAIM_DELETE", description: "Can delete claims" },
    { name: "CLAIM_APPROVE", description: "Can approve claims" },
    { name: "CLAIM_REJECT", description: "Can reject claims" },
    { name: "CLAIM_RESOLVE", description: "Can resolve claims" },
    { name: "MESSAGE_VIEW", description: "Can view messages in claims" },
    { name: "MESSAGE_SEND", description: "Can send messages in claims" },
    { name: "NOTIFICATION_VIEW", description: "Can view notifications" },
    {
      name: "NOTIFICATION_MANAGE",
      description: "Can create or manage notifications",
    },
    { name: "REPORT_VIEW", description: "Can view system reports" },
    { name: "CATEGORY_MANAGE", description: "Can manage item categories" },
    { name: "SETTINGS_MANAGE", description: "Can manage system settings" },
    { name: "ADMIN_PANEL_ACCESS", description: "Can access admin dashboard" },
  ];

  // Upsert permissions
  for (const perm of permissionData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Upsert roles
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Administrator with full system access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: {
      name: "User",
      description: "Standard user with limited permissions",
    },
  });

  // Fetch all permissions
  const allPermissions = await prisma.permission.findMany();

  // User role permissions
  const userPermissionNames = [
    "ITEM_LOST_CREATE",
    "ITEM_LOST_UPDATE",
    "ITEM_FOUND_CREATE",
    "ITEM_FOUND_UPDATE",
    "CLAIM_CREATE",
    "CLAIM_VIEW",
    "MESSAGE_VIEW",
    "MESSAGE_SEND",
    "NOTIFICATION_VIEW",
  ];

  // Assign Admin all permissions
  for (const perm of allPermissions) {
    const exists = await prisma.rolePermission.findFirst({
      where: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });

    if (!exists) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // Assign User limited permissions
  for (const permName of userPermissionNames) {
    const perm = allPermissions.find((p) => p.name === permName);
    if (perm) {
      const exists = await prisma.rolePermission.findFirst({
        where: {
          roleId: userRole.id,
          permissionId: perm.id,
        },
      });

      if (!exists) {
        await prisma.rolePermission.create({
          data: {
            roleId: userRole.id,
            permissionId: perm.id,
          },
        });
      }
    }
  }

  // Create admin user (if not exists)
  const adminEmail = "admin@example.com";
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "09123456789",
        verified: true,
        isDefault: true,
        role: { connect: { id: adminRole.id } },
      },
    });

    console.log(
      `Admin user created with email: ${adminEmail} and password: Admin@123`
    );
  } else {
    console.log(`Admin user already exists`);
  }

  // Create categories
  const categoryData = [
    {
      "name": "HUMAN",
      "description": "Missing persons, lost children, elderly people, etc.",
      "isAlive": true
    },
    {
      name: "PETS",
      description: "Lost pets such as dogs, cats, birds",
      isAlive: true,
    },
    {
      name: "VEHICLES",
      description: "Cars, bikes, motorcycles",
      isAlive: false,
    },
    {
      name: "ELECTRONICS",
      description: "Phones, laptops, etc.",
      isAlive: false,
    },
    { name: "DOCUMENTS", description: "Passports, IDs, etc.", isAlive: false },
    { name: "JEWELRY", description: "Rings, necklaces, etc.", isAlive: false },
    { name: "CASH", description: "Lost money", isAlive: false },
    { name: "BAGS", description: "Backpacks, handbags", isAlive: false },
    { name: "KEYS", description: "House keys, car keys", isAlive: false },
    { name: "WALLET", description: "Wallets with cash/cards", isAlive: false },
    { name: "EYEWEAR", description: "Glasses, sunglasses", isAlive: false },
    { name: "CLOTHING", description: "Clothes, jackets", isAlive: false },
    { name: "BOOKS", description: "Books, notebooks", isAlive: false },
    { name: "TOYS", description: "Toys, stuffed animals", isAlive: false },
    { name: "SPORTS_EQUIPMENT", description: "Balls, rackets", isAlive: false },
    {
      name: "HOME_APPLIANCES",
      description: "Small home appliances",
      isAlive: false,
    },
    {
      name: "MEDICAL_ITEMS",
      description: "Medical devices or medication",
      isAlive: false,
    },
    { name: "STATIONERY", description: "Pens, pencils", isAlive: false },
    {
      name: "GADGETS",
      description: "Smartwatches, headphones",
      isAlive: false,
    },
    {
      name: "ACCESSORIES",
      description: "Belts, scarves, etc.",
      isAlive: false,
    },
    { name: "OTHER", description: "Other miscellaneous items", isAlive: false },
  ];

  for (const cat of categoryData) {
    await prisma.categoryType.upsert({
      where: { name: cat.name },
      update: {
        description: cat.description,
        isAlive: cat.isAlive,
      },
      create: cat,
    });
  }
  console.log("Categories seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
