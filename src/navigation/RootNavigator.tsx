import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  HomeStackNavigator,
  NetworkStackNavigator,
  PostStackNavigator,
  NotificationStackNavigator,
  TemplateStackNavigator,
  LoginStackNavigator,
} from "./StackNavigator";
import { AntDesign, EvilIcons, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TopHeader from "../components/TopHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGGED_IN_KEY } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

export type BottomTabparams = {
  Home: undefined;
  Network: undefined;
  Post: undefined;
  Notification: undefined;
  Template: undefined;
};

const BottomTab = createBottomTabNavigator<BottomTabparams>();

//only for testing
const clear = async () => {
    await AsyncStorage.removeItem(LOGGED_IN_KEY)
  }




const RootNavigator = () => {

  const { loggedIn, setLoggedIn } = useAuth()
  const [loading,setLoading] = useState(false)
  

  const check_loggedin = async () => {
    try {
      setLoading(true)
      const value = await AsyncStorage.getItem(LOGGED_IN_KEY);
      value != null?setLoggedIn(value === 'true'):setLoggedIn(false);
      
    } catch (error) {
      console.log('Error reading login status', error);
      setLoggedIn(false);
    }
    finally{
      setLoading(false)
    }
  };
  
  useEffect(()=> {
  check_loggedin()
  //clear()
    },[])
  
  if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading contacts...</Text>
        </View>
      )
    }

  return loggedIn? (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <TopHeader/>
      <BottomTab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff7f7ff',
            borderTopColor: '#f70000ff',
            height: 70,
          },
          tabBarActiveTintColor: '#000000ff',
          tabBarInactiveTintColor: '#888',
          tabBarIcon: ({ color , size  , focused }) => {

            if (route.name === 'Home') {
              return <Ionicons name="home-outline" size={focused?size +4 :size} color={color} />;
            } else if (route.name === 'Network') {
              return <Ionicons name="people-outline" size={focused?size +4 :size} color={color} />;
            } else if (route.name === 'Post') {
              return <MaterialIcons name="post-add" size={focused?size +4 :size} color={color} />;
            } else if (route.name === 'Notification') {
              return <EvilIcons name="bell" size={focused?size +4 :size} color="black" />
            } else if (route.name === 'Template') {
              return <Ionicons name="document-text-outline" size={focused?size +4 :size} color={color} />;
            }
          },
        })}
      >
        <BottomTab.Screen name="Home" component={HomeStackNavigator} />
        <BottomTab.Screen name="Network" component={NetworkStackNavigator} />
        <BottomTab.Screen name="Post" component={PostStackNavigator} />
        <BottomTab.Screen name="Notification" component={NotificationStackNavigator} />
        <BottomTab.Screen name="Template" component={TemplateStackNavigator} />
      </BottomTab.Navigator>
    </SafeAreaView>
  ):(
    <LoginStackNavigator/>
  )}
;

export default RootNavigator;
