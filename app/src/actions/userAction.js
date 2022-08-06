import artworksBase from '../apis/artworksBase';

import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_LOGOUT,
  USER_DETAILS_RESET,
  USER_LIST_RESET,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_FAVORITE_ARTWORK_REQUEST,
  USER_FAVORITE_ARTWORK_SUCCESS,
  USER_FAVORITE_ARTWORK_FAIL,
  USER_FAVORITE_ARTWORK_LIST_REQUEST,
  USER_FAVORITE_ARTWORK_LIST_FAIL,
  USER_FAVORITE_ARTWORK_LIST_SUCCESS,
  USER_ARTIST_WORKS_REQUEST,
  USER_ARTIST_WORKS_SUCCESS,
  USER_ARTIST_WORKS_FAIL,
  USER_FAVORITE_ARTIST_REQUEST,
  USER_FAVORITE_ARTIST_SUCCESS,
  USER_FAVORITE_ARTIST_FAIL,
  USER_FAVORITE_ARTIST_LIST_REQUEST,
  USER_FAVORITE_ARTIST_LIST_SUCCESS,
  USER_FAVORITE_ARTIST_LIST_FAIL,
  DIALOG_REQUEST,
  DIALOG_SUCCESS,
  DIALOG_FAIL,
} from '../constants/userConstants';

export const openAuthDialog = (whichOne) => async (dispatch) => {
  try {
    dispatch({ type: DIALOG_REQUEST });

    dispatch({
      type: DIALOG_SUCCESS,
      payload: whichOne,
    });
  } catch (e) {
    dispatch({
      type: DIALOG_FAIL,
      payload: 'Something went wrong :(',
    });
  }
};

export const fetchUserDetails = () => async (dispatch) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const userInfoFromStorage = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfoFromStorage.access}`,
      },
    };

    const { data } = await artworksBase.get(`/users/profile/me`, config);

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const login = (username, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const config = {
      headers: {
        'Content-type': 'application/json',
      },
    };
    // eslint-disable-next-line no-undef
    const formData = new FormData();
    formData.set('email', username);
    formData.set('password', password);
    const { data } = await artworksBase.post('/users/login/', formData, {
      config,
    });

    // eslint-disable-next-line no-undef
    localStorage.setItem('userInfo', JSON.stringify(data));
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });
    dispatch(fetchUserDetails());
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_DETAILS_RESET });
  dispatch({ type: USER_LIST_RESET });
};

export const register =
  (firstName, lastName, email, password) => async (dispatch) => {
    try {
      // eslint-disable-next-line no-undef
      const formData = new FormData();
      formData.set('firstName', firstName);
      formData.set('lastName', lastName);
      formData.set('email', email);
      formData.set('password', password);

      dispatch({ type: USER_REGISTER_REQUEST });
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };
      const { data } = await artworksBase.post('/users/register/', formData, {
        config,
      });
      dispatch({
        type: USER_REGISTER_SUCCESS,
        payload: data,
      });
      // eslint-disable-next-line no-undef
      localStorage.setItem('userInfo', JSON.stringify(data));
      dispatch(fetchUserDetails());

      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: data,
      });
      // eslint-disable-next-line no-undef
      localStorage.removeItem('localVerifyInfo');
    } catch (e) {
      // check for generic and custom message to return using ternary statement
      dispatch({
        type: USER_REGISTER_FAIL,
        payload:
          e.response && e.response.data.detail
            ? e.response.data.detail
            : e.message,
      });
    }
  };

export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const formData = new FormData();
    formData.set('firstName', user.firstName);
    formData.set('lastName', user.lastName);
    if (user.checked) {
      formData.set('country', user.country);
      formData.set('city', user.city);
      formData.set('phoneNumber', user.phoneNumber);
      formData.set('province', user.province);
      formData.set('postalCode', user.postalCode);
      formData.set('address', user.address);
      formData.set('checked', user.checked);
    }

    const { data } = await artworksBase.put(
      `users/profile/update/`,
      formData,
      config
    );

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: data,
    });
    // login the user with new data and update local storage
    // dispatch({
    //   type: USER_LOGIN_SUCCESS,
    //   payload: data,
    // });
    // localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const favArtistChange = (artistId) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_FAVORITE_ARTIST_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await artworksBase.put(
      `users/artist/favorite/${artistId}/`,
      {}, // since there is no form we need this
      config
    );

    dispatch({
      type: USER_FAVORITE_ARTIST_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_FAVORITE_ARTIST_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const favArtworkChange = (artworkId) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_FAVORITE_ARTWORK_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await artworksBase.put(
      `users/artwork/favorite/${artworkId}/`,
      {}, // since there is no form we need this
      config
    );

    dispatch({
      type: USER_FAVORITE_ARTWORK_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_FAVORITE_ARTWORK_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const fetchFavArtistList = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_FAVORITE_ARTIST_LIST_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await artworksBase.get(
      `users/profile/artists/favorites/`,
      config
    );

    dispatch({
      type: USER_FAVORITE_ARTIST_LIST_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_FAVORITE_ARTIST_LIST_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const fetchFavArtworkList = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_FAVORITE_ARTWORK_LIST_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await artworksBase.get(
      `users/profile/artworks/favorites/`,
      config
    );

    dispatch({
      type: USER_FAVORITE_ARTWORK_LIST_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // check for generic and custom message to return using ternary statement
    dispatch({
      type: USER_FAVORITE_ARTWORK_LIST_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};

export const fetchArtistWorks = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_ARTIST_WORKS_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await artworksBase.get(
      `users/profile/artworks/mine`,
      config
    );

    dispatch({
      type: USER_ARTIST_WORKS_SUCCESS,
      payload: data,
    });
  } catch (e) {
    dispatch({
      type: USER_ARTIST_WORKS_FAIL,
      payload:
        e.response && e.response.data.detail
          ? e.response.data.detail
          : e.message,
    });
  }
};
