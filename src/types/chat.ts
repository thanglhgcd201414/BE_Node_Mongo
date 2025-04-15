export interface IResponseGemini {
  queryData: {
    brand?: string;
    productModel?: string;
    operatingSystem?: string;
    storageCapacity?: string;
    color?: string;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  textResponse?: string;
  responseType: "search" | "recommend" | "compare" | "accessory" | "supports";
}
