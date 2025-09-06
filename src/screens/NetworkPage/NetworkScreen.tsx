import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import PhoneContactScreen from './sub_network_page/PhoneContactScreen'
import { SafeAreaView } from 'react-native-safe-area-context'
import DegreeOneScreen from './sub_network_page/DegreeOneScreen'
import DegreeTwoScreen from './sub_network_page/DegreeTwoScreen'

const ContactLevel = [0, 1, 2]

const getLevelName = (level: number): string => {
  switch (level) {
    case 0:
      return "phone"
    case 1:
      return "friends"
    case 2:
      return "mutuals"
    default:
      return "unknown"
  }
}
const NetworkScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState(0)

  const renderLevelBox = (level: number) => {
    const isSelected = selectedLevel === level
    const level_name = getLevelName(level)
    return (
      <TouchableOpacity
        key={level}
        style={[
          styles.levelBox,
          isSelected ? styles.selectedBox : styles.unselectedBox
        ]}
        onPress={() => setSelectedLevel(level)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.levelText,
          isSelected ? styles.selectedText : styles.unselectedText
        ]}>
          {level_name}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderSelectedContent = () => {
    switch (selectedLevel) {
      case 0:
        return <PhoneContactScreen />
      case 1:
        return <DegreeOneScreen/>
          
      case 2:
        return <DegreeTwoScreen/>
      default:
        return <PhoneContactScreen />
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection Level Selection */}
      <View style={styles.levelContainer}>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.levelScrollView}
          contentContainerStyle={styles.levelScrollContent}
        >
          {ContactLevel.map(level => renderLevelBox(level))}
        </ScrollView>
      </View>

      {/* Selected Content */}
      <View style={styles.contentContainer}>
        {renderSelectedContent()}
      </View>
    </SafeAreaView>
  )
}

export default NetworkScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  levelContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  levelScrollView: {
    flexGrow: 0,
  },
  levelScrollContent: {
    paddingRight: 16,
  },
  levelBox: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectedBox: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  unselectedBox: {
    backgroundColor: '#ffffff',
    borderColor: '#dee2e6',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: '#ffffff',
  },
  unselectedText: {
    color: '#6c757d',
  },
  contentContainer: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  placeholderSubText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
})