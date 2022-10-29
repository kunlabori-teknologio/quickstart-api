export interface IAddress {
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export interface IGetAddress {
  getAddressByZipcode(zipcode: string, country?: string): Promise<IAddress | undefined>,
}
