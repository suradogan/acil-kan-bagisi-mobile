import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Card, Badge, Divider, Button } from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as notificationService from '../services/notificationService';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadFilter, setUnreadFilter] = useState(false);

  const loadNotifications = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
      }
      
      const response = await notificationService.getNotifications(pageNum, 10, unreadFilter);
      
      if (response && response.results) {
        const newNotifications = response.results;
        
        if (refresh || pageNum === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setTotalCount(response.count || 0);
        setHasMore(newNotifications.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
      Alert.alert('Hata', 'Bildirimler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications(1, true);
  }, [unreadFilter]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(1, true);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      loadNotifications(page + 1);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Bildirimi okundu olarak işaretle
      const success = await notificationService.markNotificationAsRead(notification._id);
      
      if (success) {
        // Yerel listeyi güncelle
        setNotifications(prev => 
          prev.map(item => 
            item._id === notification._id 
              ? { ...item, is_read: true } 
              : item
          )
        );
      }
      
      // Hedef URL varsa yönlendir
      if (notification.target_url) {
        // Burada URL route mapping yapılabilir
        if (notification.target_url.includes('/emergency/')) {
          const id = notification.target_url.split('/').filter(Boolean).pop();
          navigation.navigate('EmergencyDetail', { requestId: id });
        } else if (notification.target_url.includes('/donations/history')) {
          navigation.navigate('DonationHistory');
        }
      }
    } catch (error) {
      console.error('Bildirim işlenirken hata:', error);
    }
  };

  const renderNotificationItem = ({ item }) => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString('tr-TR') + ' ' + 
                          date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    // Bildirim tipine göre ikon belirle
    let icon = 'bell';
    let iconColor = COLORS.primary;
    
    switch (item.notification_type) {
      case 'emergency':
        icon = 'ambulance';
        iconColor = COLORS.error;
        break;
      case 'donation_reminder':
        icon = 'calendar-check';
        iconColor = COLORS.info;
        break;
      case 'donation_thankyou':
        icon = 'heart';
        iconColor = COLORS.success;
        break;
      case 'appointment_reminder':
        icon = 'calendar-alt';
        iconColor = COLORS.warning;
        break;
    }
    
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <Card 
          style={[
            styles.notificationCard, 
            !item.is_read && styles.unreadCard
          ]}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
              <FontAwesome5 name={icon} size={20} color="#fff" />
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.titleText}>{item.title}</Text>
                {!item.is_read && <Badge style={styles.badge}>Yeni</Badge>}
              </View>
              
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const toggleUnreadFilter = () => {
    setUnreadFilter(!unreadFilter);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.title}>Bildirimler</Text>
      <Text style={styles.subtitle}>
        {totalCount} {unreadFilter ? 'okunmamış' : ''} bildirim
      </Text>
      
      <View style={styles.filterContainer}>
        <Button
          mode={unreadFilter ? 'contained' : 'outlined'}
          onPress={toggleUnreadFilter}
          style={styles.filterButton}
        >
          Okunmamışlar
        </Button>
      </View>
      
      <Divider style={styles.divider} />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="bell-slash" size={50} color={COLORS.textLight} />
      <Text style={styles.emptyText}>
        {unreadFilter ? 'Okunmamış bildiriminiz bulunmuyor' : 'Hiç bildiriminiz bulunmuyor'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading && renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 15,
    ...SHADOWS.small,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textLight,
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterButton: {
    marginRight: 10,
  },
  divider: {
    marginTop: 15,
  },
  notificationCard: {
    margin: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  titleText: {
    ...FONTS.h4,
    flex: 1,
  },
  messageText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 5,
  },
  dateText: {
    ...FONTS.caption,
    color: COLORS.textLight,
  },
  badge: {
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textLight,
    marginTop: 15,
    textAlign: 'center',
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.caption,
    color: COLORS.textLight,
    marginTop: 5,
  },
});

export default NotificationsScreen; 