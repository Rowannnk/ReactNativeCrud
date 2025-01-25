import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { data } from "@/data/todos";
import { Ionicons } from "react-native-vector-icons";
import { useState, useContext, useEffect } from "react";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { ThemeContext } from "@/context/ThemeContext";
import Octicons from "@expo/vector-icons/Octicons";
import Animated, { LinearTransition } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Index() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);

  const router = useRouter();

  const [loaded, error] = useFonts({
    Inter_500Medium,
  });

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;
      setTodos([{ id: newId, title: text, completed: false }, ...todos]);
      setText("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storageTodos && storageTodos.length) {
          setTodos(storageTodos.sort((a, b) => b.id - a.id));
        } else {
          setTodos(data.sort((a, b) => b.id - a.id));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [data]);

  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todos);
        await AsyncStorage.setItem("TodoApp", jsonValue);
      } catch (error) {
        console.error(error);
      }
    };
    storeData();
  }, [todos]);

  if (!loaded) {
    if (error) {
      console.error("Font loading error:", error);
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "red" }}>
            Failed to load fonts.
          </Text>
        </View>
      );
    }
    return null; // Show nothing while fonts are loading
  }

  const styles = createStyles(theme, colorScheme);

  const separatorComp = <View style={styles.separator} />;

  const handlePress = (id) => {
    router.push(`/todos/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="Add a new todo"
          placeholderTextColor="#aaa"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.button} onPress={addTodo}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={{ marginLeft: 10 }}
        >
          {colorScheme === "dark" ? (
            <Octicons name="moon" size={36} color={theme.text} />
          ) : (
            <Octicons name="sun" size={36} color={theme.text} />
          )}
        </Pressable>
      </View>
      <Animated.FlatList
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={separatorComp}
        keyboardDismissMode="on-drag"
        itemLayoutAnimation={LinearTransition}
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              onPress={() => handlePress(item.id)}
              onLongPress={() => toggleTodo(item.id)}
            >
              <Text style={item.completed ? styles.completedText : styles.text}>
                {item.title}
              </Text>
            </Pressable>
            <TouchableOpacity onPress={() => removeTodo(item.id)}>
              <Ionicons name="trash-bin" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
    },
    input: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: "#fff",
      paddingHorizontal: 8,
      marginVertical: 12,
      flex: 0.7,
      marginRight: 10,
      fontFamily: "Inter_500Medium",
      color: theme.text,
    },
    inputView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    button: {
      flex: 0.3,
      backgroundColor: theme.button,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 8,
      height: 40,
      borderWidth: 1,
    },
    buttonText: {
      color: colorScheme === "dark" ? "black" : "white",
      fontWeight: "bold",
    },
    separator: {
      height: 1,
      width: "100%",
      marginHorizontal: "auto",
      marginBottom: 10,
      backgroundColor: "black",
    },
    row: {
      flexDirection: "row",
      width: "100%",
      maxWidth: 600,
      height: 40,
      alignItems: "center",
      justifyContent: "space-between",
    },
    text: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      color: theme.text,
    },
    completedText: {
      fontSize: 16,
      textDecorationLine: "line-through",
      color: "gray",
    },
  });
}
