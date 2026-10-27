package uy.marcos.rutina;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;

/** Alarma del fin del descanso: la programa el sistema, así suena aunque la app esté cerrada o la pantalla apagada. */
final class Notif {
    static final String CH = "descanso";
    static final int ID = 5;
    static final long[] VIB = {0, 300, 120, 300, 120, 300};

    static void channel(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel ch = new NotificationChannel(CH, "Fin del descanso", NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription("Aviso cuando termina el descanso entre series");
        ch.enableVibration(true);
        ch.setVibrationPattern(VIB);
        AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
        ch.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), aa);
        c.getSystemService(NotificationManager.class).createNotificationChannel(ch);
    }

    private static PendingIntent alarmIntent(Context c) {
        Intent i = new Intent(c, RestReceiver.class);
        return PendingIntent.getBroadcast(c, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent openIntent(Context c, int code) {
        Intent i = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(c, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void schedule(Context c, long at) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent p = alarmIntent(c);
        am.cancel(p);
        if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            return;
        }
        am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, openIntent(c, 2)), p);
    }

    static void cancel(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        am.cancel(alarmIntent(c));
        ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ID);
    }

    static void show(Context c) {
        channel(c);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CH) : new Notification.Builder(c);
        b.setSmallIcon(R.drawable.ic_stat)
                .setContentTitle("Descanso terminado")
                .setContentText("Arrancá la próxima serie")
                .setAutoCancel(true)
                .setContentIntent(openIntent(c, 3))
                .setCategory(Notification.CATEGORY_ALARM);
        if (Build.VERSION.SDK_INT < 26) {
            b.setPriority(Notification.PRIORITY_HIGH).setVibrate(VIB).setDefaults(Notification.DEFAULT_SOUND);
        }
        try {
            ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(ID, b.build());
        } catch (SecurityException e) {
            // sin permiso de notificaciones
        }
    }

    static String status(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        boolean on = nm.areNotificationsEnabled();
        int imp = -1;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = nm.getNotificationChannel(CH);
            imp = ch == null ? -1 : ch.getImportance();
        }
        boolean exact = true;
        if (Build.VERSION.SDK_INT >= 31) exact = ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms();
        return "{\"on\":" + on + ",\"imp\":" + imp + ",\"exact\":" + exact + ",\"sdk\":" + Build.VERSION.SDK_INT + "}";
    }

    private Notif() {}
}
