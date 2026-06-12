import { connectDB } from "@/backend/lib/mongodb";
import { validationPaginationParams } from "@/shared/validation/validationParams";
import mongoose, {
  ClientSession,
  Model,
  Types,
} from "mongoose";
import {
  BrandModel,
  BrandRecord,
  CategoryModel,
  CategoryRecord,
  ProductAttributeModel,
  ProductModel,
  ProductRecord,
  ProductVariantModel,
} from "./models";

type BodyRecord = Record<string, unknown>;
type CatalogEntityModel = Model<CategoryRecord> | Model<BrandRecord>;

type ProductPayload = Omit<ProductRecord, "isActive">;
type ProductUpdatePayload = Partial<ProductPayload>;

type ProductAttributeInput = {
  name: string;
  value: unknown;
};

type ProductVariantInput = {
  id?: string;
  color?: string;
  size?: string;
  images?: string[];
};

type ListFilter = Record<string, unknown>;

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function formatApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof SyntaxError) {
    return { status: 400, message: "Invalid JSON body" };
  }

  if (isDuplicateKeyError(error)) {
    return {
      status: 409,
      message: `${getDuplicateField(error) ?? "Resource"} already exists`,
    };
  }

  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    return {
      status: 400,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}

export async function listProducts(searchParams: URLSearchParams) {
  await connectDB();

  const { page, perPage, skip } = getPagination(searchParams);
  const filter: ListFilter = getActiveFilter(searchParams);
  const search = getSearchValue(searchParams);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  if (search) {
    const nameMatcher = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ faName: nameMatcher }, { enName: nameMatcher }];
  }

  if (category) {
    filter.category = await resolveCategoryId(category);
  }

  if (brand) {
    filter.brand = await resolveBrandId(brand);
  }

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .populate("category")
      .populate("brand")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage),
    ProductModel.countDocuments(filter),
  ]);

  return toPaginatedResponse(items, total, page, perPage);
}

