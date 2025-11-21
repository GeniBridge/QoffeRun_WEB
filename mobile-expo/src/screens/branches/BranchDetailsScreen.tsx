import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { customerAPI, discoveryAPI } from '../../api/endpoints'
import { useCart } from '../../context/CartContext'

export default function BranchDetailsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'BranchDetails'>) {
  const { id } = route.params
  const [branch, setBranch] = useState<any>(null)
  const [menu, setMenu] = useState<any[]>([])
  const { addItem, setBranchId } = useCart()

  useEffect(() => {
    load()
    setBranchId(id)
  }, [id])

  const load = async () => {
    try {
      const resp = await discoveryAPI.getPublicBranch(id)
      setBranch(resp?.data?.data || null)
    } catch {}
    try {
      const menuResp = await customerAPI.getBranchMenu(id)
      setMenu(menuResp?.data?.menu || [])
    } catch {}
  }

  const addToCart = (menuItem: any) => {
    addItem({
      menu_item_id: menuItem.id,
      name: menuItem.name,
      price: Number(menuItem.price_raw ?? menuItem.price),
      qty: 1,
    })
    Alert.alert('Aggiunto al carrello', `${menuItem.name} aggiunto`)
  }

  return (
    <View style={{ flex: 1 }}>
      {branch && (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{branch.chain_name || branch.chain?.name}</Text>
          <Text style={{ fontSize: 16 }}>{branch.name}</Text>
          <Text style={{ color: '#666' }}>{branch.address} {branch.city}</Text>
          {branch.phone && <Text>☎ {branch.phone}</Text>}
          <Text style={{ color: '#f90', marginTop: 4 }}>⭐ {Number(branch.rating || 0).toFixed(1)}</Text>
        </View>
      )}
      <FlatList
        data={menu}
        keyExtractor={(cat) => String(cat.category)}
        renderItem={({ item }) => (
          <View style={{ padding: 12 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{item.category}</Text>
            {item.items.map((p: any) => (
              <TouchableOpacity key={p.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f1f1f1' }} onPress={() => addToCart(p)}>
                <Text style={{ fontWeight: '600' }}>{p.name}</Text>
                <Text>€{Number(p.price_raw ?? p.price).toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
        <Button title='Carrello' onPress={() => navigation.navigate('Cart')} />
        <Button title='I miei ordini' onPress={() => navigation.navigate('Orders')} />
      </View>
    </View>
  )
}
