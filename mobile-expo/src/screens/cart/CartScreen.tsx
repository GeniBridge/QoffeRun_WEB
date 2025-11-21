import React from 'react'
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { useCart } from '../../context/CartContext'

export default function CartScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Cart'>) {
  const { items, removeItem, totalPrice } = useCart()

  const checkout = () => {
    if (items.length === 0) return
    navigation.navigate('Checkout')
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.menu_item_id)}
        ListEmptyComponent={<Text>Il carrello è vuoto</Text>}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>€{item.price.toFixed(2)} x {item.qty}</Text>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.menu_item_id)}>
              <Text style={{ color: 'red' }}>Rimuovi</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Totale: €{totalPrice.toFixed(2)}</Text>
        <Button title='Procedi al pagamento' onPress={checkout} disabled={items.length === 0} />
      </View>
    </View>
  )
}
