import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { prayerTimes, addDays, toMin, fromMin } from './logic';
import { PRAYERS } from './data';

const WEB = Platform.OS === 'web';

if (!WEB) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export async function askPermission() {
  if (WEB) return false;
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const r = await Notifications.requestPermissionsAsync();
  return r.granted;
}

const daily = (title, body, time) => {
  const [hour, minute] = time.split(':').map(Number);
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
};
const at = (title, body, date) => {
  if (date <= new Date()) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
};

// Rebuild every reminder from the state. iOS keeps at most 64, so prayers cover the next 4 days
// and are rebuilt each time the app opens.
export async function rescheduleAll(state) {
  if (WEB || !state.profile) return;
  const ok = await askPermission();
  if (!ok) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const s = state.settings;
  const jobs = [];
  if (s.prayers) {
    for (let d = 0; d < 4; d++) {
      const t = prayerTimes(state.profile.city, addDays(new Date(), d));
      PRAYERS.forEach(([id, name]) => jobs.push(at(`حان وقت ${name}`, 'قُم وصلِّ في وقتها. الصلاة أول انتصار في اليوم.', t[id])));
    }
  }
  if (s.fajr) {
    // Fajr alarm: three reminders that get stronger, 3 minutes apart
    const w = toMin(s.wake);
    jobs.push(daily('⏰ قُم للفجر', 'ابتعد عن الفراش. توضّأ. هذا أول انتصار.', fromMin(w)));
    jobs.push(daily('⏰ ما زلت نائمًا؟', 'النفس تقول لك «خمس دقائق». لا تسمع لها. قُم الآن.', fromMin(w + 3)));
    jobs.push(daily('🔴 آخر نداء للفجر', '«الصلاة خير من النوم». ضع قدميك على الأرض.', fromMin(w + 6)));
    jobs.push(daily('🌙 وقت النوم بعد 30 دقيقة', 'هيّئ نفسك: الشاحن خارج الغرفة، والمنبّه بعيد.', fromMin(toMin(s.sleep) - 30)));
  }
  if (s.shield) jobs.push(daily('🛡️ درع الليل', 'الهاتف خارج غرفة النوم. إن جاءتك موجة فافتح زر الطوارئ.', '22:00'));
  if (s.sportOn) jobs.push(daily('💪 وقت الرياضة', 'ولو النسخة الصغيرة. لا تُضيّع يومين متتاليين.', s.sport));
  jobs.push(daily('📝 التقرير الليلي', 'أتمم يومك: الصلوات، العادات، وما الذي ربحته اليوم.', fromMin(toMin(s.sleep) - 60)));
  (state.tasks || []).forEach((t) => {
    if (t.daily) jobs.push(daily('📌 ' + t.t, 'مهمتك. أنجزها الآن.', t.time));
    else if (t.date) {
      const [h, m] = t.time.split(':').map(Number);
      const d = new Date(t.date + 'T00:00:00'); d.setHours(h, m, 0, 0);
      jobs.push(at('📌 ' + t.t, 'مهمتك. أنجزها الآن.', d));
    }
  });
  await Promise.all(jobs.filter(Boolean));
}
