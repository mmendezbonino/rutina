package uy.marcos.rutina;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

/**
 * Descanso en curso: muestra la cuenta regresiva en la pantalla de bloqueo y en la barra de notificaciones
 * (con +15 s y Saltar) y mantiene el celular despierto hasta que termina, para que el pitido suene en hora
 * aunque la pantalla esté apagada o estés en otra app.
 */
public class RestService extends Service {
    static final String CH_RUN = "contador";
    static final int ID_RUN = 6;

    /** Hora (ms) en que termina el descanso; 0 si no hay descanso en curso. */
    static volatile long end = 0;
    static volatile String next = "";

    private final Handler h = new Handler(Looper.getMainLooper());
    private final Runnable done = this::finishRest;
    private PowerManager.WakeLock wl;

    static void start(Context c, long endMs, String nextLabel) {
        Intent i = new Intent(c, RestService.class).setAction("start").putExtra("end", endMs).putExtra("next", nextLabel == null ? "" : nextLabel);
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
        } catch (Exception e) { /* si no se puede, queda la alarma de respaldo */ }
    }

    static void stop(Context c) {
        end = 0;
        try { c.startService(new Intent(c, RestService.class).setAction("stop")); } catch (Exception e) { /* no estaba corriendo */ }
    }

    static void channel(Context c) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel ch = new NotificationChannel(CH_RUN, "Descanso en curso", NotificationManager.IMPORTANCE_LOW);
        ch.setDescription("Cuenta regresiva del descanso en la pantalla de bloqueo");
        ch.setSound(null, null);
        ch.enableVibration(false);
        ch.setShowBadge(false);
        ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        c.getSystemService(NotificationManager.class).createNotificationChannel(ch);
    }

    @Override
    public int onStartCommand(Intent in, int flags, int startId) {
        String a = in == null ? "" : String.valueOf(in.getAction());
        switch (a) {
            case "start":
                end = in.getLongExtra("end", 0);
                next = in.getStringExtra("next");
                if (next == null) next = "";
                if (end <= System.currentTimeMillis()) { goForeground(); finishRest(); break; }
                goForeground();
                arm();
                break;
            case "add":
                if (end > 0) { end += 15000; Notif.schedule(this, end); goForeground(); arm(); }
                break;
            case "skip":
            case "stop":
                end = 0;
                Notif.cancel(this);
                quit(0);
                break;
            default:
                if (end <= 0) quit(0);
        }
        return START_NOT_STICKY;
    }

    private void goForeground() {
        channel(this);
        Notification n = build();
        try {
            if (Build.VERSION.SDK_INT >= 34) startForeground(ID_RUN, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            else startForeground(ID_RUN, n);
        } catch (Exception e) {
            // sin permiso para servicio en primer plano: queda la alarma de respaldo
            stopSelf();
        }
    }

    private void arm() {
        h.removeCallbacks(done);
        long wait = Math.max(0, end - System.currentTimeMillis());
        try {
            if (wl == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "rutina:descanso");
                wl.setReferenceCounted(false);
            }
            wl.acquire(wait + 15000);
        } catch (Exception e) { /* sin wakelock: la alarma de respaldo avisa igual */ }
        h.postDelayed(done, wait);
    }

    private void finishRest() {
        h.removeCallbacks(done);
        if (end > System.currentTimeMillis() + 500) { arm(); return; } // se sumaron segundos mientras tanto
        end = 0;
        Notif.fire(this);
        quit(2500); // deja terminar el pitido antes de soltar el celular
    }

    private void quit(long delay) {
        h.removeCallbacks(done);
        try {
            if (Build.VERSION.SDK_INT >= 24) stopForeground(Service.STOP_FOREGROUND_REMOVE); else stopForeground(true);
        } catch (Exception e) { /* nada */ }
        h.postDelayed(() -> {
            if (end > 0) return; // arrancó otro descanso
            try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception e) { /* nada */ }
            stopSelf();
        }, delay);
    }

    private PendingIntent act(String action, int code) {
        Intent i = new Intent(this, RestService.class).setAction(action);
        return PendingIntent.getService(this, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    @SuppressWarnings("deprecation")
    private Notification build() {
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH_RUN) : new Notification.Builder(this);
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        b.setSmallIcon(R.drawable.ic_stat)
                .setContentTitle("Descanso")
                .setContentText(next.isEmpty() ? "Tocá para volver a la rutina" : "Sigue: " + next)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setShowWhen(true)
                .setWhen(end)
                .setUsesChronometer(true)
                .setChronometerCountDown(true)
                .setColor(0xFF0B2A6B)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .setCategory(Notification.CATEGORY_PROGRESS)
                .setContentIntent(PendingIntent.getActivity(this, 4, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE))
                .addAction(new Notification.Action.Builder(0, "+15 s", act("add", 11)).build())
                .addAction(new Notification.Action.Builder(0, "Saltar", act("skip", 12)).build());
        // Android 16 / One UI 8: pide mostrarse como "actualización en vivo" (la barra de abajo de la pantalla de bloqueo)
        if (Build.VERSION.SDK_INT >= 36) b.setRequestPromotedOngoing(true);
        return b.build();
    }

    @Override
    public void onDestroy() {
        h.removeCallbacksAndMessages(null);
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception e) { /* nada */ }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent i) { return null; }
}
