import { OrderStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";

export class CreateOrderDto {

    @IsNumber()
    @IsPositive()
    totalAmount: number; // the same like schema prisma

    @IsNumber()
    @IsPositive()
    totalItems: number;

    @IsEnum(OrderStatusList, {
        message: `Possible status values are $ {OrderStatusList}`
    }) // especify value unique It' must be contain 
    @IsOptional() // if don't  send me nothing , the status will be pending
    status: OrderStatus = OrderStatus.PENDING

    @IsBoolean()
    @IsOptional()// it could be innecesary since the paid must be false at start, likewise, I will leave it so they can see that it can be done.
    paid: boolean = false;





}
