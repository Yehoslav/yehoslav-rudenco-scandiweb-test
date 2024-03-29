import {
  createSelector,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { getProductData } from "./database";

const initialState = {
  products: [],
  productViewData: {
    id: null,
    status: "idle",
    error: null,
  },
  status: "idle",
  error: null,
};

const organizeProductData = (productData, state) => {
  const similarProducts = state.products.filter(
    (product) => product.productId === productData.id
  );

  const generateId = () => {
    if (similarProducts.length === 0) return `${productData.id}-0`;

    return `${productData.id}-${
      parseInt(similarProducts.at(-1).id.split("-").at(-1)) + 1
    }`;
  };

  return {
    ...productData,
    productId: productData.id,
    id: generateId(),
    amount: 1,
  };
};

export const fetchAndAddToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId }) => {
    const { product } = await getProductData(productId, [
      "id",
      "inStock",
      "name",
      "brand",
      "gallery",
    ]);

    return {
      ...product,
      amount: 1,
      attributes: product.attributes.map((att) => ({
        ...att,
        selectedAttr: att.items[0].id,
      })),
    };
  }
);

export const fetchProductData = createAsyncThunk(
  "store/getProduct",
  async (productId, thunkAPI) => {
    const inCart = thunkAPI
      .getState()
      .cart.products.find((item) => item.id === productId);
    if (inCart) {
      const { product } = await getProductData(productId, [
        "inStock",
        "description",
      ]);
      return {
        ...inCart,
        description: product.description,
      };
    }

    const { product } = await getProductData(productId, [
      "id",
      "inStock",
      "name",
      "brand",
      "gallery",
      "description",
    ]);

    return {
      ...product,
      attributes: product.attributes.map((att) => ({
        ...att,
        selectedAttr: att.items[0].id,
      })),
    };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state) => ({
      ...state,
      products: [
        ...state.products,
        organizeProductData(state.productViewData, state),
      ],
    }),

    selectAttribute: (state, action) => {
      const product = state.productViewData;
      const { productId, attrId, value } = action.payload;

      const selectAttr = (item) => {
        if (item.id !== productId) return item;
        return {
          ...item,
          attributes: item.attributes.map((att) => {
            if (attrId === att.id) return { ...att, selectedAttr: value };
            return att;
          }),
        };
      };

      const products = state.products.map(selectAttr);
      const productViewData = selectAttr(product);

      return { ...state, products, productViewData };
    },

    increaseProductAmmount: (state, action) => {
      const { payload: productId } = action;
      state.products.find((item) => item.id === productId).amount += 1;
    },

    decreaseProductAmmount: (state, action) => {
      const { payload: productId } = action;
      const product = state.products.find((item) => item.id === productId);
      if (product.amount > 1) {
        product.amount -= 1;
      } else {
        return {
          ...state,
          products: state.products.filter((item) => item.id !== productId),
        };
      }
    },

    /* FIXME: Remove the funciton */
    removeFromCart: (state, action) => {
      return {
        ...state,
        products: state.products.filter(
          (item) => item.id !== action.payload.productId
        ),
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndAddToCart.fulfilled, (state, action) => ({
        ...state,
        status: "succeeded",
        error: null,
        products: [
          ...state.products,
          organizeProductData(action.payload, state),
        ],
      }))
      .addCase(fetchAndAddToCart.pending, (state) => ({
        ...state,
        status: "loading",
        error: null,
        products: state.products,
      }))
      .addCase(fetchAndAddToCart.rejected, (state) => ({
        ...state,
        status: "failed",
        error: "Somethin went wrong.",
        products: state.products,
      }))
      .addCase(fetchProductData.fulfilled, (state, action) => ({
        ...state,
        productViewData: {
          ...action.payload,
          status: "succeeded",
          error: null,
        },
      }))
      .addCase(fetchProductData.pending, (state) => ({
        ...state,
        productViewData: {
          id: null,
          status: "loading",
          error: null,
        },
      }))
      .addCase(fetchProductData.rejected, (state, action) => ({
        ...state,
        productViewData: {
          id: null,
          status: "failed",
          error: action.error,
        },
      }));
  },
});

export const checkProductSelector = createSelector(
  [(state) => state.products, (_, productId) => productId],
  (products, productId) =>
    products.find((item) => item.id === productId) !== undefined
);

export const {
  increaseProductAmmount,
  addToCart,
  selectAttribute,
  decreaseProductAmmount,
  removeFromCart,
} = cartSlice.actions;

export default cartSlice.reducer;
