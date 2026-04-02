import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

const products = [
  {
    name: "LED Outdoor Pro P4.81",
    category: "Уличные",
    pixelPitch: "4.81 мм",
    brightness: 6500,
    refreshRate: 3840,
    cabinetSize: "500x1000 мм",
    warranty: "3 года",
    priceFrom: 95000,
    description:
      "Надежный уличный экран для фасадов, медиафасадов и рекламных конструкций. Высокая яркость и устойчивость к погодным условиям.",
    imageUrl: null,
    isFeatured: true,
  },
  {
    name: "LED Indoor FinePitch P1.86",
    category: "Интерьерные",
    pixelPitch: "1.86 мм",
    brightness: 900,
    refreshRate: 3840,
    cabinetSize: "640x480 мм",
    warranty: "3 года",
    priceFrom: 145000,
    description:
      "Интерьерное решение премиум-класса для шоурумов, конференц-залов и ТВ-студий с высокой детализацией изображения.",
    imageUrl: null,
    isFeatured: true,
  },
  {
    name: "LED Rental Stage P2.97",
    category: "Арендные",
    pixelPitch: "2.97 мм",
    brightness: 4500,
    refreshRate: 3840,
    cabinetSize: "500x500 мм",
    warranty: "2 года",
    priceFrom: 119000,
    description:
      "Сценический экран для мероприятий, легко собирается и транспортируется. Оптимален для прокатных проектов.",
    imageUrl: null,
    isFeatured: true,
  },
  {
    name: "LED Transparent P3.91-7.82",
    category: "Прозрачные",
    pixelPitch: "3.91-7.82 мм",
    brightness: 5000,
    refreshRate: 3840,
    cabinetSize: "1000x500 мм",
    warranty: "2 года",
    priceFrom: 168000,
    description:
      "Прозрачный LED-экран для витрин и стеклянных фасадов. Сохраняет светопропускание и создает эффектный digital-образ.",
    imageUrl: null,
    isFeatured: false,
  },
];

async function main() {
  await prisma.lead.deleteMany();
  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        slug: slugify(product.name),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
