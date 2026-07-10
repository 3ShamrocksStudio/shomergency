package il.co.shomerapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;

import androidx.core.app.NotificationCompat;

/**
 * UN-SILENCEABLE SOS ALARM — the capability a pure PWA cannot have.
 * Plays the looping SOS alarm on the ALARM audio stream (USAGE_ALARM), which the OS keeps
 * audible even in silent/vibrate/DND, forces the alarm-stream volume to max, holds audio
 * focus, runs as a foreground service (survives backgrounding), and keeps a wake lock +
 * vibration going. So volume-down / mute / the ringer switch can't kill it.
 */
public class AlarmForegroundService extends Service {
  private static final String CH = "shomer_sos";
  private static MediaPlayer mp;
  private AudioManager am;
  private int prevAlarmVol = -1;
  private PowerManager.WakeLock wl;

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Notification n = buildNotification();
    if (Build.VERSION.SDK_INT >= 34) {
      startForeground(1, n, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
    } else {
      startForeground(1, n);
    }
    startAlarm();
    return START_STICKY; // OS restarts it if killed while an SOS is active
  }

  private void startAlarm() {
    try {
      am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
      // Max the ALARM stream (ignores ringer/silent/DND) — remember to restore on stop.
      prevAlarmVol = am.getStreamVolume(AudioManager.STREAM_ALARM);
      am.setStreamVolume(AudioManager.STREAM_ALARM, am.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);

      if (mp != null) { try { mp.stop(); mp.release(); } catch (Exception e) {} mp = null; }
      mp = new MediaPlayer();
      AudioAttributes aa = new AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build();
      mp.setAudioAttributes(aa);
      AssetFileDescriptor afd = getResources().openRawResourceFd(R.raw.sos_alarm);
      mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
      afd.close();
      mp.setLooping(true);
      am.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN);
      mp.prepare();
      mp.start();

      PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
      wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "shomer:sos");
      wl.acquire(10 * 60 * 1000L);

      Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
      if (v != null) {
        long[] pat = {0, 500, 140, 500, 140, 500, 320};
        int[] amp = {0, 255, 0, 255, 0, 255, 0};
        v.vibrate(VibrationEffect.createWaveform(pat, amp, 1)); // repeat from index 1
      }
    } catch (Exception e) { /* never crash the alarm */ }
  }

  private Notification buildNotification() {
    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannel ch = new NotificationChannel(CH, "SHOMER SOS", NotificationManager.IMPORTANCE_HIGH);
      ch.enableVibration(true);
      ch.setBypassDnd(true);
      nm.createNotificationChannel(ch);
    }
    Intent open = new Intent(this, MainActivity.class);
    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    PendingIntent pi = PendingIntent.getActivity(this, 0, open,
        PendingIntent.FLAG_IMMUTABLE);
    return new NotificationCompat.Builder(this, CH)
        .setContentTitle("🚨 SHOMER — SOS")
        .setContentText("Alarm active — tap to open")
        .setSmallIcon(R.mipmap.ic_launcher)
        .setOngoing(true)
        .setContentIntent(pi)
        .setPriority(NotificationCompat.PRIORITY_MAX)
        .setCategory(NotificationCompat.CATEGORY_ALARM)
        .build();
  }

  public static void stopAlarm(Context c) {
    c.stopService(new Intent(c, AlarmForegroundService.class));
  }

  @Override
  public void onDestroy() {
    try { if (mp != null) { mp.stop(); mp.release(); mp = null; } } catch (Exception e) {}
    try { if (am != null && prevAlarmVol >= 0) am.setStreamVolume(AudioManager.STREAM_ALARM, prevAlarmVol, 0); } catch (Exception e) {}
    try { if (wl != null && wl.isHeld()) wl.release(); } catch (Exception e) {}
    try { Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE); if (v != null) v.cancel(); } catch (Exception e) {}
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent intent) { return null; }
}
