import artworksBase from '../apis/artworksBase';
import {
  ARTWORK_LIST_REQUEST,
  ARTWORK_LIST_SUCCESS,
  ARTWORK_LIST_FAIL,
  ARTWORK_TOP_CAROUSEL_REQUEST,
  ARTWORK_TOP_CAROUSEL_SUCCESS,
  ARTWORK_TOP_CAROUSEL_FAIL,
  ARTWORK_DETAILS_REQUEST,
  ARTWORK_DETAILS_SUCCESS,
  ARTWORK_DETAILS_FAIL,
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
  ARTWORK_UPDATE_REQUEST,
  ARTWORK_UPDATE_FAIL,
  ARTWORK_UPDATE_SUCCESS,
  ARTWORK_VOUCHER_DELETE_FAIL,
  ARTWORK_VOUCHER_DELETE_REQUEST,
  ARTWORK_VOUCHER_DELETE_SUCCESS,
  ARTWORK_IS_CAROUSEL_REQUEST,
  ARTWORK_IS_CAROUSEL_SUCCESS,
  ARTWORK_IS_CAROUSEL_FAIL,
} from '../constants/artworkConstants';
import { weiToEth } from '../converter';

export const fetchAllArtWorks =
  (keyword = '', page = 1) =>
  async (dispatch) => {
    let response;
    try {
      dispatch({ type: ARTWORK_LIST_REQUEST });
      if (keyword) {
        response = await artworksBase.get(`/artworks/${keyword}&page=${page}`);
      } else {
        response = await artworksBase.get(`/artworks/?page=${page}`);
      }

      dispatch({
        type: ARTWORK_LIST_SUCCESS,
        payload: response.data,
      });
    } catch (e) {
      dispatch({
        type: ARTWORK_LIST_FAIL,
        payload:
          e.response && e.response.data.detail
            ? e.response.data.detail
            : e.message,
      });
    }
  };

export const fetchTopCarouselArtworks = () => async (dispatch) => {
  try {
    dispatch({ type: ARTWORK_TOP_CAROUSEL_REQUEST });
    const response = await artworksBase.get(`/artworks/carousel`);

    dispatch({
      type: ARTWORK_TOP_CAROUSEL_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    dispatch({
      type: ARTWORK_TOP_CAROUSEL_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const fetchOneArtWork = (workId) => async (dispatch) => {
  try {
    await dispatch({ type: ARTWORK_DETAILS_REQUEST });

    const response = await artworksBase.get(`/artworks/${workId}`);

    dispatch({
      type: ARTWORK_DETAILS_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    dispatch({
      type: ARTWORK_DETAILS_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const fetchCategories = () => async (dispatch) => {
  try {
    await dispatch({ type: CATEGORY_LIST_REQUEST });

    const response = await artworksBase.get(`/artworks/categories`);
    dispatch({
      type: CATEGORY_LIST_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    dispatch({
      type: CATEGORY_LIST_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const updateArtwork =
  (
    galleryAddress,
    sellerAddress,
    buyerAddress,
    voucher,
    action,
    transactionHash,
    feeWei,
    formValues
  ) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: ARTWORK_UPDATE_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // eslint-disable-next-line no-undef
      const formData = new FormData();
      let artworkId;
      // 1 -Option Sign: update product when sign the product
      if (action === 'Signing') {
        const digits = `${parseInt(voucher.artworkId)}`.split('');
        [artworkId] = digits;

        formData.append('signature', voucher.signature);
        formData.append('title', voucher.title);
        formData.append('artworkId', voucher.artworkId);
        formData.append('editionNumber', voucher.editionNumber);
        formData.append('edition', voucher.edition);
        formData.append('priceWei', voucher.priceWei); // from voucher.js
        formData.append('priceDollar', voucher.priceDollar);
        formData.append('tokenUri', voucher.tokenUri);
        formData.append('content', voucher.content);
      }
      // Option Redeem and Mint: update product when mint the product
      else if (action === 'RedeemAndMint') {
        const digits = `${parseInt(voucher.artwork_id)}`.split('');
        [artworkId] = digits;

        const priceEth = weiToEth(voucher.price_wei); // from backEnd
        const feeEth = weiToEth(feeWei);
        // NFT
        formData.append('tokenId', voucher.artwork_id);
        formData.append('galleryAddress', galleryAddress);
        formData.append('transactionHash', transactionHash);
        formData.append('priceEth', priceEth);
        formData.append('feeEth', feeEth);
        // order & shipping
        formData.append('address', formValues.address);
        formData.append('city', formValues.city);
        formData.append('country', formValues.country);
        formData.append('province', formValues.province);
        formData.append('phoneNumber', formValues.phoneNumber);
        formData.append('postalCode', formValues.postalCode);
      }

      const { data } = await artworksBase.put(
        `/artworks/update/${artworkId}/${action}/`,
        formData,
        config
      );

      dispatch({
        type: ARTWORK_UPDATE_SUCCESS,
        payload: data,
      });
    } catch (e) {
      dispatch({
        type: ARTWORK_UPDATE_FAIL,
        payload:
          e.response && e.response.data.detail
            ? e.response.data.detail
            : e.message,
      });
    }
  };

export const deleteVoucher = (voucherId) => async (dispatch, getState) => {
  try {
    dispatch({ type: ARTWORK_VOUCHER_DELETE_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const { data } = await artworksBase.delete(
      `artworks/voucher/${voucherId}/delete/`,
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
    );

    dispatch({
      type: ARTWORK_VOUCHER_DELETE_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: ARTWORK_VOUCHER_DELETE_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const fetchIsCarousel = () => async (dispatch) => {
  try {
    dispatch({ type: ARTWORK_IS_CAROUSEL_REQUEST });

    const { data } = await artworksBase.get(`artworks/carousels/`, {
      headers: {
        'Content-type': 'application/json',
      },
    });

    dispatch({
      type: ARTWORK_IS_CAROUSEL_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: ARTWORK_IS_CAROUSEL_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};
