interface Specification {
  key: string;
  value: string;
}

interface GeminiResponse {
  brand?: string;
  productModel?: string;
  color?: string;
  storageCapacity?: string;
  operatingSystem: string;
  priceRange: { min: number; max: number };
}

const buildProductQuery = (params: {
  brand?: string;
  productModel?: string;
  color?: string;
  storageCapacity?: string;
  priceRange?: { min?: number; max?: number };
}) => {
  const query: any = {};
  if (params.brand) {
    query.brand = {
      $regex: new RegExp(`^${params.brand.trim()}$`, "i"),
    };
  }

  if (params.productModel) {
    query.productModel = {
      $regex: new RegExp(`^${params.productModel.trim()}$`, "i"),
    };
  }

  const variantConditions = [];

  if (params.color) {
    variantConditions.push({
      "variants.color": {
        $regex: new RegExp(`^${params.color.trim()}$`, "i"),
      },
    });
  }

  if (params.storageCapacity) {
    variantConditions.push({
      "variants.storageCapacity": {
        $regex: new RegExp(
          `^${params.storageCapacity.replace(/\s/g, "").toUpperCase()}$`,
          "i"
        ),
      },
    });
  }

  const priceCondition: any = {};
  if (params.priceRange?.min !== undefined) {
    priceCondition.$gte = params.priceRange.min;
  }
  if (params.priceRange?.max !== undefined) {
    priceCondition.$lte = params.priceRange.max;
  }
  if (Object.keys(priceCondition).length > 0) {
    variantConditions.push({ "variants.price": priceCondition });
  }

  if (variantConditions.length > 0) {
    query.$and = variantConditions;
  }

  return query;
};
export default buildProductQuery;
