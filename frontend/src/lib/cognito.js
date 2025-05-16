import { CognitoUserPool } from 'amazon-cognito-identity-js'

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_USER_CLIENT_ID,
}

const userPool = new CognitoUserPool(poolData)

export default userPool