export async function createProduct(body: unknown) {
  const db = await connectDB();
  const record = getBodyRecord(body);
  const product = await getProductPayload(record);
  const attributes = getAttributesInput(record);
  const variants = getVariantsInput(record, { allowIds: false });
  const session = await db.startSession();
  let productId: Types.ObjectId | undefined;

  try {
    await session.withTransaction(async () => {
      await assertActiveDocument(CategoryModel, product.category, "Category", session);
      await assertActiveDocument(BrandModel, product.brand, "Brand", session);

      const [createdProduct] = await ProductModel.create([product], { session });
      productId = createdProduct._id as Types.ObjectId;

      if (attributes.length) {
        await ProductAttributeModel.bulkWrite(
          attributes.map((attribute) => ({
            updateOne: {
              filter: { product: productId, name: attribute.name },
              update: {
                $set: { value: attribute.value },
                $setOnInsert: { product: productId, name: attribute.name },
              },
              upsert: true,
            },
          })),
          { session },
        );
      }

      if (variants.length) {
        await ProductVariantModel.create(
          variants.map((variant) => ({ ...variant, product: productId })),
          { session },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  if (!productId) {
    throw new HttpError(500, "Product was not created");
  }

  return getProduct(productId.toString());
}

export async function getProduct(id: string) {
  await connectDB();
  const productId = getObjectId(id, "product id");
  const [product, attributes, variants] = await Promise.all([
    ProductModel.findById(productId).populate("category").populate("brand"),
    ProductAttributeModel.find({ product: productId }).sort({ name: 1 }),
    ProductVariantModel.find({ product: productId }).sort({ createdAt: -1 }),
  ]);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return { product, attributes, variants };
}

export async function updateProduct(id: string, body: unknown) {
  await connectDB();
  const productId = getObjectId(id, "product id");
  const update = await getProductUpdatePayload(getBodyRecord(body));

  if (!Object.keys(update).length) {
    throw new HttpError(400, "No product fields to update");
  }

  const product = await ProductModel.findByIdAndUpdate(productId, update, {
    new: true,
    runValidators: true,
  })
    .populate("category")
    .populate("brand");

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return product;
}

export async function deactivateProduct(id: string) {
  await connectDB();
  const product = await ProductModel.findByIdAndUpdate(
    getObjectId(id, "product id"),
    { isActive: false },
    { new: true },
  )
    .populate("category")
    .populate("brand");

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return product;
}

export async function listProductAttributes(productId: string) {
  await connectDB();
  const id = getObjectId(productId, "product id");
  await assertProductExists(id);
  return ProductAttributeModel.find({ product: id }).sort({ name: 1 });
}

export async function upsertProductAttributes(productId: string, body: unknown) {
  await connectDB();
  const id = getObjectId(productId, "product id");
  await assertProductExists(id);
  const attributes = getAttributesInput(body);

  if (!attributes.length) {
    return ProductAttributeModel.find({ product: id }).sort({ name: 1 });
  }

  await ProductAttributeModel.bulkWrite(
    attributes.map((attribute) => ({
      updateOne: {
        filter: { product: id, name: attribute.name },
        update: {
          $set: { value: attribute.value },
          $setOnInsert: { product: id, name: attribute.name },
        },
        upsert: true,
      },
    })),
  );

  return ProductAttributeModel.find({ product: id }).sort({ name: 1 });
}

export async function deleteProductAttributes(productId: string, body: unknown) {
  await connectDB();
  const id = getObjectId(productId, "product id");
  await assertProductExists(id);
  const names = getAttributeNamesInput(body);

  if (!names.length) {
    throw new HttpError(400, "Attribute names are required");
  }

  await ProductAttributeModel.deleteMany({ product: id, name: { $in: names } });
  return ProductAttributeModel.find({ product: id }).sort({ name: 1 });
}

export async function listProductVariants(productId: string) {
  await connectDB();
  const id = getObjectId(productId, "product id");
  await assertProductExists(id);
  return ProductVariantModel.find({ product: id }).sort({ createdAt: -1 });
}

export async function createProductVariant(productId: string, body: unknown) {
  await connectDB();
  const id = getObjectId(productId, "product id");
  await assertProductExists(id);
  const variant = getVariantPayload(getBodyRecord(body), {
    allowId: false,
    partial: false,
  });
  return ProductVariantModel.create({ ...variant, product: id });
}

export async function upsertProductVariants(productId: string, body: unknown) {
  await connectDB();
  const id = getObjectId(productId, "product id");
  await assertProductExists(id);
  const variants = getVariantsInput(body, { allowIds: true });

  for (const variant of variants) {
    const { id: variantId, ...payload } = variant;

    if (!variantId) {
      await ProductVariantModel.create({ ...payload, product: id });
      continue;
    }

    if (!Object.keys(payload).length) {
      throw new HttpError(400, "No variant fields to update");
    }

    const updated = await ProductVariantModel.findOneAndUpdate(
      { _id: getObjectId(variantId, "variant id"), product: id },
      payload,
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new HttpError(404, "Variant not found");
    }
  }

  return ProductVariantModel.find({ product: id }).sort({ createdAt: -1 });
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  body: unknown,
) {
  await connectDB();
  const productObjectId = getObjectId(productId, "product id");
  await assertProductExists(productObjectId);
  const update = getVariantPayload(getBodyRecord(body), {
    allowId: false,
    partial: true,
  });

  if (!Object.keys(update).length) {
    throw new HttpError(400, "No variant fields to update");
  }

  const variant = await ProductVariantModel.findOneAndUpdate(
    { _id: getObjectId(variantId, "variant id"), product: productObjectId },
    update,
    { new: true, runValidators: true },
  );

  if (!variant) {
    throw new HttpError(404, "Variant not found");
  }

  return variant;
}

export async function deleteProductVariant(productId: string, variantId: string) {
  await connectDB();
  const productObjectId = getObjectId(productId, "product id");
  await assertProductExists(productObjectId);
  const variant = await ProductVariantModel.findOneAndDelete({
    _id: getObjectId(variantId, "variant id"),
    product: productObjectId,
  });

  if (!variant) {
    throw new HttpError(404, "Variant not found");
  }

  return variant;
}

export async function listCategories(searchParams: URLSearchParams) {
  return listCatalogEntities(CategoryModel, searchParams);
}

export async function createCategory(body: unknown) {
  await connectDB();
  return CategoryModel.create(getCatalogPayload(getBodyRecord(body), false));
}

export async function getCategory(id: string) {
  return getCatalogEntity(CategoryModel, id, "Category");
}

export async function updateCategory(id: string, body: unknown) {
  return updateCatalogEntity(CategoryModel, id, body, "Category");
}

export async function deactivateCategory(id: string) {
  return deactivateCatalogEntity(CategoryModel, id, "Category");
}

export async function listBrands(searchParams: URLSearchParams) {
  return listCatalogEntities(BrandModel, searchParams);
}

export async function createBrand(body: unknown) {
  await connectDB();
  return BrandModel.create(getCatalogPayload(getBodyRecord(body), false));
}

export async function getBrand(id: string) {
  return getCatalogEntity(BrandModel, id, "Brand");
}

export async function updateBrand(id: string, body: unknown) {
  return updateCatalogEntity(BrandModel, id, body, "Brand");
}

export async function deactivateBrand(id: string) {
  return deactivateCatalogEntity(BrandModel, id, "Brand");
}

async function listCatalogEntities(
  model: CatalogEntityModel,
  searchParams: URLSearchParams,
) {
  await connectDB();
  const { page, perPage, skip } = getPagination(searchParams);
  const filter: ListFilter = getActiveFilter(searchParams);
  const search = getSearchValue(searchParams);

  if (search) {
    const matcher = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [
      { faName: matcher },
      { enName: matcher },
      { slug: matcher },
    ];
  }

  const [items, total] = await Promise.all([
    model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage),
    model.countDocuments(filter),
  ]);

  return toPaginatedResponse(items, total, page, perPage);
}

async function getCatalogEntity(
  model: CatalogEntityModel,
  id: string,
  label: string,
) {
  await connectDB();
  const entity = await model.findById(getObjectId(id, `${label} id`));

  if (!entity) {
    throw new HttpError(404, `${label} not found`);
  }

  return entity;
}

async function updateCatalogEntity(
  model: CatalogEntityModel,
  id: string,
  body: unknown,
  label: string,
) {
  await connectDB();
  const update = getCatalogPayload(getBodyRecord(body), true);

  if (!Object.keys(update).length) {
    throw new HttpError(400, `No ${label.toLowerCase()} fields to update`);
  }

  const entity = await model.findByIdAndUpdate(
    getObjectId(id, `${label} id`),
    update,
    { new: true, runValidators: true },
  );

  if (!entity) {
    throw new HttpError(404, `${label} not found`);
  }

  return entity;
}

async function deactivateCatalogEntity(
  model: CatalogEntityModel,
  id: string,
  label: string,
) {
  await connectDB();
  const entity = await model.findByIdAndUpdate(
    getObjectId(id, `${label} id`),
    { isActive: false },
    { new: true },
  );

  if (!entity) {
    throw new HttpError(404, `${label} not found`);
  }

  return entity;
}

async function getProductPayload(record: BodyRecord): Promise<ProductPayload> {
  const category = await resolveCategoryId(getRequiredReference(record, "category"));
  const brand = await resolveBrandId(getRequiredReference(record, "brand"));

  return {
    code: getRequiredString(record, "code"),
    faName: getRequiredString(record, "faName"),
    enName: getRequiredString(record, "enName"),
    category,
    brand,
    images: getStringArray(record, "images"),
    description: getOptionalString(record, "description"),
    review: getOptionalString(record, "review"),
  };
}

async function getProductUpdatePayload(
  record: BodyRecord,
): Promise<ProductUpdatePayload> {
  const update: ProductUpdatePayload = {};

  setOptionalRequiredString(update, record, "code");
  setOptionalRequiredString(update, record, "faName");
  setOptionalRequiredString(update, record, "enName");

  if (hasAnyKey(record, ["category", "categoryId"])) {
    update.category = await resolveCategoryId(getRequiredReference(record, "category"));
  }

  if (hasAnyKey(record, ["brand", "brandId"])) {
    update.brand = await resolveBrandId(getRequiredReference(record, "brand"));
  }

  if ("images" in record) {
    update.images = getStringArray(record, "images");
  }

  if ("description" in record) {
    update.description = getOptionalString(record, "description");
  }

  if ("review" in record) {
    update.review = getOptionalString(record, "review");
  }

  return update;
}

function getCatalogPayload(record: BodyRecord, partial: true): Partial<CategoryRecord>;
function getCatalogPayload(
  record: BodyRecord,
  partial: false,
): Omit<CategoryRecord, "isActive">;
function getCatalogPayload(record: BodyRecord, partial: boolean) {
  if (!partial) {
    return {
      faName: getRequiredString(record, "faName"),
      enName: getRequiredString(record, "enName"),
      description: getOptionalString(record, "description"),
      slug: getRequiredString(record, "slug"),
    };
  }

  const update: Partial<CategoryRecord> = {};
  setOptionalRequiredString(update, record, "faName");
  setOptionalRequiredString(update, record, "enName");
  setOptionalRequiredString(update, record, "slug");

  if ("description" in record) {
    update.description = getOptionalString(record, "description");
  }

  return update;
}

function getAttributesInput(body: unknown): ProductAttributeInput[] {
  const raw = Array.isArray(body) ? body : getBodyRecord(body).attributes;

  if (raw === undefined) {
    return [];
  }

  if (!Array.isArray(raw)) {
    throw new HttpError(400, "attributes must be an array");
  }

  const attributesByName = new Map<string, ProductAttributeInput>();

  for (const item of raw) {
    const attribute = getBodyRecord(item);
    const name = getRequiredString(attribute, "name");

    if (!("value" in attribute) || attribute.value === null) {
      throw new HttpError(400, "Attribute value is required");
    }

    attributesByName.set(name, {
      name,
      value:
        typeof attribute.value === "string"
          ? attribute.value.trim()
          : attribute.value,
    });
  }

  return Array.from(attributesByName.values());
}

function getAttributeNamesInput(body: unknown): string[] {
  const raw = Array.isArray(body) ? body : getBodyRecord(body).names;

  if (!Array.isArray(raw)) {
    throw new HttpError(400, "names must be an array");
  }

  return raw.map((name, index) => {
    if (typeof name !== "string" || !name.trim()) {
      throw new HttpError(400, `names[${index}] must be a non-empty string`);
    }

    return name.trim();
  });
}

function getVariantsInput(
  body: unknown,
  options: { allowIds: boolean },
): ProductVariantInput[] {
  const raw = Array.isArray(body) ? body : getBodyRecord(body).variants;

  if (raw === undefined) {
    return [];
  }

  if (!Array.isArray(raw)) {
    throw new HttpError(400, "variants must be an array");
  }

  return raw.map((item) => {
    const variant = getBodyRecord(item);
    return getVariantPayload(variant, {
      allowId: options.allowIds,
      partial: options.allowIds && "id" in variant,
    });
  });
}

function getVariantPayload(
  record: BodyRecord,
  options: { allowId: boolean; partial: boolean },
): ProductVariantInput {
  const variant: ProductVariantInput = {};

  if (options.allowId && "id" in record) {
    variant.id = getRequiredString(record, "id");
  }

  if (!options.partial || "images" in record) {
    variant.images = getStringArray(record, "images");
  }

  if ("color" in record) {
    variant.color = getOptionalString(record, "color");
  }

  if ("size" in record) {
    variant.size = getOptionalString(record, "size");
  }

  return variant;
}

async function assertProductExists(id: Types.ObjectId) {
  const exists = await ProductModel.exists({ _id: id });

  if (!exists) {
    throw new HttpError(404, "Product not found");
  }
}

async function assertActiveDocument<T>(
  model: Model<T>,
  id: Types.ObjectId,
  label: string,
  session?: ClientSession,
) {
  const exists = await model
    .exists({ _id: id, isActive: true })
    .session(session ?? null);

  if (!exists) {
    throw new HttpError(404, `${label} not found`);
  }
}

async function resolveCategoryId(value: string) {
  return resolveCatalogId(CategoryModel, value, "Category");
}

async function resolveBrandId(value: string) {
  return resolveCatalogId(BrandModel, value, "Brand");
}

async function resolveCatalogId(
  model: CatalogEntityModel,
  value: string,
  label: string,
) {
  if (Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }

  const entity = await model.findOne({ slug: value, isActive: true }).select("_id");

  if (!entity) {
    throw new HttpError(404, `${label} not found`);
  }

  return entity._id as Types.ObjectId;
}

function getRequiredReference(record: BodyRecord, key: "category" | "brand") {
  const value = record[key] ?? record[`${key}Id`];

  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${key} is required`);
  }

  return value.trim();
}

function getPagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? "1");
  const perPage = Number(searchParams.get("perPage") ?? "10");

  if (!Number.isInteger(page) || !Number.isInteger(perPage)) {
    throw new HttpError(400, "invalid pagination params");
  }

  validationPaginationParams(page, perPage);

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
  };
}

function getActiveFilter(searchParams: URLSearchParams) {
  return searchParams.get("includeInactive") === "true" ? {} : { isActive: true };
}

function getSearchValue(searchParams: URLSearchParams) {
  return searchParams.get("search")?.trim() || undefined;
}

function toPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number,
) {
  return {
    items,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

function getBodyRecord(body: unknown): BodyRecord {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be an object");
  }

  return body as BodyRecord;
}

function getRequiredString(record: BodyRecord, field: string) {
  const value = record[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }

  return value.trim();
}

function getOptionalString(record: BodyRecord, field: string) {
  const value = record[field];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string`);
  }

  return value.trim();
}

function setOptionalRequiredString<T extends Record<string, unknown>>(
  target: T,
  record: BodyRecord,
  field: keyof T & string,
) {
  if (field in record) {
    target[field] = getRequiredString(record, field) as T[keyof T & string];
  }
}

function getStringArray(record: BodyRecord, field: string) {
  const value = record[field];

  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, `${field} must be an array`);
  }

  return value.map((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new HttpError(400, `${field}[${index}] must be a non-empty string`);
    }

    return item.trim();
  });
}

function hasAnyKey(record: BodyRecord, keys: string[]) {
  return keys.some((key) => key in record);
}

function getObjectId(id: string, label: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `${label} is invalid`);
  }

  return new Types.ObjectId(id);
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function getDuplicateField(error: unknown) {
  if (!isDuplicateKeyError(error)) {
    return undefined;
  }

  const keyPattern = (error as { keyPattern?: Record<string, unknown> })
    .keyPattern;
  return keyPattern ? Object.keys(keyPattern)[0] : undefined;
}
