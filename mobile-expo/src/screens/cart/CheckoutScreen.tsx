import React, { useState } from 'react'
import { View, Text, Button, TextInput, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { useCart } from '../../context/CartContext'
import { ordersAPI } from '../../api/endpoints'

export default function CheckoutScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>) {
  const { items, totalPrice, clearCart, branchId } = useCart()
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  const pay = async () => {
    if (items.length === 0 || !branchId) {
      Alert.alert('Errore', 'Carrello vuoto o branch non selezionato')
      return
    }
    if (!customerName || !customerEmail) {
      Alert.alert('Errore', 'Inserisci nome e email')
      return
    }
    setLoading(true)
    try {
      const orderItems = items.map((it) => ({
        menu_item_id: it.menu_item_id,
        quantity: it.qty,
        extras: it.extras || [],
      }))

      await ordersAPI.createDirectOrder({
        branch_id: branchId,
        items: orderItems,
        customer_name: customerName,
        customer_email: customerEmail,
        payment_method_id: 'pm_card_visa',
        notes: '',
      })

      clearCart()
      Alert.alert('Ordine completato!', 'Il tuo ordine è stato ricevuto.')
      navigation.replace('Orders')
    } catch (err: any) {
      Alert.alert('Errore', err?.response?.data?.message || 'Pagamento fallito')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Riepilogo Ordine</Text>
      <Text style={{ marginBottom: 12 }}>Totale: €{totalPrice.toFixed(2)}</Text>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, marginTop: 16 }}>Dati Cliente</Text>
      <TextInput placeholder='Nome' value={customerName} onChangeText={setCustomerName} style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }} />
      <TextInput placeholder='Email' value={customerEmail} onChangeText={setCustomerEmail} style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }} />
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, marginTop: 16 }}>Pagamento</Text>
      <Text style={{ color: '#666', marginBottom: 8 }}>Modalità di pagamento: Carta (test mode)</Text>
      <Button title={loading ? 'Attendere...' : 'Paga ora'} onPress={pay} disabled={loading} />
    </View>
  )
}
