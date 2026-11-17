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
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;

/**
 * Descanso en curso: muestra la cuenta regresiva en la pantalla de bloqueo y en la barra de notificaciones
 * (con +15 s y Saltar) y mantiene el celular despierto hasta que termina, para que el pitido suene en hora
 * aunque la pantalla esté apagada o estés en otra app.
 */
public class RestService extends Service {
    static final String CH_RUN = "contador";
    static final int ID_RUN = 6;
    static final String CH_WEAR = "pulsera";
    static final int ID_WEAR = 9;
    /** Cómo se muestra el contador en la pulsera: "off", "media" (control de música) o "notif" (notificación que se actualiza). */
    static String wearMode(Context c) { return c.getSharedPreferences("rutina", MODE_PRIVATE).getString("wear", "off"); }
    static void setWearMode(Context c, String m) { c.getSharedPreferences("rutina", MODE_PRIVATE).edit().putString("wear", m).apply(); }

    private MediaSession ms;
    private AudioTrack silence;
    private long lastWearNotif = 0;
    private final Runnable tick = new Runnable() { @Override public void run() { wearTick(); } };

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
        NotificationChannel w = new NotificationChannel(CH_WEAR, "Contador en la pulsera", NotificationManager.IMPORTANCE_DEFAULT);
        w.setDescription("Tiempo que queda de descanso, para que lo muestre el reloj o la pulsera");
        w.setSound(null, null);
        w.enableVibration(false);
        w.setShowBadge(false);
        c.getSystemService(NotificationManager.class).createNotificationChannel(w);
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
                wearStart();
                goForeground();
                arm();
                break;
            case "add":
                if (end > 0) { end += 15000; Notif.schedule(this, end); goForeground(); arm(); lastWearNotif = 0; wearTick(); }
                break;
            case "skip":
            case "stop":
                end = 0;
                wearStop();
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
        wearStop();
        Notif.fire(this);
        quit(2500); // deja terminar el pitido antes de soltar el celular
    }

    // ---------- contador en la pulsera ----------
    private void wearStart() {
        String m = wearMode(this);
        if ("media".equals(m)) mediaStart();
        lastWearNotif = 0;
        h.removeCallbacks(tick);
        if (!"off".equals(m)) wearTick();
    }

    private void wearTick() {
        h.removeCallbacks(tick);
        if (end <= 0) return;
        long left = Math.max(0, end - System.currentTimeMillis());
        String m = wearMode(this);
        String t = "Descanso " + mmss(left);
        if ("media".equals(m) && ms != null) {
            ms.setMetadata(new MediaMetadata.Builder()
                    .putString(MediaMetadata.METADATA_KEY_TITLE, t)
                    .putString(MediaMetadata.METADATA_KEY_ARTIST, next.isEmpty() ? "Rutina" : "Sigue: " + next)
                    .putString(MediaMetadata.METADATA_KEY_ALBUM, "Rutina")
                    .putLong(MediaMetadata.METADATA_KEY_DURATION, -1)
                    .build());
        } else if ("notif".equals(m)) {
            long now = System.currentTimeMillis();
            if (now - lastWearNotif >= 14500 || left < 1500) { lastWearNotif = now; postWear(left); }
        }
        h.postDelayed(tick, 1000 - (left % 1000) + 5);
    }

    private void postWear(long left) {
        try {
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH_WEAR) : new Notification.Builder(this);
            b.setSmallIcon(R.drawable.ic_stat)
                    .setContentTitle("Descanso: quedan " + mmss(Math.round(left / 5000.0) * 5000))
                    .setContentText(next.isEmpty() ? "Rutina" : "Sigue: " + next)
                    .setOnlyAlertOnce(true)
                    .setAutoCancel(true)
                    .setShowWhen(false)
                    .setColor(0xFF0B2A6B)
                    .setCategory(Notification.CATEGORY_REMINDER)
                    .addAction(new Notification.Action.Builder(0, "+15 s", act("add", 11)).build())
                    .addAction(new Notification.Action.Builder(0, "Saltar", act("skip", 12)).build());
            getSystemService(NotificationManager.class).notify(ID_WEAR, b.build());
        } catch (Exception e) { /* sin permiso: nada */ }
    }

    private void mediaStart() {
        try {
            if (ms == null) {
                ms = new MediaSession(this, "rutina-descanso");
                ms.setCallback(new MediaSession.Callback() {
                    @Override public void onSkipToNext() { startService(new Intent(RestService.this, RestService.class).setAction("skip")); }
                    @Override public void onSkipToPrevious() { startService(new Intent(RestService.this, RestService.class).setAction("add")); }
                    @Override public void onFastForward() { onSkipToNext(); }
                    @Override public void onRewind() { onSkipToPrevious(); }
                    @Override public void onPause() { /* no cortar el descanso por error */ }
                    @Override public void onPlay() { }
                });
            }
            ms.setPlaybackState(new PlaybackState.Builder()
                    .setActions(PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS | PlaybackState.ACTION_PLAY_PAUSE)
                    .setState(PlaybackState.STATE_PLAYING, PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1f)
                    .build());
            ms.setActive(true);
            // audio en silencio (sin pedir el foco de audio): marca la sesión como "sonando" sin cortar tu música
            if (silence == null) {
                int rate = 8000, n = AudioTrack.getMinBufferSize(rate, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT) * 2;
                silence = new AudioTrack.Builder()
                        .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_UNKNOWN).build())
                        .setAudioFormat(new AudioFormat.Builder().setSampleRate(rate).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                        .setBufferSizeInBytes(n).setTransferMode(AudioTrack.MODE_STATIC).build();
                silence.write(new short[n / 2], 0, n / 2);
                silence.setLoopPoints(0, n / 2, -1);
                silence.setVolume(0f);
            }
            silence.play();
        } catch (Exception e) { /* si falla, queda el contador del celular */ }
    }

    private void wearStop() {
        h.removeCallbacks(tick);
        try { getSystemService(NotificationManager.class).cancel(ID_WEAR); } catch (Exception e) { /* nada */ }
        try { if (silence != null) { silence.stop(); silence.release(); silence = null; } } catch (Exception e) { /* nada */ }
        try {
            if (ms != null) {
                ms.setPlaybackState(new PlaybackState.Builder().setState(PlaybackState.STATE_STOPPED, 0, 0f).build());
                ms.setActive(false); ms.release(); ms = null;
            }
        } catch (Exception e) { /* nada */ }
    }

    static String mmss(long ms) { long s = (ms + 999) / 1000; return (s / 60) + ":" + String.format(java.util.Locale.ROOT, "%02d", s % 60); }

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
        // (lo mismo que hace NotificationCompat: el pedido va como extra)
        if ("media".equals(wearMode(this)) && ms != null && Build.VERSION.SDK_INT >= 26) {
            b.setStyle(new Notification.MediaStyle().setMediaSession(ms.getSessionToken()).setShowActionsInCompactView(0, 1));
        }
        android.os.Bundle ex = new android.os.Bundle();
        ex.putBoolean("android.requestPromotedOngoing", true);
        b.addExtras(ex);
        return b.build();
    }

    @Override
    public void onDestroy() {
        wearStop();
        h.removeCallbacksAndMessages(null);
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception e) { /* nada */ }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent i) { return null; }
}
