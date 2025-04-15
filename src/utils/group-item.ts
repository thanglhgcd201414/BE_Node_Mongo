import onRemoveParams from "./remove-params";

interface Category {
  categoryId: string;
  categories: {
    id: string;
    name: string;
  };
}

interface Image {
  id: string;
  imageUrl: string;
}

interface Variant {
  id: string;
  sku: string;
  stock: number;
  price: number;
  originalPrice: number;
  color: string;
  storageCapacity: string;
  specifications: Record<string, any>;
}

interface Review {
  id: string;
  users: {
    id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  operatingSystem: string;
  createdAt: string;
  updatedAt: string;
  categories: Category;
  reviews: Review;
  images: Image;
  variants: Variant;
}
interface GroupedProduct {
  id: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  operatingSystem: string;
  createdAt: string;
  updatedAt: string;
  categories: { id: string; name: string }[];
  images: {
    id: string;
    imageUrl: string;
  }[];
  variants: Variant[];
  reviews: Review[];
}

function groupProducts(data: Product[]): any {
  const groupedProducts: { [key: string]: GroupedProduct } = {};

  data.forEach((product) => {
    const productId = product.id;

    if (!groupedProducts[productId]) {
      groupedProducts[productId] = {
        ...product,
        categories: [],
        images: [],
        variants: [],
        reviews: [],
      };
    }

    const rawCategory = product.categories?.categories;
    if (rawCategory) {
      const category = {
        id: rawCategory.id,
        name: rawCategory.name,
      };

      if (
        !groupedProducts[productId].categories.some((c) => c.id === category.id)
      ) {
        groupedProducts[productId].categories.push(category);
      }
    }

    const rawReview = product.reviews;
    if (rawReview) {
      const userReview = {
        id: rawReview.id,
        rating: rawReview.rating,
        comment: rawReview.comment,
        users: rawReview.users,
        createdAt: rawReview.createdAt,
      };

      if (
        !groupedProducts[productId].reviews.some((c) => c.id === userReview.id)
      ) {
        groupedProducts[productId].reviews.push(userReview);
      }
    }

    const rawImages = product.images;
    if (rawImages) {
      const _item = {
        id: rawImages.id,
        imageUrl: rawImages.imageUrl,
      };
      if (!groupedProducts[productId].images.some((_c) => _c.id === _item.id)) {
        groupedProducts[productId].images.push(_item);
      }
    }

    const rawVariants = product.variants;
    if (rawVariants) {
      const existingVariant = groupedProducts[productId].variants.some(
        (v) => v.id === rawVariants.id
      );

      if (!existingVariant) {
        groupedProducts[productId].variants.push(rawVariants);
      }
    }
  });

  const convertList = Object.values(groupedProducts);

  const finalData = convertList.map((_item) => {
    const _data = {
      ..._item,
      images: _item.images.map((_item) => _item.imageUrl),
      ratingAverage: Number(
        (
          _item.reviews.reduce(
            (total, _current) => total + _current.rating,
            0
          ) / _item.reviews.length
        ).toFixed(1)
      ),
    };

    return onRemoveParams(_data);
  });

  return finalData;
}

export { groupProducts };
