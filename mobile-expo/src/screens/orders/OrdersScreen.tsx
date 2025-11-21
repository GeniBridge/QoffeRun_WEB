import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, RefreshControl } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { ordersAPI } from '../../api/endpoints'

export default function OrdersScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Orders'>) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const resp = await ordersAPI.myOrders({ per_page: 20 })
      setOrders(resp?.data?.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={orders}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>#{item.order_number || item.id} • {item.status}</Text>
            <Text>€{Number(item.total).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={{ padding: 16 }}>Nessun ordine</Text> : null}
      />
    </View>
  )
}
