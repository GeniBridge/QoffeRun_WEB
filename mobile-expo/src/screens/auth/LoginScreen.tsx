import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { useAuth } from '../../context/AuthContext'

export default function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async () => {
    try {
      await login(email.trim(), password)
      navigation.replace('BranchList')
    } catch (e: any) {
      Alert.alert('Errore', 'Accesso non riuscito')
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Accedi</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <Button title="Accedi" onPress={onSubmit} />
      <View style={{ height: 16 }} />
      <Button title="Registrati" onPress={() => navigation.navigate('Register')} />
      <View style={{ height: 8 }} />
      <Button title="Password dimenticata" onPress={() => navigation.navigate('ResetPassword')} />
    </View>
  )
}
