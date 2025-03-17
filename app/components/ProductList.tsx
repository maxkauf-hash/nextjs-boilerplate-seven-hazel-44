"use client";

import { useEffect, useState } from "react";

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
};

type ProductsData = {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
};

const PRODUCTS_QUERY = `
  query Products {
    products(first: 12) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

const ProductList = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/shopify/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
        }),
      });

      console.log("RESPONSE API DATA : ", response);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }

      const { data }: { data: ProductsData } = await response.json();
      setProducts(data.products.edges.map((edge) => edge.node));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="alert"
      >
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          role="article"
          aria-label={`Produit : ${product.title}`}
        >
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={product.images.edges[0]?.node.url || "/placeholder.jpg"}
              alt={product.images.edges[0]?.node.altText || product.title}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {product.title}
            </h2>
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: product.priceRange.minVariantPrice.currencyCode,
              }).format(parseFloat(product.priceRange.minVariantPrice.amount))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
