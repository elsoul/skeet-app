import UserDashboardScreen from '@/screens/user/UserDashboardScreen'
import UserSettingsScreen from '@/screens/user/UserSettingsScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function UserRoutes() {
  return (
    <>
      <Stack.Navigator
        initialRouteName="UserDashboard"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
        <Stack.Screen name="UserSettings" component={UserSettingsScreen} />
      </Stack.Navigator>
    </>
  )
}
