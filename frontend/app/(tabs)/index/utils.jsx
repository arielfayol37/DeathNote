import * as Notifications from 'expo-notifications';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

export default formatTimestamp;

const scheduleDailyReminder = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Reminder',
        body: 'Don’t forget to write your note for today!',
      },
      trigger: {
        hour: 13,
        minute: 0,
        repeats: true,
      },
    });
  };