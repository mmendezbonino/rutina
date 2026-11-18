package uy.marcos.rutina;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.health.connect.HealthConnectException;
import android.health.connect.HealthConnectManager;
import android.health.connect.InsertRecordsResponse;
import android.health.connect.ReadRecordsRequestUsingFilters;
import android.health.connect.ReadRecordsResponse;
import android.health.connect.TimeInstantRangeFilter;
import android.health.connect.datatypes.ActiveCaloriesBurnedRecord;
import android.health.connect.datatypes.BodyFatRecord;
import android.health.connect.datatypes.ExerciseSessionRecord;
import android.health.connect.datatypes.ExerciseSessionType;
import android.health.connect.datatypes.HeartRateRecord;
import android.health.connect.datatypes.Metadata;
import android.health.connect.datatypes.Record;
import android.health.connect.datatypes.SleepSessionRecord;
import android.health.connect.datatypes.TotalCaloriesBurnedRecord;
import android.health.connect.datatypes.WeightRecord;
import android.os.Build;
import android.os.OutcomeReceiver;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Health Connect de Android 14+ (es donde Samsung Health deja los datos de la Galaxy Fit3):
 * lee pulso, calorías, peso, grasa, sueño y ejercicios, y guarda los entrenamientos de la app.
 * Responde a la página con window.__hcCb(id, json).
 */
final class Health {
    static final String[] PERMS = {
            "android.permission.health.READ_HEART_RATE",
            "android.permission.health.READ_ACTIVE_CALORIES_BURNED",
            "android.permission.health.READ_TOTAL_CALORIES_BURNED",
            "android.permission.health.READ_EXERCISE",
            "android.permission.health.WRITE_EXERCISE",
            "android.permission.health.READ_WEIGHT",
            "android.permission.health.READ_BODY_FAT",
            "android.permission.health.READ_SLEEP",
    };
    static final int REQ = 77;

    interface Reply { void send(String id, String json); }

    private final Activity act;
    private final Reply reply;
    private final Executor ex = Executors.newSingleThreadExecutor();

    Health(Activity a, Reply r) { act = a; reply = r; }

    boolean available() {
        if (Build.VERSION.SDK_INT < 34) return false;
        try { return act.getSystemService(HealthConnectManager.class) != null; } catch (Throwable t) { return false; }
    }

    String status() {
        JSONObject o = new JSONObject();
        try {
            o.put("avail", available());
            JSONArray g = new JSONArray();
            if (available()) for (String p : PERMS) if (act.checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED) g.put(p.substring(p.lastIndexOf('.') + 1));
            o.put("granted", g);
            o.put("total", PERMS.length);
        } catch (Exception e) { /* nada */ }
        return o.toString();
    }

    void request() {
        if (!available()) return;
        List<String> miss = new ArrayList<>();
        for (String p : PERMS) if (act.checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) miss.add(p);
        if (miss.isEmpty()) { reply.send("perm", status()); return; }
        act.requestPermissions(miss.toArray(new String[0]), REQ);
    }

    private boolean has(String p) { return act.checkSelfPermission("android.permission.health." + p) == PackageManager.PERMISSION_GRANTED; }

    private <T extends Record> void read(Class<T> type, long from, long to, OutcomeReceiver<List<T>, Exception> out) {
        try {
            HealthConnectManager hcm = act.getSystemService(HealthConnectManager.class);
            ReadRecordsRequestUsingFilters<T> req = new ReadRecordsRequestUsingFilters.Builder<>(type)
                    .setTimeRangeFilter(new TimeInstantRangeFilter.Builder()
                            .setStartTime(Instant.ofEpochMilli(from)).setEndTime(Instant.ofEpochMilli(to)).build())
                    .setPageSize(5000)
                    .build();
            hcm.readRecords(req, ex, new OutcomeReceiver<ReadRecordsResponse<T>, HealthConnectException>() {
                @Override public void onResult(ReadRecordsResponse<T> r) { out.onResult(r.getRecords()); }
                @Override public void onError(HealthConnectException e) { out.onError(e); }
            });
        } catch (Throwable t) { out.onError(new Exception(t)); }
    }

    private void fail(String id, Throwable e) {
        try { reply.send(id, new JSONObject().put("error", String.valueOf(e.getMessage())).toString()); } catch (Exception x) { reply.send(id, "{\"error\":\"?\"}"); }
    }

