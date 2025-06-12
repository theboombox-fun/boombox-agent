import { Expose, Exclude, Transform } from 'class-transformer';

@Exclude()
export class BoxDto {
  @Expose()
  @Transform(({ value }) => parseInt(value))
  id: number;

  @Expose()
  name?: string;

  @Expose()
  ticker?: string;

  @Expose()
  pfp_url?: string;

  @Expose()
  sound_url?: string;

  @Expose()
  thumbnail_url?: string;

  @Expose()
  contract_address?: string;

  @Expose()
  creator_name?: string;

  @Expose()
  creator_wallet_address?: string;

  @Expose()
  status: string;

  @Expose()
  token_usd_price?: number;

  @Expose()
  token_volume?: number;

  @Expose()
  token_market_cap?: number;

  @Expose()
  token_24h_volume?: number;

  @Expose()
  @Transform(({ value }) => parseInt(value))
  played_count?: number;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  created_at: Date;
}
