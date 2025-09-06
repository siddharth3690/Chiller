import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGGED_IN_KEY, USER_ID_KEY, USER_NAME_KEY } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/superbase";

const TopHeader = ({ profileUri }: { profileUri?: string }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { setLoggedIn } = useAuth()
  const [name, setName] = useState('')


  const log_out = async () => {
    await AsyncStorage.removeItem(LOGGED_IN_KEY)
    await AsyncStorage.removeItem(USER_ID_KEY)
    await AsyncStorage.removeItem(USER_NAME_KEY)
    setLoggedIn(false)
  }


  const getUser = async () => {
    try {
      const user_id = await AsyncStorage.getItem(USER_ID_KEY);

      if (!user_id) {
        throw new Error("No user_id found in AsyncStorage");
      }

      const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("id", user_id)
        .single(); // Expect only one user

      if (error) {
        throw error;
      }

      if (!data || !data.name) {
        throw new Error("No user found with given id");
      }

      const user_name: string = data.name;
      await AsyncStorage.setItem(USER_NAME_KEY, user_name);

      setName(user_name)
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };
  useEffect(() => {
    getUser()
  })

  return (
    <>
      {/* Header */}
      <View style={styles.headerContainer}>
        {/* Profile Pic */}
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => setModalVisible(true)} // open modal
        >
          {profileUri ? (
            <Image source={{ uri: profileUri }} style={styles.profilePic} />
          ) : (
            <Ionicons name="person" size={24} color="black" />
          )}
        </TouchableOpacity>

        {/* Center Logo */}
        <Image
          source={require("../../assets/ChillerText.png")}
          style={styles.logo}
          resizeMode="cover"
        />

        {/* Chat Icon */}
        <TouchableOpacity>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color="black"
          />
        </TouchableOpacity>
      </View>

      {/* Profile Drawer Modal */}
      <Modal
        isVisible={modalVisible}
        animationIn="slideInLeft"
        animationOut="slideOutLeft"
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modalWrapper}
      >
        <View style={styles.drawerContainer}>
          <Text style={styles.modalTitle}>Profile</Text>
          <View style={{ flexDirection: "row" }}>
            
            {profileUri ? (
              <Image source={{ uri: profileUri }} style={styles.modalProfilePic} />
            ) : (
              <Ionicons name="person-circle" size={80} color="gray" />
            )}

            <Text style={styles.modalName}>{name}</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => log_out()}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>log out</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
  },
  logo: {
    width: 120,
    height: 40,
  },
  modalWrapper: {
    margin: 0, // full screen
    justifyContent: "flex-start",
  },
  drawerContainer: {
    width: "75%", // like LinkedIn drawer
    height: "100%",
    backgroundColor: "white",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  modalName : {
    alignSelf : 'center',
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  modalProfilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default TopHeader;
