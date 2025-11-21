import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { authAPI } from '../../api/endpoints'

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')

  const onForgot = async () => {
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      Alert.alert('OK', 'Email inviata (se registrato). Controlla la casella di posta.')
    } catch {
      Alert.alert('Errore', 'Impossibile inviare l\'email')
    }
  }

  const onReset = async () => {
    try {
      await authAPI.resetPassword({ email: email.trim(), token: token.trim(), password })
      Alert.alert('OK', 'Password aggiornata')
    } catch {
      Alert.alert('Errore', 'Reset non riuscito')
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Recupera Password</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <Button title="Invia email di reset" onPress={onForgot} />
      <View style={{ height: 16 }} />
      <TextInput placeholder="Token ricevuto via email" value={token} onChangeText={setToken} autoCapitalize='none' style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <TextInput placeholder="Nuova password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <Button title="Imposta nuova password" onPress={onReset} />
    </View>
  )
}
