import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 1, description: 'Role ID (1=SuperAdmin, 2=Admin, 3=User)' })
  @IsNumber()
  roleId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  sectionId?: number;
}
