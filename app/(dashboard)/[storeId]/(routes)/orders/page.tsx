import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              price: true,
              size: true,
            },
          },
        },
      },
      userInfo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => {
    const sizes = new Set(); // Sử dụng một Set để đảm bảo không có kích thước trùng lặp
    item.orderItems.forEach((orderItem) => {
      sizes.add(orderItem.product.size);
    });
    return {
      id: item.id,
      name: `${item.userInfo?.firstName ?? ""} ${
        item.userInfo?.lastName ?? ""
      }`,
      phone: item.userInfo?.phoneNumber ?? "",
      address: item.address,
      products: item.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      size: Array.from(sizes).join(", "),
      totalPrice: formatter.format(
        item.orderItems.reduce((total, orderItem) => {
          return total + Number(orderItem.product.price);
        }, 0)
      ),
      isConfirm: item.isConfirm,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    };
  });
  console.log(formattedOrders);
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
