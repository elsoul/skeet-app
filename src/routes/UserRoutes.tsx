import UserDashboardScreen from '@/screens/user/UserDashboardScreen'
import UserSettingsScreen from '@/screens/user/UserSettingsScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  Cog8ToothIcon,
  RectangleGroupIcon,
} from 'react-native-heroicons/outline'

export const userRoutes = [
  {
    name: 'Dashboard',
    component: UserDashboardScreen,
    icon: RectangleGroupIcon,
  },
  {
    name: 'Settings',
    component: UserSettingsScreen,
    icon: Cog8ToothIcon,
  },
]

const Stack = createNativeStackNavigator()

export default function UserRoutes() {
  return (
    <>
      <Stack.Navigator
        initialRouteName={userRoutes[0].name}
        screenOptions={{ headerShown: false }}
      >
        {userRoutes.map((route) => (
          <Stack.Screen
            key={`UserRoutes ${route.name}`}
            name={route.name}
            component={route.component}
          />
        ))}
      </Stack.Navigator>
    </>
  )
}
