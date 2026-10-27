package uy.marcos.rutina;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Se ejecuta cuando vence la alarma del descanso. */
public class RestReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        final PendingResult pr = goAsync();
        Notif.show(c);
        Notif.beep();
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(pr::finish, 1600);
    }
}
