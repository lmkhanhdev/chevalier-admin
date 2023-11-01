import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET (
    req: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        
        if (!params.orderId) {
            return new NextResponse("OrderId id is required", { status: 400 })
        }

        const order = await prismadb.order.findUnique({
            where: {
                id: params.orderId,
            },
           
        })

        return NextResponse.json(order)
    } catch (error) {
        console.log('[ORDER_GET]',error);
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function PATCH (
    req: Request,
    { params }: { params: { storeId: string, orderId: string } }
) {
    try {
        const { userId } = auth()
        const body = await req.json()

        const { isConfirm } = body

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }
    
        if (!params.orderId) {
            return new NextResponse("OrderId id is required", { status: 400 })
        }
        
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const order = await prismadb.order.updateMany({
            where: {
                id: params.orderId,
            },
            data: {
                isConfirm
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.log('[ORDER_PATCH]',error);
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, orderId: string } }
  ) {
    try {
      const { userId } = auth();
  
      if (!userId) {
        return new NextResponse("Unauthenticated", { status: 401 });
      }
  
      if (!params.orderId) {
        return new NextResponse("Order id is required", { status: 400 });
      }
  
      const storeByUserId = await prismadb.store.findFirst({
        where: {
          id: params.storeId,
          userId,
        },
      });
  
      if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
  
      // Trước tiên, xóa tất cả các OrderItem liên quan đến Order
      await prismadb.orderItem.deleteMany({
        where: {
          orderId: params.orderId,
        },
      });
  
      // Sau đó, xóa Order
      const order = await prismadb.order.delete({
        where: {
          id: params.orderId,
        },
      });
  
      return NextResponse.json(order);
    } catch (error) {
      console.log("[ORDER_DELETE]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
}