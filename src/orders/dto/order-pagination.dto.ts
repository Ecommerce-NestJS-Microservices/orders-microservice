import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
// import { OrderStatus,  } from "../enum/order.enum"; // OrderStatus we take of Prisma. This made only for the gateway that not handle prisma
import { OrderStatusList } from "../enum/order.enum";
import { OrderStatus } from "@prisma/client";

export class OrderPaginationDto extends PaginationDto {

    @IsOptional()
    @IsEnum(OrderStatusList, {
        message: `Valid status are ${OrderStatusList}`
    })
    status: OrderStatus;

}