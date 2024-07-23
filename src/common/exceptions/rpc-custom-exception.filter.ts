import { Catch, RpcExceptionFilter, ArgumentsHost, UnauthorizedException, ExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
// export class RpcCustomExceptionFilter implements RpcExceptionFilter<RpcException> {
export class RpcCustomExceptionFilter implements ExceptionFilter {
    // catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    catch(exception: RpcException, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse();


        const rpcError = exception.getError();
        //  console.log({rpcError})

        if (
            typeof rpcError === 'object' &&
            'status' in rpcError &&
            'message' in rpcError
        ) {
            const status = isNaN(+rpcError.status)? 400 : +rpcError.status;
            return response.status(status).json(rpcError);
        }



        response.status(400).json({
            status: 400,
            message: rpcError,
        })



        // console.log('Paso por aqui en neustro custom filter');
        // return throwError(() => exception.getError());
        // throw new UnauthorizedException('Hola mundo')
    }
}