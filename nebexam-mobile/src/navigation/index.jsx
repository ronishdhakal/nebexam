import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import LoadingScreen from '../components/common/LoadingScreen';
import { colors, shadow } from '../theme';

import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import VerifyEmailScreen    from '../screens/auth/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import HomeScreen            from '../screens/main/HomeScreen';
import SubjectsScreen        from '../screens/main/SubjectsScreen';
import SubjectDetailScreen   from '../screens/main/SubjectDetailScreen';
import ChapterScreen         from '../screens/main/ChapterScreen';
import QuestionBankScreen    from '../screens/main/QuestionBankScreen';
import QuestionEntryScreen   from '../screens/main/QuestionEntryScreen';
import ProfileScreen         from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: colors.white },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '700', color: colors.text, fontSize: 16 },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

const TAB_SCREENS = [
  { name: 'Home',         component: HomeScreen,         label: 'Home',     icon: 'home',           iconOutline: 'home-outline'           },
  { name: 'Subjects',     component: SubjectsScreen,     label: 'Subjects', icon: 'book',           iconOutline: 'book-outline'           },
  { name: 'QuestionBank', component: QuestionBankScreen, label: 'Papers',   icon: 'help-circle',    iconOutline: 'help-circle-outline'    },
  { name: 'Profile',      component: ProfileScreen,      label: 'Profile',  icon: 'person',         iconOutline: 'person-outline'         },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const screen = TAB_SCREENS.find((s) => s.name === route.name);
        return {
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? screen?.icon : screen?.iconOutline}
              size={22}
              color={focused ? colors.primary : colors.textMuted}
            />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 10,
            paddingTop: 6,
            ...shadow.sm,
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          ...HEADER_OPTS,
        };
      }}
    >
      {TAB_SCREENS.map((s) => (
        <Tab.Screen
          key={s.name}
          name={s.name}
          component={s.component}
          options={{
            title: s.label === 'Home' ? 'NEB Exam' : s.label,
            tabBarLabel: s.label,
            headerShown: s.name !== 'Home', // Home has its own inline header
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...HEADER_OPTS, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login"          component={LoginScreen}          options={{ headerShown: false }} />
      <Stack.Screen name="Register"       component={RegisterScreen}       options={{ title: 'Create Account' }} />
      <Stack.Screen name="VerifyEmail"    component={VerifyEmailScreen}    options={{ title: 'Verify Email' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs"           component={MainTabs}            options={{ headerShown: false }} />
      <Stack.Screen name="Subject"        component={SubjectDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chapter"        component={ChapterScreen}       options={HEADER_OPTS} />
      <Stack.Screen name="QuestionEntry"  component={QuestionEntryScreen} options={HEADER_OPTS} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const isLoading   = useAuthStore((s) => s.isLoading);
  const accessToken = useAuthStore((s) => s.accessToken);
  if (isLoading) return <LoadingScreen />;
  return (
    <NavigationContainer>
      {accessToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
