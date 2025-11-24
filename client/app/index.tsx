import React, { useState } from 'react';
import {ActivityIndicator,FlatList, ListRenderItem, StyleSheet, Text, TextInput, TouchableOpacity, 
  View } from 'react-native';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl

interface SearchResult {
  id: number;
  review: string;
  sentiment: string;
  similarity: number;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  error?: string;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const performSearch = async (): Promise<void> => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
        }),
      });

      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        alert('Search failed: ' + (data.error || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('Search error:', error);
      alert('Could not connect to server. Make sure backend is running on ' + BACKEND_URL);
    } finally {
      setLoading(false);
    }
  };

  const renderItem: ListRenderItem<SearchResult> = ({ item, index }) => (
    <View style={styles.resultCard}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.review} numberOfLines={5}>
        {item.review}
      </Text>
      <View style={styles.metadata}>
        <View style={[
          styles.sentimentBadge,
          item.sentiment === 'positive' ? styles.positive : styles.negative
        ]}>
          <Text style={styles.sentimentText}>
            {item.sentiment || 'neutral'}
          </Text>
        </View>
        <Text style={styles.similarity}>
          {(item.similarity * 100).toFixed(1)}% match
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movie Review Search</Text>
        <Text style={styles.subtitle}>Semantic search powered by local AI</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search reviews (e.g., 'exciting action movie')..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={performSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={performSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {results.length > 0 && (
        <Text style={styles.resultsCount}>
          Found {results.length} results
        </Text>
      )}

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item: SearchResult) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && searchQuery ? (
            <Text style={styles.emptyText}>No results found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 25,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 90,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsCount: {
    padding: 15,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rank: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  review: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
    paddingRight: 30,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positive: {
    backgroundColor: '#dcfce7',
  },
  negative: {
    backgroundColor: '#fee2e2',
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  similarity: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 50,
  },
});