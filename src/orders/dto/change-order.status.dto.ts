import { OrderStatus } from '@prisma/client';
import { OrderStatusList } from '../enum/order.enum';
import { IsEnum, IsUUID } from 'class-validator';
export class ChangeOrderStatusDto {
    
    @IsUUID(4)
    id: string

    @IsEnum(OrderStatusList, {
        message: `Valid status are ${OrderStatusList}`
    })
    status: OrderStatus;
}