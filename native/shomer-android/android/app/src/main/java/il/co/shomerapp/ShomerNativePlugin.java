package il.co.shomerapp;

import android.Manifest;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

/**
 * Bridge the web app (shomer.html) to SHOMER's native capabilities. The web app
 * feature-detects window.Capacitor and calls these; on a plain browser it falls back to the
 * existing Web-Audio alarm and in-app shake — so it's one codebase, additive only.
 */
@CapacitorPlugin(
  name = "ShomerNative",
  permissions = {
    @Permission(alias = "notifications", strings = { "android.permission.POST_NOTIFICATIONS" })
  }
)
public class ShomerNativePlugin extends Plugin {

  @PluginMethod
  public void isNative(PluginCall call) {
    JSObject r = new JSObject();
    r.put("native", true);
    r.put("platform", "android");
    call.resolve(r);
  }

  @PluginMethod
  public void startAlarm(PluginCall call) {
    Intent i = new Intent(getContext(), AlarmForegroundService.class);
    if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(i);
    else getContext().startService(i);
    call.resolve();
  }

  @PluginMethod
  public void stopAlarm(PluginCall call) {
    AlarmForegroundService.stopAlarm(getContext());
    call.resolve();
  }

  @PluginMethod
  public void enableBackgroundShake(PluginCall call) {
    Intent i = new Intent(getContext(), ShakeService.class);
    if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(i);
    else getContext().startService(i);
    call.resolve();
  }

  @PluginMethod
  public void disableBackgroundShake(PluginCall call) {
    getContext().stopService(new Intent(getContext(), ShakeService.class));
    call.resolve();
  }

  @PluginMethod
  public void requestNotifications(PluginCall call) {
    if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
      requestPermissionForAlias("notifications", call, "notifPermCallback");
    } else {
      call.resolve();
    }
  }
}
