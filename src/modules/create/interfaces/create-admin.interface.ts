import { IsDate, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

import { IsString } from "class-validator";

export class CreateAdminRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ticker: string;

  @IsOptional()
  @IsString()
  creator_wallet_address: string | null;

  @IsString()
  @IsNotEmpty()
  sound_url: string;

  @IsString()
  @IsNotEmpty()
  pfp_url: string;

  @IsOptional()
  @IsNumber()
  vault_percentage?: number;

  @IsOptional()
  @IsNumber()
  vault_unlock_timestamp?: number;
}
