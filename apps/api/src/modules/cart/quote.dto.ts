import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator';

export class QuoteItemDto {
  @IsString() @Length(1,100) productId!:string;
  @Type(() => Number) @IsInt() @Min(1) @Max(99) quantity!:number;
}
export class QuoteDto {
  @IsArray() @ArrayMaxSize(20) @ValidateNested({each:true}) @Type(() => QuoteItemDto) items!:QuoteItemDto[];
  @IsOptional() @IsString() @Length(1,64) couponCode?:string;
}
