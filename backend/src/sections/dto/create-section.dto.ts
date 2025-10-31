import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Production' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
