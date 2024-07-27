import { OrderPaginationDto } from './dto/order-pagination.dto';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto } from './dto/change-order.status.dto';
import { PRODUCT_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {
    super();
  }


  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected')
  }


  async create(createOrderDto: CreateOrderDto) {
    // const ids = [10, 12];
    try {
      //1. Confirm Products' id  
      // item is array of objects, this contain atributes like productId
      const productIds = createOrderDto.items.map(item => item.productId)
      // with firstValueFrom become observable into promise
      const products: any[] = await firstValueFrom(
        this.productsClient.send(
          { cmd: 'validate_products' },
          productIds,
        )
      )

      //2. calculation of values
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;
        return acc + price * orderItem.quantity;
      }, 0);

      // return { totalAmount };
      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0)

      //return { totalItems }
      //3. Create transaction of database
      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(
                  product => product.id === orderItem.productId).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity
              }))
            }
          }
        },
        include: {
          //OrderItem: true
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            }
          }
        }
      });
      // return order
      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find(product => product.id === orderItem.productId).name,
        })),
      };

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs'
      })
    }
    //other way with obervable (send)
    // const products = this.productsClient.send(
    //    { cmd: 'validate_products' },
    //    ids,

    // prueba
    // return {
    //   service: 'Orders Microservice',
    //   createOrderDto: createOrderDto,
    // }

    // prueba
    // return this.order.create({
    //   data: createOrderDto
    // })
  }
  async findOne(id: string) {

    const order = await this.order.findFirst({
      where: { id },
      include: {
        //OrderItem: true
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          }
        }
      }
    })

    const productIds = order.OrderItem.map(item => item.productId)

    // with firstValueFrom become observable into promise
    const products: any[] = await firstValueFrom(
      this.productsClient.send(
        { cmd: 'validate_products' },
        productIds
      )
    )

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with ${id} not found XD`
      })
    }

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find(product => product.id === orderItem.productId).name,
      })),
    };

  }
  async findAll(orderPaginationDto: OrderPaginationDto) {

    const totalOrders = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    })

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status
        }
      }),
      meta: {
        total: totalOrders,
        page: currentPage,
        lastPage: Math.ceil(totalOrders / perPage)
      }



    }
  }



  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id: id },
      data: { status: status }
    });
  }

}
