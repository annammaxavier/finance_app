import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
// Helper function to get the local date
const getLocalDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split("T")[0];
};
const ExpenseApp = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("daily");
  const [transactions, setTransactions] = useState({
    daily: [
      { id: 1, description: "Breakfast - Cafe Latte", amount: -5, date: "2024-12-11" },
      { id: 2, description: "Taxi to Work", amount: -12, date: "2024-12-11" },
      { id: 3, description: "Groceries", amount: -25 , date: "2024-12-11"},
    ],
    weekly: [
      { id: 1, description: "Freelance Income", amount: 500, date: "2024-12-08" },
      { id: 2, description: "Electricity Bill", amount: -100, date: "2024-12-09" },
      { id: 3, description: "Shopping - Clothes", amount: -200, date: "2024-12-09" },
    ],
    monthly: [
      { id: 1, description: "Rent", amount: -800, date: "2024-12-01" },
      { id: 2, description: "Salary", amount: 5000, date: "2024-12-01" },
      { id: 3, description: "Internet Bill", amount: -50, date: "2024-12-02" },
    ],
  });

  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [date, setDate] = useState("");

  // Update the date when the component mounts
  useEffect(() => {
    setDate(getLocalDate());
  }, []);
  
  const handleBackToHome = () => {
    navigation.navigate("Home");
  };

  const handleAddTransaction = async () => {
    if (!newDescription || !newAmount || !date) {
      Alert.alert("Error", "Please fill out all fields, including the date.");
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount)) {
      Alert.alert("Error", "Amount must be a valid number.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description: newDescription,
      amount,
      date,
    };

    const updatedTransactions = {
      ...transactions,
      [activeTab]: [...transactions[activeTab], newTransaction],
    };

    setTransactions(updatedTransactions);
    logToGoogleCalendar(newTransaction, "Added");
    setNewDescription("");
    setNewAmount("");
    setDate(new Date().toISOString().split("T")[0]); 
  };
  
  const handleDeleteTransaction = (id) => {
    const transactionToDelete = transactions[activeTab].find((t) => t.id === id);

    const updatedTransactions = {
      ...transactions,
      [activeTab]: transactions[activeTab].filter((transaction) => transaction.id !== id),
    };

    setTransactions(updatedTransactions);
    logToGoogleCalendar(transactionToDelete, "Deleted");
  };

 
const logToGoogleCalendar = async (transaction, action) => {
  try {
    const accessToken = "https://www.googleapis.com/auth/calendar"; 
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        summary: `${action} Transaction: ${transaction.description}`,
        description: `Amount: ${transaction.amount > 0 ? "+" : ""}$${transaction.amount}\nDate: ${transaction.date}`,
        start: { date: transaction.date },
        end: { date: transaction.date },
      }),
    });
 
    if (!response.ok) {
      const error = await response.json();
      console.error("Google Calendar API Error:", error);
      Alert.alert("Google Calendar Error", "Failed to log transaction.");
    }
  } catch (error) {
    console.error("Network Error:", error);
    Alert.alert("Google Calendar Error", "An error occurred while logging the transaction.");
  }
};
  const totals = useMemo(() => {
    const totalIncome = transactions[activeTab]
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions[activeTab]
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome + totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [transactions, activeTab]);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionDescription}>{item.description}</Text>
      <Text style={[styles.transactionAmount, item.amount > 0 ? styles.positive : styles.negative]}>
        {item.amount > 0 ? `+ $${item.amount}` : `- $${Math.abs(item.amount)}`}
      </Text>
      <Text style={styles.transactionDate}>{item.date}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTransaction(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonWrapper} onPress={handleBackToHome}>
          <Ionicons name="arrow-back-outline" size={25} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}><h1>Expense App</h1></Text>
      </View>

      <View style={styles.tabs}>
        {["daily", "weekly", "monthly"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab ? styles.activeTab : null]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab ? styles.activeTabText : null]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totalsContainer}>
        <Text style={styles.totalText}>Balance: ${totals.balance.toFixed(2)}</Text>
        <Text style={styles.totalText}>Income: ${totals.totalIncome.toFixed(2)}</Text>
        <Text style={styles.totalText}>Expenses: ${totals.totalExpense.toFixed(2)}</Text>
      </View>

      <FlatList
        data={transactions[activeTab]}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.transactionList}
      />

      <View style={styles.addTransactionForm}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newDescription}
          onChangeText={setNewDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount (e.g., -50 or 100)"
          keyboardType="numeric"
          value={newAmount}
          onChangeText={setNewAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1e90ff",
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  backButtonWrapper: {
    position: "absolute",
    left: 10,
  },
  headerTitle: {
    fontSize:    24,
    fontWeight: "bold",
    color: "blue",
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tabButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  activeTab: {
    backgroundColor: "#7a5eb7",
  },
  tabButtonText: {
    fontSize: 16,
    color: "#000",
  },
  activeTabText: {
    color: "#fff",
  },
  totalsContainer: {
    padding: 20,
    backgroundColor: "lightgreen",
    borderRadius: 10,
    margin: 10,
  },
  totalText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 5,
  },
  transactionList: {
    padding: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "cyan",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "skyblue",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  transactionDescription: {
    fontSize: 16,
    color: "#000",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  positive: {
    color: "green",
  },
  negative: {
    color: "red",
  },
  transactionDate: {
    fontSize: 14,
    color: "#555",
  },
  deleteButton: {
    padding: 5,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  addTransactionForm: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ExpenseApp;







