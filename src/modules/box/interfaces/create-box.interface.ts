import { IsNotEmpty, IsOptional } from "class-validator";

import { IsString } from "class-validator";

export class CreateBoxRequestDto {
  @IsString()
  @IsNotEmpty()
  sound_url: string;

  @IsString()
  @IsNotEmpty()
  creator_wallet_address: string;

  @IsOptional()
  @IsString()
  creator_name: string | null;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
