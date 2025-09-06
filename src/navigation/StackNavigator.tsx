import React from "react";
import { View, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomePage/HomeScreen";
import NotificationScreen from "../screens/NotificationPage/NotificationScreen";
import NetworkScreen from "../screens/NetworkPage/NetworkScreen";
import PostScreen from "../screens/PostPage/PostScreen";
import TemplatesScreen from "../screens/TemplatePage/TemplatesScreen";
import Welcome from "../screens/LoginPage/WelcomeScreen";
import SignupScreen from "../screens/LoginPage/SignupScreen";
import NameScreen from "../screens/LoginPage/NameScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneNumberScreen from "../screens/LoginPage/PhoneNumberScreen";
import SigninScreen from "../screens/LoginPage/SigninScreen";
import OtpScreen from "../screens/LoginPage/OtpScreen";
import CreatePost from "../screens/PostPage/CreatePost";
// ✅ Route param types
export type LoginPageParams = {
  WelcomeScreen : undefined;
  NameScreen : undefined;
  SignupScreen : {name : string , phone : string };
  SigninScreen : undefined;
  PhoneNumberScreen : {name : string};
  OtpScreen : {email : string} | {email : string, name : string , phone : string };

}
export type HomePageParams = {
  HomeScreen: undefined;
};

export type NetworkPageParams = {
  NetworkScreen: undefined;
};

export type PostPageParams = {
  PostScreen: undefined;
  CreatePostScreen : undefined;
};

export type NotificationPageParams = {
  NotificationScreen: undefined;
};

export type TemplatePageParams = {
  TemplateScreen: undefined;
};

// ✅ Stack Navigators
const HomeStack = createStackNavigator<HomePageParams>();
const NetworkStack = createStackNavigator<NetworkPageParams>();
const PostStack = createStackNavigator<PostPageParams>();
const NotificationStack = createStackNavigator<NotificationPageParams>();
const TemplateStack = createStackNavigator<TemplatePageParams>();
const LoginStack = createStackNavigator<LoginPageParams>();



// ✅ Stack Navigators
export const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{headerShown : false}}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
  </HomeStack.Navigator>
);

export const NetworkStackNavigator = () => (
  <NetworkStack.Navigator screenOptions={{ headerShown: false }}>
    <NetworkStack.Screen name="NetworkScreen" component={NetworkScreen} />
  </NetworkStack.Navigator>
);

export const PostStackNavigator = () => (
  <PostStack.Navigator screenOptions={{ headerShown: false }}>
    <PostStack.Screen name="PostScreen" component={PostScreen} />
    <PostStack.Screen name= 'CreatePostScreen' component={CreatePost} />
  </PostStack.Navigator>
);

export const NotificationStackNavigator = () => (
  <NotificationStack.Navigator screenOptions={{ headerShown: false }}>
    <NotificationStack.Screen name="NotificationScreen" component={NotificationScreen} />
  </NotificationStack.Navigator>
);

export const TemplateStackNavigator = () => (
  <TemplateStack.Navigator screenOptions={{ headerShown: false }}>
    <TemplateStack.Screen name="TemplateScreen" component={TemplatesScreen} />
  </TemplateStack.Navigator>
);

export const LoginStackNavigator = () => (
  <LoginStack.Navigator screenOptions={{ headerShown: false }}>
    
    <LoginStack.Screen name='WelcomeScreen' component={Welcome}/>
    <LoginStack.Screen name='SigninScreen' component={SigninScreen}/>
    <LoginStack.Screen name='SignupScreen' component={SignupScreen}/>
    <LoginStack.Screen name='NameScreen' component={NameScreen}/>
    <LoginStack.Screen name='PhoneNumberScreen' component={PhoneNumberScreen}/>
    <LoginStack.Screen name='OtpScreen' component={OtpScreen}/>
    
   
  </LoginStack.Navigator>
)