    /** kind: hr, acal, tcal, weight, fat, ex, sleep. Devuelve {data:[...]} */
    void query(String id, String kind, long from, long to) {
        if (!available()) { fail(id, new Exception("no disponible")); return; }
        try {
            switch (kind) {
                case "hr":
                    if (!has("READ_HEART_RATE")) { fail(id, new Exception("sin permiso")); return; }
                    read(HeartRateRecord.class, from, to, new Out<HeartRateRecord>(id) {
                        @Override void add(HeartRateRecord r, JSONArray a) throws Exception {
                            for (HeartRateRecord.HeartRateSample s : r.getSamples()) {
                                long t = s.getTime().toEpochMilli();
                                if (t >= from && t <= to) a.put(new JSONArray().put(t).put(s.getBeatsPerMinute()));
                            }
                        }
                    });
                    break;
                case "acal":
                    if (!has("READ_ACTIVE_CALORIES_BURNED")) { fail(id, new Exception("sin permiso")); return; }
                    read(ActiveCaloriesBurnedRecord.class, from, to, new Out<ActiveCaloriesBurnedRecord>(id) {
                        @Override void add(ActiveCaloriesBurnedRecord r, JSONArray a) throws Exception {
                            a.put(new JSONArray().put(r.getStartTime().toEpochMilli()).put(r.getEndTime().toEpochMilli()).put(r.getEnergy().getInCalories() / 1000.0));
                        }
                    });
                    break;
                case "tcal":
                    if (!has("READ_TOTAL_CALORIES_BURNED")) { fail(id, new Exception("sin permiso")); return; }
                    read(TotalCaloriesBurnedRecord.class, from, to, new Out<TotalCaloriesBurnedRecord>(id) {
                        @Override void add(TotalCaloriesBurnedRecord r, JSONArray a) throws Exception {
                            a.put(new JSONArray().put(r.getStartTime().toEpochMilli()).put(r.getEndTime().toEpochMilli()).put(r.getEnergy().getInCalories() / 1000.0));
                        }
                    });
                    break;
                case "weight":
                    if (!has("READ_WEIGHT")) { fail(id, new Exception("sin permiso")); return; }
                    read(WeightRecord.class, from, to, new Out<WeightRecord>(id) {
                        @Override void add(WeightRecord r, JSONArray a) throws Exception {
                            a.put(new JSONArray().put(r.getTime().toEpochMilli()).put(r.getWeight().getInGrams() / 1000.0));
                        }
                    });
                    break;
                case "fat":
                    if (!has("READ_BODY_FAT")) { fail(id, new Exception("sin permiso")); return; }
                    read(BodyFatRecord.class, from, to, new Out<BodyFatRecord>(id) {
                        @Override void add(BodyFatRecord r, JSONArray a) throws Exception {
                            a.put(new JSONArray().put(r.getTime().toEpochMilli()).put(r.getPercentage().getValue()));
                        }
                    });
                    break;
                case "ex":
                    if (!has("READ_EXERCISE")) { fail(id, new Exception("sin permiso")); return; }
                    read(ExerciseSessionRecord.class, from, to, new Out<ExerciseSessionRecord>(id) {
                        @Override void add(ExerciseSessionRecord r, JSONArray a) throws Exception {
                            a.put(new JSONArray().put(r.getStartTime().toEpochMilli()).put(r.getEndTime().toEpochMilli())
                                    .put(r.getExerciseType()).put(r.getTitle() == null ? "" : r.getTitle().toString())
                                    .put(r.getMetadata().getDataOrigin().getPackageName()));
                        }
                    });
                    break;
                case "sleep":
                    if (!has("READ_SLEEP")) { fail(id, new Exception("sin permiso")); return; }
                    read(SleepSessionRecord.class, from, to, new Out<SleepSessionRecord>(id) {
                        @Override void add(SleepSessionRecord r, JSONArray a) throws Exception {
                            a.put(new JSONArray().put(r.getStartTime().toEpochMilli()).put(r.getEndTime().toEpochMilli()));
                        }
                    });
                    break;
                default:
                    fail(id, new Exception("tipo desconocido"));
            }
        } catch (Throwable t) { fail(id, t); }
    }

    /** Guarda un entrenamiento de fuerza (aparece en Samsung Health si comparte datos con Health Connect). */
    void writeSession(String id, String clientId, long start, long end, String title, String notes) {
        if (!available() || !has("WRITE_EXERCISE")) { fail(id, new Exception("sin permiso")); return; }
        try {
            HealthConnectManager hcm = act.getSystemService(HealthConnectManager.class);
            Metadata md = new Metadata.Builder().setClientRecordId(clientId).setClientRecordVersion(1).build();
            ExerciseSessionRecord.Builder b = new ExerciseSessionRecord.Builder(md, Instant.ofEpochMilli(start), Instant.ofEpochMilli(end),
                    ExerciseSessionType.EXERCISE_SESSION_TYPE_STRENGTH_TRAINING);
            b.setTitle(title);
            if (notes != null && !notes.isEmpty()) b.setNotes(notes);
            java.time.ZoneOffset off = ZoneId.systemDefault().getRules().getOffset(Instant.ofEpochMilli(start));
            b.setStartZoneOffset(off).setEndZoneOffset(off);
            List<Record> list = new ArrayList<>();
            list.add(b.build());
            hcm.insertRecords(list, ex, new OutcomeReceiver<InsertRecordsResponse, HealthConnectException>() {
                @Override public void onResult(InsertRecordsResponse r) { reply.send(id, "{\"ok\":true}"); }
                @Override public void onError(HealthConnectException e) { fail(id, e); }
            });
        } catch (Throwable t) { fail(id, t); }
    }

    private abstract class Out<T> implements OutcomeReceiver<List<T>, Exception> {
        final String id;
        Out(String id) { this.id = id; }
        abstract void add(T r, JSONArray a) throws Exception;
        @Override public void onResult(List<T> list) {
            try {
                JSONArray a = new JSONArray();
                for (T r : list) add(r, a);
                reply.send(id, new JSONObject().put("data", a).toString());
            } catch (Throwable t) { fail(id, t); }
        }
        @Override public void onError(Exception e) { fail(id, e); }
    }
}
