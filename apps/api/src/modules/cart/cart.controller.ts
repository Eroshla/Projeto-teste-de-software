import { Body, Controller, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { QuoteDto } from './quote.dto';

@Controller('cart')
export class CartController { constructor(private readonly service:CartService) {} @Post('quote') quote(@Body() dto:QuoteDto) { return this.service.quote(dto); } }
