"use client";

import { freshImage } from "@/lib/images";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import type { ProductData } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import Modal from "@/components/Modal";

export function ProductCard({
  product,
  onDetails,
}: {
  product: ProductData;
  onDetails: () => void;
}) {
  const { addItem } = useCart();
  return (
    <article className="apex-product-card">
      <button
        type="button"
        className="apex-product-photo"
        onClick={onDetails}
        aria-label={`View ${product.title} details`}
        aria-haspopup="dialog"
      >
        <Image
          src={freshImage(product.image)}
          alt={`${product.category} in use on the ice`}
          fill
          sizes="(max-width: 767px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="apex-product-tag">{product.category}</span>
      </button>
      <div className="apex-product-info">
        <h3>
          <button type="button" onClick={onDetails}>
            {product.title}
          </button>
        </h3>
        <p className="line-clamp-2">{product.description}</p>
        <div className="apex-product-bottom">
          <strong>${product.price.toFixed(2)}</strong>
          <button
            type="button"
            className="apex-btn apex-btn-secondary"
            aria-label={`Add ${product.title} to cart`}
            disabled={!product.inStock}
            onClick={() => addItem(product, 1)}
          >
            <Plus size={15} aria-hidden="true" />
            {product.inStock ? "Add to bag" : "Sold out"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductDetails({
  product,
  onClose,
}: {
  product: ProductData | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title={product?.title ?? "Product details"}
      size="lg"
    >
      {product && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-md bg-surface-50">
            <Image
              src={freshImage(product.image)}
              alt={`${product.category} in use on the ice`}
              fill
              sizes="(max-width: 640px) 90vw, 300px"
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <p className="apex-eyebrow">{product.category}</p>
            <p className="text-2xl font-extrabold">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-sm leading-relaxed text-ink-600">
              {product.description}
            </p>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li
                  key={f}
                  className="flex gap-2 text-xs leading-relaxed text-ink-600"
                >
                  <Check
                    size={14}
                    className="shrink-0 text-brand-600"
                    aria-hidden="true"
                  />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-500">{product.delivery}</p>
            <button
              type="button"
              disabled={!product.inStock}
              aria-label={`Add ${product.title} to cart`}
              className="apex-btn apex-btn-primary w-full"
              onClick={() => {
                addItem(product, 1);
                onClose();
              }}
            >
              <Plus size={16} aria-hidden="true" />
              {product.inStock ? "Add to bag" : "Sold out"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
