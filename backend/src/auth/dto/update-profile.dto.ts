import { 
  IsDateString, 
  IsIn, 
  IsOptional, 
  IsString, 
  Matches 
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, { message: '전화번호는 10-11자리 숫자여야 합니다.' })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  interests?: any;
}