import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ProductsModule } from './modules/products/products.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CartModule } from './modules/cart/cart.module';

@Module({imports:[ConfigModule.forRoot({isGlobal:true,envFilePath:['../../.env','.env']}),ProductsModule,CouponsModule,CartModule],controllers:[AppController]})
export class AppModule {}
