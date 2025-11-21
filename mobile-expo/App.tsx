import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Platform } from 'react-native'
import { AuthProvider } from './src/context/AuthContext'
import { CartProvider } from './src/context/CartContext'
import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen'
import BranchListScreen from './src/screens/branches/BranchListScreen'
import BranchDetailsScreen from './src/screens/branches/BranchDetailsScreen'
import CartScreen from './src/screens/cart/CartScreen'
import CheckoutScreen from './src/screens/cart/CheckoutScreen'
import OrdersScreen from './src/screens/orders/OrdersScreen'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ResetPassword: undefined
  BranchList: undefined
  BranchDetails: { id: number }
  Cart: undefined
  Checkout: undefined
  Orders: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

// Configure base path for web deployment
const linking = Platform.OS === 'web' ? {
  prefixes: ['https://qofferun.com/mobile/', 'http://localhost:19006/'],
  config: {
    screens: {
      BranchList: '',
      Login: 'login',
      Register: 'register',
      ResetPassword: 'reset-password',
      BranchDetails: 'branch/:id',
      Cart: 'cart',
      Checkout: 'checkout',
      Orders: 'orders',
    },
  },
} : undefined

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator initialRouteName="BranchList">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crea account' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Recupera password' }} />
            <Stack.Screen name="BranchList" component={BranchListScreen} options={{ title: 'Bar disponibili' }} />
            <Stack.Screen name="BranchDetails" component={BranchDetailsScreen} options={{ title: 'Dettagli bar' }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrello' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Pagamento' }} />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'I miei ordini' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  )
}
