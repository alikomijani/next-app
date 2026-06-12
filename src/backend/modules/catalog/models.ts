import mongoose, { Model, Schema, Types } from "mongoose";

type JsonTransformRet = Record<string, unknown> & {
  _id?: unknown;
  __v?: unknown;
};

function transformId(_doc: unknown, ret: JsonTransformRet) {
  const id = ret._id;
  if (id && typeof (id as { toString?: unknown }).toString === "function") {
    ret.id = (id as { toString: () => string }).toString();
  }
  delete ret._id;
  delete ret.__v;
  return ret;
}

const schemaOptions = {
  timestamps: true,
  toJSON: {
    transform: transformId,
  },
  toObject: {
    transform: transformId,
  },
};

export type CategoryRecord = {
  faName: string;
  enName: string;
  description?: string;
  slug: string;
  isActive: boolean;
};

export type BrandRecord = {
  faName: string;
  enName: string;
  description?: string;
  slug: string;
  isActive: boolean;
};

export type ProductRecord = {
  code: string;
  faName: string;
  enName: string;
  category: Types.ObjectId;
  brand: Types.ObjectId;
  images: string[];
  description?: string;
  review?: string;
  isActive: boolean;
};

export type ProductAttributeRecord = {
  product: Types.ObjectId;
  name: string;
  value: unknown;
};

export type ProductVariantRecord = {
  product: Types.ObjectId;
  color?: string;
  size?: string;
  images: string[];
};

const CategorySchema = new Schema<CategoryRecord>(
  {
    faName: { type: String, required: true, trim: true },
    enName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  schemaOptions,
);

const BrandSchema = new Schema<BrandRecord>(
  {
    faName: { type: String, required: true, trim: true },
    enName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  schemaOptions,
);

const ProductSchema = new Schema<ProductRecord>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    faName: { type: String, required: true, trim: true },
    enName: { type: String, required: true, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    images: { type: [String], default: [] },
    description: { type: String, trim: true },
    review: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  schemaOptions,
);

const ProductAttributeSchema = new Schema<ProductAttributeRecord>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  schemaOptions,
);

const ProductVariantSchema = new Schema<ProductVariantRecord>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    images: { type: [String], default: [] },
  },
  schemaOptions,
);

ProductAttributeSchema.index({ product: 1, name: 1 }, { unique: true });

export const CategoryModel =
  (mongoose.models.Category as Model<CategoryRecord> | undefined) ||
  mongoose.model<CategoryRecord>("Category", CategorySchema);

export const BrandModel =
  (mongoose.models.Brand as Model<BrandRecord> | undefined) ||
  mongoose.model<BrandRecord>("Brand", BrandSchema);

export const ProductModel =
  (mongoose.models.Product as Model<ProductRecord> | undefined) ||
  mongoose.model<ProductRecord>("Product", ProductSchema);

export const ProductAttributeModel =
  (mongoose.models.ProductAttribute as Model<ProductAttributeRecord> | undefined) ||
  mongoose.model<ProductAttributeRecord>(
    "ProductAttribute",
    ProductAttributeSchema,
  );

export const ProductVariantModel =
  (mongoose.models.ProductVariant as Model<ProductVariantRecord> | undefined) ||
  mongoose.model<ProductVariantRecord>("ProductVariant", ProductVariantSchema);
