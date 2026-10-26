package uy.marcos.rutina;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Se ejecuta cuando vence la alarma del descanso. */
public class RestReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) { Notif.show(c); }
}
