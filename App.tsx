/**
 * TextExtractor - Universal File Processing & Content Analysis App
 * Features: File upload, OCR, AI summarization, content visualization
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator, BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, StyleSheet, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens

// Import providers
import {FileProvider} from './src/context/FileContext';
import {ThemeProvider} from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import FileUploadScreen from './src/screens/FileUploadScreen';
import ExtractedContentScreen from './src/screens/ExtractedContentScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type TabParamList = {
  Home: undefined;
  Upload: undefined;
  Content: undefined;
  Timeline: undefined;
  Search: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator();

function MainTabs(): React.ReactElement {
  return (
    <Tab.Navigator
      screenOptions={({route}: {route: {name: keyof TabParamList}}) => {
        const iconName =
          route.name === 'Home' ? 'home'
          : route.name === 'Upload' ? 'cloud-upload'
          : route.name === 'Content' ? 'description'
          : route.name === 'Timeline' ? 'timeline'
          : route.name === 'Search' ? 'search'
          : 'help';
        return {
          tabBarIcon: ({focused, color, size}: {focused: boolean; color: string; size: number}) => (
            <Icon name={iconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Upload" component={FileUploadScreen} />
      <Tab.Screen name="Content" component={ExtractedContentScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider >
      <FileProvider >
        <NavigationContainer>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? '#000' : '#fff'}
          />
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </FileProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
