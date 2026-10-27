package uy.marcos.rutina;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** La app de rutina (la misma web publicada) dentro de Android, con avisos nativos para el fin del descanso. */
public class MainActivity extends Activity {
    static final String URL = "https://mmendezbonino.github.io/rutina/";
    static final String HOST = "mmendezbonino.github.io";
    private WebView web;
    private ValueCallback<Uri[]> fileCb;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Notif.channel(this);
        web = new WebView(this);
        web.setBackgroundColor(0xFFF4F6FA);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " RutinaAndroid/1");
        web.addJavascriptInterface(new Bridge(), "RutinaNative");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { /* sin app para abrirlo */ }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try { startActivityForResult(p.createIntent(), 7); } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });
        if (state != null) web.restoreState(state); else web.loadUrl(URL);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == 7 && fileCb != null) {
            fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null;
        } else {
            super.onActivityResult(req, res, data);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    /** Lo que la página puede pedirle a Android. */
    class Bridge {
        @JavascriptInterface
        public void scheduleRest(double endMs) { Notif.schedule(MainActivity.this, (long) endMs); }

        @JavascriptInterface
        public void cancelRest() { Notif.cancel(MainActivity.this); }

        @JavascriptInterface
        public void keepScreenOn(final boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        @JavascriptInterface
        public int version() { return 2; }

        /** Estado de los avisos: permiso, importancia del canal y si puede programar la alarma exacta. */
        @JavascriptInterface
        public String status() { return Notif.status(MainActivity.this); }

        /** Abre los ajustes de notificaciones de la app (o pide el permiso si nunca se pidió). */
        @JavascriptInterface
        public void openSettings() {
            runOnUiThread(() -> {
                try {
                    Intent i;
                    if (Build.VERSION.SDK_INT >= 26) {
                        i = new Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                                .putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, getPackageName());
                    } else {
                        i = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
                    }
                    startActivity(i);
                } catch (Exception e) { /* sin pantalla de ajustes */ }
            });
        }

        /** Programa un aviso de prueba dentro de unos segundos. */
        @JavascriptInterface
        public void test(int sec) { Notif.schedule(MainActivity.this, System.currentTimeMillis() + sec * 1000L); }
    }
}
