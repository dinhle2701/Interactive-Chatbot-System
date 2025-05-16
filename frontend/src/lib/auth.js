import {
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import userPool from './cognito';

export function signIn(email, password, callback) {
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = {
    Username: email,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      const accessToken = result.getAccessToken().getJwtToken();
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', accessToken);

      callback(null, result);
    },

    onFailure: function (err) {
      callback(err);
    },

    newPasswordRequired: function (userAttributes, requiredAttributes) {
      callback({ message: 'Bạn cần cập nhật mật khẩu mới.' });
    },
  });
}

