import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import Icon from '@/components/Icon.web';
import { BusinessHours } from '@/types';

interface BusinessHoursCardProps {
  businessHours: BusinessHours;
}

const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({ businessHours }) => {
  const [showAllHours, setShowAllHours] = useState(false);

  const dayLabels = {
    monday: '月曜日',
    tuesday: '火曜日',
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日',
    sunday: '日曜日',
  };

  const dayOrder: (keyof BusinessHours)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const getCurrentDay = (): keyof BusinessHours => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayMap: { [key: number]: keyof BusinessHours } = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    return dayMap[today];
  };

  const formatTime = (time: string): string => {
    // Handle special case for late night hours (e.g., "25:00" -> "翌1:00")
    const [hours, minutes] = time.split(':').map(Number);
    if (hours >= 24) {
      return `翌${hours - 24}:${minutes.toString().padStart(2, '0')}`;
    }
    return time;
  };

  const formatHours = (open: string, close: string): string => {
    return `${formatTime(open)} - ${formatTime(close)}`;
  };

  const isClosedDay = (open: string, close: string): boolean => {
    return open === '00:00' && close === '00:00';
  };

  const getCurrentDayHours = () => {
    const currentDay = getCurrentDay();
    const hours = businessHours[currentDay];
    
    if (isClosedDay(hours.open, hours.close)) {
      return '定休日';
    }
    
    return formatHours(hours.open, hours.close);
  };

  const getCurrentDayStatus = () => {
    const currentDay = getCurrentDay();
    const hours = businessHours[currentDay];
    
    if (isClosedDay(hours.open, hours.close)) {
      return { text: '定休日', color: '#F44336', icon: 'cancel' };
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const [openHours, openMinutes] = hours.open.split(':').map(Number);
    const [closeHours, closeMinutes] = hours.close.split(':').map(Number);
    
    const openTime = openHours * 100 + openMinutes;
    let closeTime = closeHours * 100 + closeMinutes;
    
    // Handle next day closing (e.g., 25:00 = 1:00 next day)
    if (closeHours >= 24) {
      closeTime = (closeHours - 24) * 100 + closeMinutes;
      // If current time is before the adjusted close time, it's still open
      if (currentTime <= closeTime || currentTime >= openTime) {
        return { text: '営業中', color: '#4CAF50', icon: 'check-circle' };
      }
    } else {
      // Normal case
      if (currentTime >= openTime && currentTime <= closeTime) {
        return { text: '営業中', color: '#4CAF50', icon: 'check-circle' };
      }
    }
    
    return { text: '営業時間外', color: '#FF9800', icon: 'schedule' };
  };

  const renderDayHours = (day: keyof BusinessHours, isToday: boolean = false) => {
    const hours = businessHours[day];
    const isClosed = isClosedDay(hours.open, hours.close);
    
    return (
      <View key={day} style={[styles.hoursRow, isToday && styles.todayRow]}>
        <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
          {dayLabels[day]}
        </Text>
        <Text style={[
          styles.hoursText,
          isToday && styles.todayHours,
          isClosed && styles.closedText
        ]}>
          {isClosed ? '定休日' : formatHours(hours.open, hours.close)}
        </Text>
      </View>
    );
  };

  const status = getCurrentDayStatus();
  const currentDay = getCurrentDay();

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>営業時間</Text>
        
        {/* Current Status */}
        <View style={styles.statusContainer}>
          <Icon name={status.icon} size={20} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
        
        {/* Today's Hours */}
        <View style={styles.todayContainer}>
          <Text style={styles.todayTitle}>本日 ({dayLabels[currentDay]})</Text>
          <Text style={styles.todayHoursText}>
            {getCurrentDayHours()}
          </Text>
        </View>
        
        {/* Show All Hours Button */}
        {!showAllHours && (
          <Button
            mode="text"
            onPress={() => setShowAllHours(true)}
            style={styles.showAllButton}
            labelStyle={styles.showAllButtonText}
          >
            全ての営業時間を表示
          </Button>
        )}
        
        {/* All Hours */}
        {showAllHours && (
          <View style={styles.allHoursContainer}>
            {dayOrder.map((day) => renderDayHours(day, day === currentDay))}
            
            <Button
              mode="text"
              onPress={() => setShowAllHours(false)}
              style={styles.showAllButton}
              labelStyle={styles.showAllButtonText}
            >
              営業時間を閉じる
            </Button>
          </View>
        )}
        
        {/* Additional Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>
            ※ 営業時間は変更される場合があります。詳細は直接店舗にお問い合わせください。
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  todayContainer: {
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  todayHoursText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  showAllButton: {
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  showAllButtonText: {
    fontSize: 14,
  },
  allHoursContainer: {
    marginTop: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  todayRow: {
    backgroundColor: '#E8F5E8',
    borderRadius: 4,
    marginVertical: 2,
  },
  dayLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  todayLabel: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  hoursText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  todayHours: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closedText: {
    color: '#F44336',
    fontStyle: 'italic',
  },
  notesContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#FF8F00',
    lineHeight: 16,
  },
});

export default BusinessHoursCard;