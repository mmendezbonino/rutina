package uy.marcos.rutina;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Alarma del fin del descanso: la programa el sistema, así suena aunque la app esté cerrada o la pantalla apagada. */
final class Notif {
    static final String CH = "descanso2"; // sin sonido propio: el pitido lo hace beep() por el canal de la música
    static final String OLD_CH = "descanso";
    static final int ID = 5;
    static final long[] VIB = {0, 300, 120, 300, 120, 300};

    static void channel(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        try { nm.deleteNotificationChannel(OLD_CH); } catch (Exception e) { /* ya no estaba */ }
        NotificationChannel ch = new NotificationChannel(CH, "Fin del descanso", NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription("Aviso cuando termina el descanso entre series");
        ch.enableVibration(true);
        ch.setVibrationPattern(VIB);
        ch.setSound(null, null);
        nm.createNotificationChannel(ch);
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
            b.setPriority(Notification.PRIORITY_HIGH).setVibrate(VIB);
        }
        try {
            ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(ID, b.build());
        } catch (SecurityException e) {
            // sin permiso de notificaciones
        }
    }

    /** Tres pitidos por el canal de la música: suenan aunque el celular esté en vibrar y no le bajan el volumen a lo que estés escuchando. */
    static void beep() {
        try {
            final android.media.ToneGenerator tg = new android.media.ToneGenerator(android.media.AudioManager.STREAM_MUSIC, 100);
            final android.os.Handler h = new android.os.Handler(android.os.Looper.getMainLooper());
            for (int k = 0; k < 3; k++) h.postDelayed(() -> tg.startTone(android.media.ToneGenerator.TONE_PROP_BEEP, 180), k * 320L);
            h.postDelayed(tg::release, 1400);
        } catch (Exception e) { /* sin audio */ }
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
