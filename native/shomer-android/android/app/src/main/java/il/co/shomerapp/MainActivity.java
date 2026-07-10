package il.co.shomerapp;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Register SHOMER's native bridge BEFORE the web layer loads.
    registerPlugin(ShomerNativePlugin.class);
    super.onCreate(savedInstanceState);

    // If launched by the background shake service, tell the web app to fire an SOS
    // once the bridge/webview is ready.
    String sos = getIntent() != null ? getIntent().getStringExtra("shomer_sos") : null;
    if (sos != null) {
      final String reason = sos.replace("'", "");
      getWindow().getDecorView().postDelayed(() -> {
        try {
          if (getBridge() != null) {
            getBridge().eval("window.__shomerNativeSOS && window.__shomerNativeSOS('" + reason + "');", (v) -> {});
          }
        } catch (Exception e) {}
      }, 1500);
    }
  }
}
