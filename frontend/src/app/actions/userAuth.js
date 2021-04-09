import {
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  SNACKBAR_ERROR,
  SET_FLOW_STATE
} from "./types";

import * as UserAuthService from "../services/user-auth-service";

export const userLogin = (templateId, qualtricsId) => (dispatch) => {
  return UserAuthService.login(templateId, qualtricsId).then(
    (data) => {
      console.log(data); // default translations
      if (!data.flow || data.flow.length < 1) {
        dispatch({
          type: SET_FLOW_STATE,
          payload: { flow: [], active: -1, disabled: true }
        });
      } else {
      // dispatch a function to set the initial flow state
        dispatch({
          type: SET_FLOW_STATE,
          payload: { flow: data.flow, active: 0, disabled: true }
        });

        // data has user token, flow and translations
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: {
            user: data,
          },
        });
      }

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch({
        type: USER_LOGIN_FAIL,
      });

      dispatch({
        type: SNACKBAR_ERROR,
        payload: message,
      });

      return Promise.reject();
    }
  );
};

export const userLogout = () => (dispatch) => {
  UserAuthService.logout();

  dispatch({
    type: USER_LOGOUT,
  });
};
