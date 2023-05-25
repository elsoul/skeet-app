import ActionScreen from '@/screens/ActionScreen'
import LoginScreen from '@/screens/LoginScreen'
import RegisterScreen from '@/screens/RegisterScreen'
import ResetPasswordScreen from '@/screens/ResetPasswordScreen'
import CheckEmailScreen from '@/screens/CheckEmailScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function DefaultRoutes() {
  return (
    <>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
        <Stack.Screen name="Action" component={ActionScreen} />
      </Stack.Navigator>
    </>
  )
}
