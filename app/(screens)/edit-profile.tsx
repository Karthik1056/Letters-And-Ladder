import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import { updateUserInfo } from '@/Services/User/UserService';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const updates: any = {};
      let passwordChanged = false;
      
      // Check if name changed
      if (name !== user?.name) {
        updates.name = name;
      }
      
      // Check if password update is requested
      if (newPassword) {
        if (!oldPassword) {
          Alert.alert('Error', 'Current password is required to set a new password.');
          setLoading(false);
          return;
        }

        if (newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        if (newPassword === oldPassword) {
          Alert.alert('Error', 'New password cannot be the same as the current password.');
          setLoading(false);
          return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email) {
          const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, newPassword);
          passwordChanged = true;
        }
      }

      if (Object.keys(updates).length > 0) {
         await updateUserInfo(updates);
      }

      if (Object.keys(updates).length > 0 || passwordChanged) {
        setOldPassword('');
        setNewPassword('');
        Alert.alert('Success', 'Profile updated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <Stack.Screen
        options={{
          headerTitle: () => <Text style={styles.headerTitle}>Edit Profile</Text>,
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerBackground: () => (
            <LinearGradient colors={['#3b82f6', '#60a5fa']} style={styles.headerBackground} />
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Change Password</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Ionicons name={showOldPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  headerBackground: { flex: 1 },
  headerTitle: { fontFamily: 'CustomFont-Bold', color: '#fff', fontSize: 20, includeFontPadding: false, textAlignVertical: 'center' },
  backButton: { marginLeft: 16, marginTop: -4, padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 9999 },
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: 'CustomFont-Bold', color: '#475569', marginBottom: 8, includeFontPadding: false },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, fontFamily: 'CustomFont-Regular', color: '#1e293b', includeFontPadding: false },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
  sectionHeader: { fontSize: 16, fontFamily: 'CustomFont-Bold', color: '#334155', marginBottom: 16, includeFontPadding: false },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  saveButtonText: { fontSize: 18, fontFamily: 'CustomFont-Bold', color: '#fff', includeFontPadding: false },
});