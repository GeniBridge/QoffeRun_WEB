import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { useAuth } from '../../context/AuthContext'

export default function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async () => {
    try {
      await register(name.trim(), email.trim(), password)
      navigation.replace('BranchList')
    } catch (e) {
      Alert.alert('Errore', 'Registrazione non riuscita')
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Crea Account</Text>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 }} />
      <Button title="Registrati" onPress={onSubmit} />
    </View>
  )
}
