import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, Button } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../../App'
import { customerAPI, discoveryAPI } from '../../api/endpoints'

export default function BranchListScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'BranchList'>) {
  const [branches, setBranches] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      // Prefer ordering-active branches for open/closed info
      const resp = await customerAPI.getOrderingBranches()
      const data = resp?.data?.data || []
      setBranches(data)
    } catch {
      const resp = await discoveryAPI.listPublicBranches()
      setBranches(resp?.data?.data || [])
    } finally {
      setLoading(false)
    }
  }

  const search = async () => {
    setLoading(true)
    try {
      const resp = await discoveryAPI.searchBranches({ query })
      setBranches(resp?.data?.data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <TextInput placeholder='Cerca bar o città' value={query} onChangeText={setQuery} style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 }} />
        <Button title='Cerca' onPress={search} />
      </View>
      <FlatList
        refreshing={loading}
        onRefresh={load}
        data={branches}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BranchDetails', { id: item.id })} style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.chain?.name || item.name}</Text>
            <Text>{item.name}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>{item.address || item.formatted_address}</Text>
            {item.accepting_orders === false ? (
              <Text style={{ color: 'red' }}>Chiuso ora</Text>
            ) : item.accepting_orders === true ? (
              <Text style={{ color: 'green' }}>Aperto ora</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
