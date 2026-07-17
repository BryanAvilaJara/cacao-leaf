import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Home, History, Info, ScanLine } from "lucide-react-native";

import { TabBar } from "./src/components/TabBar";
import { AnalyzeScreen } from "./src/screens/AnalyzeScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { InfoScreen } from "./src/screens/InfoScreen";
import { colors } from "./src/theme/colors";

type TabKey = "home" | "analyze" | "history" | "info";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          {activeTab === "home" && <HomeScreen onStart={() => setActiveTab("analyze")} />}
          {activeTab === "analyze" && <AnalyzeScreen />}
          {activeTab === "history" && <HistoryScreen />}
          {activeTab === "info" && <InfoScreen />}
        </View>
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "home", label: "Inicio", icon: Home },
            { key: "analyze", label: "Analizar", icon: ScanLine },
            { key: "history", label: "Historial", icon: History },
            { key: "info", label: "Info", icon: Info }
          ]}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  }
});
