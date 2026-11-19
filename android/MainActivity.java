package com.callup.agency;

import android.app.Activity;

import android.net.Uri;
import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.MimeTypeMap;

import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String HOST = "callup.local";

    private WebView game;


    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        game = new WebView(this);
        game.setBackgroundColor(0xff141c29);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setBlockNetworkLoads(true);
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !local(request.getUrl());
            }

            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                String path = url.getPath();
                if (!local(url) || path == null || path.contains("..") || path.contains("\\")) return missing();
                if (path.equals("/")) path = "/index.html";
                String type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(
                    path.substring(path.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT));
                if (path.endsWith(".js")) type = "text/javascript";
                if (path.endsWith(".woff2")) type = "font/woff2";
                try {
                    return new WebResourceResponse(type == null ? "application/octet-stream" : type,
                        "utf-8", getAssets().open("public" + path));
                } catch (IOException ignored) {
                    return missing();
                }
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(android.webkit.ConsoleMessage message) {
                if (message.messageLevel() == android.webkit.ConsoleMessage.MessageLevel.ERROR)
                    android.util.Log.w("CallUp", message.message() + " @" + message.lineNumber());
                return true;
            }
        });
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xff141c29);
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            android.graphics.Insets keyboard = insets.getInsets(WindowInsets.Type.ime());
            view.setPadding(0, 0, 0, keyboard.bottom);
            return insets;
        });
        getWindow().setDecorFitsSystemWindows(false);
        getWindow().getAttributes().layoutInDisplayCutoutMode =
            android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        setContentView(root);
        game.loadUrl("https://" + HOST + "/");
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            WindowInsetsController controller = getWindow().getInsetsController();
            controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            controller.hide(WindowInsets.Type.systemBars());
        }
    }

    private static boolean local(Uri url) {
        return "https".equals(url.getScheme()) && HOST.equals(url.getHost()) && url.getPort() == -1;
    }

    private static WebResourceResponse missing() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
            java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }

    @Override public void onBackPressed() {
        game.evaluateJavascript("window.dispatchEvent(new Event('callup-back'))", null);
    }
}
