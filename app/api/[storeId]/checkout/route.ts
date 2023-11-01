import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    const { productIds, userInfo } = await req.json();

    if (!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 });
    }

    // Tạo đơn hàng mà không tạo userInfo nếu không có dữ liệu userInfo
    const orderData: any = {
        store: {
            connect: {
                id: params.storeId
            }
        },
        isConfirm: false,
        phone: userInfo && userInfo.phone ? userInfo.phone : "",
        address: userInfo && userInfo.address ? userInfo.address : "",
        orderItems: {
            create: productIds.map((productId: string) => ({
                product: {
                    connect: {
                        id: productId
                    }
                }
            }))
        }
    };

    if (userInfo && (userInfo.firstName || userInfo.lastName || userInfo.email || userInfo.phoneNumber)) {
        orderData.userInfo = {
            create: {
                firstName: userInfo.firstName || "",
                lastName: userInfo.lastName || "",
                email: userInfo.email || "",
                phoneNumber: userInfo.phoneNumber || "",
                address: userInfo.address || "",
            }
        };
    }

    // Tạo đơn hàng
    const order = await prismadb.order.create({
        data: orderData
    });

    return NextResponse.json({ orderId: order.id }, {
        headers: corsHeaders
    });
}
