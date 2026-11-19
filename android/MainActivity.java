package com.bossxor.callup;

import android.app.Activity;
import android.content.res.AssetManager;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;
import java.util.regex.Pattern;

public final class MainActivity extends Activity {
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final Pattern ASSET_PATH =
            Pattern.compile("/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)+");
    private WebView webView;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        webView.setBackgroundColor(0xfff7f3e8);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setOnApplyWindowInsetsListener((view, insets) -> {
            Insets safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            return WindowInsets.CONSUMED;
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isAppOrigin(request.getUrl());
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                String path = url.getPath();
                if (!isAppOrigin(url) || !"GET".equals(request.getMethod())
                        || path == null || !ASSET_PATH.matcher(path).matches()) {
                    return unavailable();
                }
                String mime = path.endsWith(".js") ? "text/javascript"
                        : path.endsWith(".css") ? "text/css"
                        : path.endsWith(".html") ? "text/html" : "application/octet-stream";
                try {
                    return new WebResourceResponse(mime, "UTF-8",
                            getAssets().open(path.substring(1), AssetManager.ACCESS_STREAMING));
                } catch (IOException error) {
                    return unavailable();
                }
            }
        });
        setContentView(webView);
        webView.loadUrl("https://" + ASSET_HOST + "/index.html");
    }

    private static boolean isAppOrigin(Uri url) {
        return "https".equals(url.getScheme()) && ASSET_HOST.equals(url.getHost())
                && url.getPort() == -1 && url.getUserInfo() == null;
    }

    private static WebResourceResponse unavailable() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, null);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
