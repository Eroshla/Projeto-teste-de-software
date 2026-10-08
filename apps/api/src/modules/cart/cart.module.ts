import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CouponsModule } from '../coupons/coupons.module';
import { PrismaService } from '../../prisma.service';

@Module({imports:[CouponsModule],controllers:[CartController],providers:[CartService,PrismaService]})
export class CartModule {}
